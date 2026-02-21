# 🧺 U-Laundry Frontend — Complete Recall Document

> **Purpose**: Reference document for rebuilding the frontend in TypeScript. Every existing feature, flow, API call, state shape, and UI pattern is documented here.

---

## 1. Tech Stack

- **React** (Vite + `@vitejs/plugin-react`)
- **TailwindCSS** (`darkMode: 'class'`)
- **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`)
- **React Router DOM**
- **Axios** (HTTP client)
- **react-hot-toast** (toasts)
- **react-icons** (icons)
- **js-cookie** (cookie management for tokens)
- **jwt-decode**
- **Razorpay** (client SDK via `window.Razorpay`)
- **socket.io-client** (installed but **unused**)
- **jsPDF + jspdf-autotable** (PDF invoice generation)

### Environment Variables
```
VITE_BACKEND_URL=<backend base URL>
VITE_RAZORPAY_KEY=<razorpay key id>
```

---

## 2. All Routes

| Path | Page | Notes |
|---|---|---|
| `/` | HomePage (Dashboard) | |
| `/auth/sign-in` | Signin | |
| `/auth/verify-code` | VerifyCode | OTP page, reads `?identifier=email` |
| `/auth/forgot-password` | ForgotPassword | |
| `/auth/reset-password/:resetToken` | ResetPassword | |
| `/auth/change-password` | ChangePassword | |
| `/user/me` | UserProfile | |
| `/orders/place-new-order` | PlaceOrder | |
| `/orders/my-orders` | UserOrders | |
| `/admin/all-orders` | AllOrders | Moderator only |
| `/denied` | Access Denied | |
| `/*` | 404 NotFound | |

> **Note**: `RequireAuth` component exists but is **NOT used** in `App.jsx`. Routes are currently unprotected on the client side.

---

## 3. Redux Store

### `auth` Slice

**State**: `isLoggedIn`, `userRole`, `userData`, `isCodeVerified` — all synced to localStorage.

**Thunks**:

| Thunk | API Call | Notes |
|---|---|---|
| `registerUserThunk` | `POST users/register` | FormData (multipart, has avatar). On 201 → saves to localStorage |
| `authenticateUserThunk` | `POST users/login` | `{email, password}`. On 200 → navigate to OTP verify page |
| `verifyCodeThunk` | `POST users/verify-code` | `{email, verifyCode}`. On 200 → saves user, navigate to `/` |
| `requestNewVerificationCodeThunk` | `POST users/request-new-code` | `{email}`. Resets OTP timer |
| `logoutUserThunk` | `POST users/logout` | Clears localStorage, navigate to sign-in |
| `getProfileThunk` | `POST users/me` | Fetches current user profile |
| `resetPasswordThunk` | `PATCH users/reset` | `{email}`. Sends password reset email |
| `resetPasswordTokenThunk` | `PATCH users/reset/:resetToken` | `{resetToken, password}` |
| `changePasswordThunk` | `PATCH users/change-password` | `{oldPassword, newPassword}` |
| `updateUserDetailsThunk` | `PATCH users/update` | `{username?, name?}`. Only sends changed fields |
| `updateUserAvatarThunk` | `PATCH users/update-avatar` | FormData with `avatar` file |

### `order` Slice

**State**: `order`, `userOrders[]`, `totalOrders`, `totalPages`, `paymentStatus`

| Thunk | API Call |
|---|---|
| `createOrderThunk` | `POST order/add` — `{moneyAmount, totalClothes, currency}` |
| `verifyPaymentThunk` | `POST order/verify-signature` — `{razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId}` |
| `getUserOrdersHistoryThunk` | `GET order/view/:userId?page=&limit=` |

### `admin` Slice

**State**: `allOrders[]`, `totalOrders`, `totalPages`, `loading`

| Thunk | API Call |
|---|---|
| `fetchAllOrdersThunk` | `GET order/getall?page=&limit=&status=&query=` |
| `updateOrderStatusThunk` | `PATCH order/update/:orderId/:status` — auto-refetches after |

---

## 4. Axios Instance & Token Management

- Base URL from `VITE_BACKEND_URL`, `withCredentials: true`
- **Request interceptor**: Reads `accessToken` from cookie, attaches `Authorization: Bearer <token>`
- **Response interceptor**:
  - `403` → Refresh via `POST /users/refresh-token`. Queues concurrent requests with `isRefreshing` flag
  - `401` → Clears localStorage + cookies, redirects to `/auth/sign-in`

---

## 5. Page-by-Page Breakdown

### Sign In
- **Fields**: Email, Password
- **Flow**: Submit → authenticate → on 200 → navigate to `/auth/verify-code?identifier=email`
- **Guard**: If `isLoggedIn`, auto-redirect to `/`
- **UI**: Centered card with U-Laundry logo, Forgot Password link, Loader on submit

### OTP Verification
- 6-digit OTP input with auto-focus and backspace navigation
- 60-second countdown timer, resend disabled until expired
- Resend resets timer + clears fields
- Email read from `?identifier=` query param

### Forgot Password
- Email input with regex validation → sends reset link email → navigate to sign-in

### Reset Password
- New password input, reset token from URL param → resets password → navigate to sign-in

### Dashboard (Home)
- Welcome banner with user's name
- 3-column layout: **RecentOrders** (last 5 orders) | **QuickLinks** (Place Order, View Orders, Profile) + Notifications card (static placeholder)

### Place Order
- **10 hardcoded clothing items** with name, price, image:
  - Men's T-Shirt ₹100, Women's Dress ₹200, Men's Jacket ₹300, Women's Scarf ₹50, Men's Shirt ₹150, Women's Kurti ₹180, Men's Shorts ₹120, Women's Skirt ₹160, Men's Sweater ₹250, Women's Coat ₹400
- Increment/decrement per item, cart as `{itemId: quantity}`
- Order summary: total clothes + total price
- **Payment flow**: Create order → get `razorpayOrderId` → open Razorpay modal → verify signature → navigate to My Orders

### My Orders
- Paginated (10/page), order cards with: ID, date, status badge, items, total amount
- **Download Receipt** button → generates PDF invoice (jsPDF) with header, user details, itemized table, footer
- Empty state with icon

### User Profile
- Shows: Avatar, Name, Email, Username, Student ID, Father's Name, Hostel, Room, Role
- 3 action buttons opening **modals**:
  - **Update Avatar**: File upload → Cloudinary
  - **Update Profile**: Edit username & name (only sends changed fields)
  - **Change Password**: Navigates to `/auth/change-password`

### Admin — All Orders
- Visible only for `laundry-moderator` role
- **Search** by user name or order ID (no debounce)
- **Filter** dropdown: All / Pending / Order Placed / Prepared / Picked Up / Cancelled
- Order cards in 3-col grid with status update dropdown
- Status dropdown disabled for terminal states (`Picked Up`, `Cancelled`)
- Pagination with Previous/Next
- **Status badge colors**: Yellow=Pending, Blue=Prepared, Green=Picked Up, Red=Cancelled, Purple=Order Placed

---

## 6. Shared Components

| Component | Purpose |
|---|---|
| **NavigationLayout** | Navbar (logo, links, conditional "All Orders" for moderator, Logout, ThemeToggle) + mobile menu (avatar as hamburger trigger) + `<main>` wrapper |
| **ThemeToggle** | Dark/light toggle, persists to localStorage, animated FiMoon/FiSun icons |
| **Loader** | Spinning `BiLoaderAlt` icon + optional text prop (default: "loading...") |
| **DashboardCard** | Reusable card wrapper with `title` prop |
| **Logout** | Red button, dispatches logout, navigates to sign-in |

---

## 7. Utility Helpers

| Helper | Purpose |
|---|---|
| `handlePayment.js` | Opens Razorpay checkout, verifies signature on success, handles failure |
| `generateInvoice.js` | PDF invoice generation (jsPDF + autotable) |
| `toastHandler.js` | Wraps `toast.promise()` — extracts server message from response |
| `regexMatcher.js` | `isEmail()` and `isPassword()` regex validators — **unused** |
| `RequireAuth.jsx` | Route guard (checks `isLoggedIn` + `allowedRoles`) — **unused** |

---

## 8. Data Models (TypeScript-ready)

```ts
interface UserData {
  _id: string;
  username: string;
  studentId: number;
  name: string;
  fatherName: string;
  email: string;
  hostelName: 'BOSE' | 'ARYABHATTA' | 'SARABHAI' | 'CHANKAYA' | 'TERESA' | 'GARGI' | 'KALPANA';
  roomNumber: string;
  avatar: { public_id: string; secure_url: string };
  degreeName: 'BCA' | 'BE' | 'PHARMA' | 'NURS';
  role: 'student' | 'admin' | 'laundry-moderator' | 'guest';
  isCodeVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  user: string | UserData;
  totalClothes: number;
  date: string;
  status: 'Order Placed' | 'Pending' | 'Prepared' | 'Picked Up' | 'Cancelled' | 'Payment left';
  moneyAmount: number;
  moneyPaid: boolean;
  razorpayOrderId?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 9. Known Issues to Fix in Rebuild

1. **No route protection** — `RequireAuth` exists but is unused
2. **Signup is empty** — `Signup.jsx` is a stub
3. **Order model mismatch** — Frontend expects `items[]` and `totalAmount` but backend has `totalClothes` and `moneyAmount`
4. **Hardcoded clothes catalog** — Should come from DB or config
5. **No debounce on admin search** — API call on every keystroke
6. **Socket.IO unused** — Installed but no real-time features
7. **QuickLinks profile path wrong** — Links to `/user/profile` but route is `/user/me`
8. **Inconsistent state access** — Some selectors use `state.auth.data`, others `state.auth.userData`
9. **`getProfileThunk` not handled** — No fulfilled case in the reducer
10. **No signup flow accessible** — Registration exists in thunks/backend but no UI to reach it
