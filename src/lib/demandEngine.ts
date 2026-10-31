import { DemandLevel, RoomDemandInfo, YieldSettings } from "./types";

interface HitRecord {
  timestamp: number;
  type: "view" | "race_conflict";
}

interface EngineState {
  hits: Record<string, HitRecord[]>; // roomTypeId -> HitRecord[]
  settings: YieldSettings;
}

declare global {
  // eslint-disable-next-line no-var
  var demandEngineState: EngineState | undefined;
}

const DEFAULT_SETTINGS: YieldSettings = {
  surgePricingEnabled: true,
  scarcityThrottlingEnabled: true,
  scarcityMaxDisplayedPerType: 3, // Shows at most 2 or 3 per tier for high-volume entry suites
  socialProofEnabled: true,
  urgencyBannerEnabled: true,
  baseSurgeIncrement: 0.12, // +12% on high hits
  raceConditionSurgeBoost: 0.20, // +20% on race condition collision
};

const state: EngineState =
  globalThis.demandEngineState ?? {
    hits: {},
    settings: { ...DEFAULT_SETTINGS },
  };

if (process.env.NODE_ENV !== "production") {
  globalThis.demandEngineState = state;
}

const CLEANUP_WINDOW_MS = 20 * 60 * 1000; // 20 minutes sliding window

/**
 * Clean up hits older than sliding window
 */
function pruneOldHits(roomTypeId: string) {
  if (!state.hits[roomTypeId]) return;
  const cutoff = Date.now() - CLEANUP_WINDOW_MS;
  state.hits[roomTypeId] = state.hits[roomTypeId].filter(
    (h) => h.timestamp >= cutoff
  );
}

/**
 * Record a user view or race condition conflict
 */
export function recordHit(
  roomTypeId: string,
  isRaceConflict = false
): RoomDemandInfo {
  if (!state.hits[roomTypeId]) {
    state.hits[roomTypeId] = [];
  }

  state.hits[roomTypeId].push({
    timestamp: Date.now(),
    type: isRaceConflict ? "race_conflict" : "view",
  });

  pruneOldHits(roomTypeId);
  return getDemandInfo(roomTypeId, 10000, 3);
}

/**
 * Get current yield engine settings
 */
export function getYieldSettings(): YieldSettings {
  return { ...state.settings };
}

/**
 * Update yield engine settings (from Manager console)
 */
export function updateYieldSettings(
  newSettings: Partial<YieldSettings>
): YieldSettings {
  state.settings = {
    ...state.settings,
    ...newSettings,
  };
  return { ...state.settings };
}

/**
 * Reset hits and surge for a specific room type or all
 */
export function resetDemand(roomTypeId?: string) {
  if (roomTypeId) {
    state.hits[roomTypeId] = [];
  } else {
    state.hits = {};
  }
}

/**
 * Simulate hits and race condition collision
 */
export function simulateDemandSpike(
  roomTypeId: string,
  hitCount = 5,
  includeRaceConflict = true
) {
  if (!state.hits[roomTypeId]) {
    state.hits[roomTypeId] = [];
  }

  const now = Date.now();
  for (let i = 0; i < hitCount; i++) {
    state.hits[roomTypeId].push({
      timestamp: now - i * 15000,
      type: "view",
    });
  }

  if (includeRaceConflict) {
    state.hits[roomTypeId].push({
      timestamp: now,
      type: "race_conflict",
    });
  }
}

/**
 * Calculate dynamic pricing, demand tier, and believable scarcity info.
 * Real-life rule: Scarcity & sellout pressure is focused primarily on the most affordable & high-velocity suites (entry/mid tier),
 * while ultra-luxury penthouses maintain dignified prestige cues.
 */
