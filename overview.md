Odaro Online Implementation Plan
Goal
Build Odaro Online, a Next.js web application for customers to order from specific companies. It features robust location detection, nearest branch resolution, company-specific branding, and a seamless checkout flow with Google Authentication.

Tech Stack
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS + Shadcn UI (for consistency with dashboard) + clsx/tailwind-merge
State Management: Zustand (Cart, Location, Session)
Auth: NextAuth.js (Google Provider)
Data Fetching: TanStack Query (React Query)
Icons: Lucide React
Maps/Location: Browser Geolocation API + Haversine formula (frontend) or Geospatial query (backend)
Backend: Existing ordaro_api
Architecture & Folder Structure
odaro_online/
├── src/
│ ├── app/
│ │ ├── (public)/
│ │ │ ├── page.tsx # Landing / Company Search
│ │ │ └── search/ # Browse companies
│ │ ├── (ordering)/
│ │ │ ├── [companySlug]/ # Dynamic company route
│ │ │ │ ├── page.tsx # Company Home / Branch Selection
│ │ │ │ ├── menu/ # Menu Page
│ │ │ │ └── layout.tsx # Company layout (Theme provider)
│ │ ├── (checkout)/
│ │ │ ├── checkout/ # Protected Checkout Page
│ │ │ └── success/ # Order Confirmation
│ │ ├── (auth)/
│ │ │ ├── login/ # Custom Login Page
│ │ │ └── api/auth/[...nextauth]/# NextAuth Handler
│ │ ├── (dashboard)/
│ │ │ └── history/ # User Order History
│ ├── components/
│ │ ├── ui/ # Base UI components
│ │ ├── branding/ # Dynamic branding wrapper
│ │ ├── features/
│ │ │ ├── cart/ # Cart drawer/logic
│ │ │ ├── location/ # Location prompting
│ │ │ └── menu/ # Menu items and Categories
│ ├── lib/
│ │ ├── api/ # API Client (Axios)
│ │ ├── auth.ts # NextAuth Config
│ │ ├── store.ts # Zustand Stores
│ │ └── utils.ts # Helpers
│ └── types/ # Shared Types
Core Features Breakdown

1. Project Initialization
   Create new Next.js app in Documents/Ordaro/odaro_online.
   Install dependencies: axios, zustand, next-auth, @tanstack/react-query, lucide-react, class-variance-authority, clsx, tailwind-merge.
   Setup Tailwind and Shadcn UI.
2. Location & Branch Resolution
   Location Hook: useGeoLocation with states (loading, success, error, denied).
   Fallback UI: Modal to request manual address input if geolocation fails.
   Logic:
   Fetch all branches for the company (or use API endpoint for nearest).
   Calculate distance using Haversine formula on client-side (or prefer API if available).
   Store selected branchId in Zustand store.
3. Company Branding
   Theming: Create a CompanyThemeProvider that fetches company config (logo, colors) and applies CSS variables (e.g., --primary-color).
   Layout: Apply these variables to Tailwind config or inline styles on the layout root.
4. Menu & Cart
   Menu Fetching: specific endpoint to fetch menu by branchId.
   Cart Logic:
   Add/Remove items.
   Calculation logic (subtotal).
   Persist to localStorage.
   Validate stock/availability.
5. Authentication (NextAuth)
   Configure Google Provider.
   Callbacks to sync with backend:
   On sign-in, call ordaro_api to upsert TransactionCustomer.
   Add API access token to session.
6. Checkout Flow
   Pre-check: Ensure user is logged in.
   Flow:
   Review Cart.
   Confirm Address (from location) & Delivery/Pickup option.
   Place Order (API Call).
   Redirect to Success.
7. User History
   History Page: Fetch orders for the logged-in TransactionCustomer.
   Reorder: Quick action to add past items to cart.
   Backend Integration Requirements (Assumptions)
   We assume ordaro_api has or needs:
   GET /organizations/:slug (Public)
   GET /verification/branches?organizationId=... (Public)
   GET /verification/menu?branchId=... (Public)
   POST /orders (Authenticated)
   GET /orders/history (Authenticated)
   We likely need to create or verify these endpoints in ordaro_api.
   Step-by-Step Implementation
   Phase 1: API & Backend Prep (Critical)
   Public Endpoints in ordaro_api:
   Create InformationController (or similar) with @Public() endpoints:
   GET /public/organizations/:slug: Get company branding/details.
   GET /public/branches?organizationId=...: Get branches + locations.
   GET /public/menu/:branchId: Get active menu items with overrides.
   Order API:
   Ensure POST /orders can handle "customer" users (via Google Auth token exchange).
   Verify TransactionCustomer creation logic.
   Phase 2: Setup & API Client
   Initialize project.
   Setup API client to talk to ordaro_api.
   Define Types based on
   schema.prisma
   .
   Phase 2: Public Company Pages
   Create [companySlug] layout and CompanyThemeProvider.
   Implement Location Detection modal.
   Build logic to select nearest branch.
   Phase 3: Menu & Cart
   Build Menu UI (Categories, Items, Modals).
   Implement Cart Store (Zustand).
   Phase 4: Auth & Checkout
   Setup NextAuth.
   Build Checkout page.
   Integrate Order Creation API.
   Real-time Tracking:
   Connect to ws://api/orders (Socket.IO).
   Subscribe to order:{orderId} channel.
   Listen for order:status:changed, queue:position:updated, queue:eta:updated.
   Phase 5: Dashboard & Polish
   User History page.
   Search/Browse Companies page.
   Final UI Polish (animations, loading states).
   Feature Flows
   🛒 Ordering Flow (The "Uber Eats" Experience)
   Trigger: User clicks "Checkout".
   API Action: POST /orders is called.
   Instant Feedback: Backend immediately returns a PENDING order with an optimistic ETA (e.g., 15 mins) and Queue Position.
   Validation: User is redirected to odaro_online/checkout/success/{orderId}.
   📡 Real-time Tracking Flow
   Connection: Frontend connects to ws://api.ordaro.cloud/orders (Socket.IO).
   Subscription: Client joins order:{orderId} channel.
   Events:
   order:status:changed: Updates status stepper (Pending -> Preparing -> Ready).
   queue:position:updated: Updates "Position #X in line".
   queue:eta:updated: Adjusts pickup time dynamically based on kitchen load.
   Kitchen Sync: When KDS status changes, frontend updates instantly.
   💳 Payment Flow (Integration with Ordaro Pay)
   Trigger: After order is placed (or during placement).
   Action: User is redirected to pay.ordaro.cloud/pay/{encryptedOrderId} OR we embed the payment form using the same API:
   GET /orders/:id/payment-link to generate QR/Deep Link.
   GET /orders/:id/payment-status to poll for completion.
   Completion: Webhook updates order status -> Socket emits order:paid -> Dashboards update.
