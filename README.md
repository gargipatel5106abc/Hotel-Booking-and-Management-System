# 🏨 Aurora Grand - Luxury Hotel Booking & Yield Management System

A production-ready full-stack Hotel Booking Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **SQLite**.

---

## 🌟 Key Features

### 1. 🛡️ Atomic Double-Booking Prevention Engine
- **Strict Query Overlap Formula**:
  $$\text{Unavailable if } (\text{NewCheckIn} < \text{ExistingCheckOut}) \land (\text{NewCheckOut} > \text{ExistingCheckIn})$$
- **Pessimistic Database Transaction Isolation**:
  - Implemented using `prisma.$transaction`.
  - Concurrent race condition attempts trigger an immediate atomic rollback with **HTTP 409 Conflict** (`DOUBLE_BOOKING_PREVENTED`).

### 2. 🔥 Dynamic Surge Pricing & High Demand Engine
- **Hit Velocity Tracking**: Tracks view count and checkout attempts within a 20-minute sliding window.
- **Race Condition Surge Trigger**: When a simultaneous checkout collision occurs, the room category's surge multiplier spikes immediately (e.g. **+25% surge price**), demand is flagged as `CRITICAL_SURGE`, and viewer counts spike.
- **Customer Feedback**:
  - Prominent **"🔥 High Demand Surge Active"** badges.
  - Live active viewer counter (e.g., *"👁️ 14 guests viewing this suite right now"*).
  - Strikethrough psychological anchor pricing (Standard Rack Rate ~~$360~~ vs. Surged Price **$300**).
  - Dynamic surge reason notifications.

### 3. ⚡ Artificial Scarcity & Yield Throttling ("Selling Out Fast" Bias)
- **Client View vs. Manager View Differentiation**:
  - **Client View**: If the hotel has 15 rooms, it displays availability for only 8–10 total rooms, or caps visible suites per tier (e.g. showing only 2 or 3 rooms even if 6 are physically free).
    - Badges: *"⚡ Only 2 rooms left at this price on our site!"*
    - Urgency: *"🔥 Selling out fast: 85% of our inventory has been reserved for your dates."*
  - **Manager View**: Total transparency in the **Yield Intelligence Console**:
    - **Real Available (Truth)**: e.g. 14 rooms available in database.
    - **Customer Perceived (Shown)**: e.g. 6 rooms shown (creating scarcity bias).
    - **Scarcity Deficit**: Identifies exactly how many rooms are withheld.
    - Toggles to adjust visible caps (1, 2, 3, or full visibility) and enable/disable the surge engine.

### 4. 📈 Modern OTA Business & Psychological Techniques
- **Rotating Social Proof Ticker**: Live toasts highlighting recent bookings across global locations (*"Dr. Sophia from San Francisco just booked Room PH-01 2m ago"*).
- **Price-Lock Cart Countdown**: 10:00-minute hold timer in the reservation modal (*"Due to high demand, your rate is locked for 09:45 before release"*).
- **Loss Aversion Upsell on Conflict**: If a user is blocked by a race condition, the system explains the rollback and suggests immediate alternative suites before remaining inventory sells out.

---

## 🌐 Live Access Links

- **Guest Portal:** [http://localhost:3000](http://localhost:3000)
- **Admin & Yield Console:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Yield Telemetry API:** [http://localhost:3000/api/admin/yield](http://localhost:3000/api/admin/yield)
- **Seed / Reset Database:** [http://localhost:3000/api/seed](http://localhost:3000/api/seed)

---

## 🧪 Testing the New Features

### 1. Test Dynamic Surge on Race Condition Collision:
1. Open [http://localhost:3000/admin](http://localhost:3000/admin).
2. Click **"Simulate Race Condition"** in the stress test panel.
3. Observe:
   - Request A is confirmed.
   - Request B is blocked with HTTP 409 Conflict.
   - The Deluxe Ocean View Suite immediately spikes to `CRITICAL_SURGE` with a **+25% price increase** ($240 $\rightarrow$ $300).
4. Open the Guest Portal at [http://localhost:3000](http://localhost:3000) to see the high demand surge banner and updated pricing live!

### 2. Test Artificial Scarcity:
1. In the Manager Console ([http://localhost:3000/admin](http://localhost:3000/admin)), inspect the **"Inventory Masking & Pricing Velocity Telemetry"** card.
2. Note the difference: **Real Available (14 Rooms)** vs. **Shown to Guests (6 Rooms)**.
3. Toggle the *Max Visible per Category* dropdown (e.g., set to 1 or 2 rooms) to adjust the urgency level shown to customers.
