# Fastor Web — Food Ordering App

A responsive React 18 web application for the Fastor food-ordering experience: phone + OTP verification, home dashboard with live orders and best sellers, and dynamic item detail with live portion pricing and cart management.

---

## 1. Implemented Screens

1. **Signup (`/signup`):**
   - Branded Fastor orange layout with header and subtitle.
   - Fixed `+91` prefix with 10-digit numeric validation.
   - Disabled "Get OTP" until valid 10 digits are entered.
   - On submit, triggers mock OTP dispatch and navigates to verification with phone state.
2. **OTP Verification (`/verify`):**
   - Displays destination phone number (`+91 <phone>`).
   - 6-digit split inputs (`[ ] [ ] [ ] - [ ] [ ] [ ]`) with auto-advance, backspace navigation, and full paste support.
   - Live 30-second countdown timer turning into an active "Resend" button upon expiry.
   - "Continue" button disabled until all 6 digits are provided.
   - Correct demo code (`123456`) authenticates and persists session via Zustand; invalid codes show an inline error and clear boxes.
3. **Home Dashboard (`/`, Protected):**
   - Location header ("Model Town, New Delhi") and personalized user greeting ("Karan").
   - Support call button linking to `tel:+911800123456`.
   - **Best Seller:** Horizontal snap-scrolling row of dishes with price badges (`₹`) on mobile/tablet, expanding to a grid on desktop.
   - **30% OFF Offer Banner:** Promotional card with banner copy, dish imagery, and slide indicators.
   - **Popular Items (Orders):** Active order cards showing dish image, date, item count, and price. Working "Cancel Order" with confirmation dialog and disabled "Track Driver" with "Coming soon" tooltip.
4. **Item Detail (`/items/:id`, Protected):**
   - Large hero image with rounded bottom.
   - Live price computation: `(basePrice + portion.price) * quantity` computed dynamically from state.
   - Accessible quantity stepper (`-` `3` `+`, bounded between 1 and 10).
   - "Personal portion" radio selector with formatted currency deltas and dotted leader connectors.
   - Sticky bottom "Add to cart" bar on mobile; inline desktop button. Merges duplicate cart lines automatically.
5. **Cart Page (`/cart`, Protected):**
   - Line items list with thumbnail, portion name, quantity stepper, and remove action.
   - Order summary with subtotal, delivery fee, and grand total.

---

## 2. Setup & Installation

```powershell
# 1. Navigate to Frontend
cd Frontend

# 2. Install dependencies
npm install

# 3. Create .env file from .env.example
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will launch at **`http://localhost:5173`**.

---

## 3. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Target backend REST API endpoint |
| `VITE_USE_MOCKS` | `true` | Enable MSW browser mock API |

---

## 4. Demo Login Credentials

- **Phone Number:** Any 10-digit number (e.g., `9876543210`)
- **Demo OTP Code:** **`123456`**

---

## 5. Available Scripts

- `npm run dev`: Starts the Vite dev server with MSW mock backend and fast HMR.
- `npm run build`: Type-checks with `tsc` and builds production bundle in `dist/`.
- `npm run preview`: Locally previews the production build.

---

## 6. Architecture & Switching to a Real Backend

```text
src/
├── api/          # fetch wrapper (client.ts) & endpoints (auth, items, orders)
├── app/          # providers, router (router.tsx), ProtectedRoute
├── components/   # shared generic components (Button, PageShell, Spinner, ErrorState)
├── features/     # feature-owned pages, components, and Zustand stores
│   ├── auth/     # SignupPage, OtpPage, auth.store, OtpInput, PhoneField
│   ├── home/     # HomePage, BestSellerList, OfferBanner, OrderCard
│   ├── items/    # ItemDetailPage, QuantityStepper, PortionSelector
│   └── cart/     # CartPage, cart.store
├── hooks/        # useCountdown
├── lib/          # constants (DEMO_OTP, limits) and formatting (formatCurrency)
├── mocks/        # MSW v2 handlers and mock datasets
└── types/        # TypeScript models (Item, Portion, Offer, Order, User)
```

### Switching to a Real Backend
To switch from MSW mocks to a real backend server:
1. In `.env`, set `VITE_USE_MOCKS=false`.
2. Point `VITE_API_URL` to your live server (e.g., `https://api.fastor.com/v1`).
3. App code requires zero changes because all requests already use real `fetch` through `src/api/*`.

---

## 7. Design Decisions & Inconsistencies Handled

- **Currency:** Used Indian Rupee (`₹`) consistently across item prices, portions, and best sellers via `Intl.NumberFormat('en-IN')`.
- **Portions Label:** Used "Slices" instead of "Slides" (e.g. *"Personal (4 Slices)"*).
- **Home Header:** Shows the authenticated user's name ("Karan"). The call button links directly to `tel:+911800123456`. The wallet button is omitted as specified to avoid dead UI.
- **Track Driver:** Rendered disabled with a "Coming soon" tooltip.
- **Cancel Order:** Works with confirmation against the mock API, updating the order to `cancelled`.
- **Device Keyboard:** Uses native `inputMode="numeric"` on phone and OTP inputs.