export function getDemandInfo(
  roomTypeId: string,
  basePrice: number,
  actualAvailableCount = 1
): RoomDemandInfo {
  pruneOldHits(roomTypeId);
  const records = state.hits[roomTypeId] || [];
  const hitsCount = records.length;
  const recentConflicts = records.filter(
    (r) => r.type === "race_conflict"
  ).length;

  // Determine category tier based on price in INR
  const isAffordableEntryTier = basePrice <= 12000; // Studio Loft, Alpine Chalet
  const isMidTier = basePrice > 12000 && basePrice <= 25000; // Deluxe Ocean, Botanical Villa
  const isUltraLuxuryTier = basePrice > 25000; // Family Suite, Presidential Penthouse

  let surgeMultiplier = 1.0;
  let demandLevel: DemandLevel = "NORMAL";
  let lastSurgeReason = "Standard Seasonal Rate";

  if (state.settings.surgePricingEnabled) {
    if (recentConflicts > 0) {
      // Direct race condition collision always surges
      surgeMultiplier = 1.0 + state.settings.raceConditionSurgeBoost + (recentConflicts > 1 ? 0.08 : 0);
      demandLevel = "CRITICAL_SURGE";
      lastSurgeReason = `Race Condition Collision: ${recentConflicts} concurrent checkout attempt${recentConflicts > 1 ? "s" : ""} prevented`;
    } else if (isAffordableEntryTier && hitsCount >= 5) {
      // High velocity on affordable rooms triggers surge realistically
      surgeMultiplier = 1.0 + state.settings.baseSurgeIncrement + 0.05; // +17%
      demandLevel = "HIGH_DEMAND";
      lastSurgeReason = `High Demand: ${hitsCount} travelers viewing this popular suite`;
    } else if (isAffordableEntryTier && hitsCount >= 2) {
      surgeMultiplier = 1.0 + state.settings.baseSurgeIncrement; // +12%
      demandLevel = "MODERATE";
      lastSurgeReason = `Trending: Elevated booking interest in last 15m`;
    } else if (isMidTier && hitsCount >= 6) {
      surgeMultiplier = 1.0 + state.settings.baseSurgeIncrement;
      demandLevel = "MODERATE";
      lastSurgeReason = `Popular Luxury Choice · Steady Inquiries`;
    }
  }

  // Calculate prices in INR
  const currentCustomerPrice = Math.round(basePrice * surgeMultiplier);
  // Strikethrough rack rate (e.g. standard tariff before seasonal club discount)
  const rackRateAnchorPrice = Math.round(basePrice * 1.25);

  // Active viewers calculation: believable counts
  let activeViewersCount = 2;
  if (isAffordableEntryTier) {
    activeViewersCount = Math.max(3, Math.min(14, 3 + hitsCount * 2 + recentConflicts * 3));
  } else if (isMidTier) {
    activeViewersCount = Math.max(2, Math.min(8, 2 + hitsCount + recentConflicts * 2));
  } else {
    // Ultra-luxury penthouses have low concurrent viewers in real life
    activeViewersCount = Math.max(1, Math.min(4, 1 + recentConflicts * 2));
  }

  // Believable Scarcity Calculation:
  // Apply "Only 2 or 3 left" throttling primarily to the cheapest / high-volume rooms!
  let displayedScarcityCount = actualAvailableCount;
  let scarcityMessage = `${actualAvailableCount} suites available`;

  if (state.settings.scarcityThrottlingEnabled && actualAvailableCount > 1) {
    if (isAffordableEntryTier) {
      // Popular affordable suites: throttle to 2 or 3 to show realistic sellout pressure
      displayedScarcityCount = Math.min(actualAvailableCount, Math.min(2, state.settings.scarcityMaxDisplayedPerType));
      scarcityMessage = `⚡ High Demand: Only ${displayedScarcityCount} rooms left at this price!`;
    } else if (isMidTier) {
      displayedScarcityCount = Math.min(actualAvailableCount, state.settings.scarcityMaxDisplayedPerType);
      scarcityMessage = `Popular Choice · ${displayedScarcityCount} suites remaining for your dates`;
    } else {
      // Ultra-luxury: Prestige messaging, showing natural limited quantity
      displayedScarcityCount = Math.min(actualAvailableCount, 2);
      scarcityMessage = `⭐ Exclusive Signature Tier · Personal Butler Included`;
    }
  }

  return {
    roomTypeId,
    hitsCount,
    recentConflictsCount: recentConflicts,
    surgeMultiplier: Number(surgeMultiplier.toFixed(2)),
    currentCustomerPrice,
    originalBasePrice: basePrice,
    rackRateAnchorPrice,
    demandLevel,
    activeViewersCount,
    lastSurgeReason,
    isHighDemand: demandLevel !== "NORMAL",
    actualAvailableCount,
    displayedScarcityCount,
    scarcityMessage,
  };
}
