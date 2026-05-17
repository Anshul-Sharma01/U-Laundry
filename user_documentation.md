# User Documentation: U-Laundry

Welcome to **U-Laundry**, the centralized platform designed to streamline the laundry management process for university students and administrators. 

This guide provides step-by-step instructions on how to use the system based on your assigned role.

---

## 1. Student Guide

As a student, you can use U-Laundry to schedule laundry pickups, select specific clothing items, make secure payments, and track the status of your orders in real-time.

### 1.1 Account Creation & Login
1. **Sign Up**: Navigate to the Registration page. Provide your name, university email, and a secure password.
2. **OTP Verification**: A 6-digit One-Time Password (OTP) will be sent to your registered email. Enter this code to verify your account.
3. **Login**: Use your verified email and password to log in. 
4. **Password Reset**: If you forget your password, click "Forgot Password" on the login screen. You will receive an email with a secure link to reset your password.

### 1.2 Managing Your Profile
1. Navigate to the **Profile** section from the main navigation menu.
2. You can update your personal details and upload a profile avatar (which will be securely stored via Cloudinary).
3. Ensure your Hostel and Room details are accurate, as these are used for pickup and delivery.

### 1.3 Placing an Order
1. Go to the **New Order** page.
2. **Select Items**: Browse the catalog of clothing items. Use the (+) and (-) buttons to adjust the quantity of shirts, pants, bedsheets, etc.
3. **Review Cart**: Verify your selections and the total calculated cost.
4. **Select Slot**: Choose an available pickup time slot that is convenient for you.
5. **Checkout**: Click "Proceed to Pay". You will be redirected to the secure **Razorpay** payment gateway.
6. Complete the transaction using UPI, Cards, or NetBanking. Once successful, your order will be confirmed and added to your history.

### 1.4 Tracking Your Order
1. Navigate to the **Orders** or **Dashboard** page.
2. Here, you will see a list of your recent orders. The status will update in real-time (e.g., *Pending*, *Prepared*, *Picked Up*, *Delivered*, *Cancelled*).
3. Click on any specific order to view a detailed breakdown and download a PDF invoice.

---

## 2. Administrator & Moderator Guide

Administrators and Laundry Moderators have access to specialized tools for managing incoming orders, updating statuses, and ensuring smooth operations across the university.

### 2.1 Accessing the Admin Dashboard
- Log in using an account with Admin or Moderator privileges.
- You will be automatically directed to the **Admin Dashboard**. This dashboard is restricted from regular student accounts.

### 2.2 Managing Orders
The primary function of the dashboard is to oversee all active and historical laundry orders across all hostels.

1. **Viewing Orders**: The main table displays all orders in the system, paginated for easy navigation.
2. **Search & Filtering**:
   - Use the **Search Bar** to find specific orders by Student Name, Order ID, or Hostel.
   - Use the **Status Filter** dropdown to view only orders that are currently "Pending", "Prepared", etc.
3. **Updating Order Status**:
   - Locate the order you wish to update.
   - Click the **Update Status** button (or dropdown) next to the order.
   - Select the new status (e.g., changing from *Pending* to *Prepared* once the clothes have been washed and ironed).
   - Once saved, the student will automatically receive a real-time notification regarding the update.

### 2.3 Future AI Features (Upcoming)
In future updates, the Admin dashboard will include an **AI-Powered Analytics** section:
- **Revenue Forecasting**: View predictions for next week's revenue based on historical data.
- **Demand Forecasting**: See AI-generated alerts suggesting which days will have the highest order volume, allowing you to staff the laundry facility accordingly.

---

## Need Help?
If you encounter any bugs, payment failures, or general issues, please utilize the in-app Chatbot for customer support or contact the university IT administration desk.
