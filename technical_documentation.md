# Technical Documentation: U-Laundry

## 1. System Architecture overview
U-Laundry is built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with a modern architectural pattern tailored for scalability and real-time interaction.

### Tech Stack Details:
- **Frontend**: React.js with TypeScript, built using Vite. It uses Tailwind CSS for utility-first styling and Redux Toolkit for centralized state management. React Router DOM handles SPA navigation.
- **Backend**: Node.js and Express.js forming a robust RESTful API.
- **Database**: MongoDB (managed via MongoDB Atlas) with Mongoose ODM for structured schema definition and data validation.
- **Authentication**: JWT-based session management, employing both Access and Refresh tokens to maintain secure, stateless user sessions. OTP verification handles email validation.
- **Real-Time Communication**: Socket.IO integrates bidirectional real-time events, such as live order status updates.
- **Third-Party Services**:
  - **Razorpay**: Integrated for secure payment processing with server-side HMAC-SHA256 signature verification.
  - **Cloudinary**: Handles user avatar image storage and delivery.
  - **Nodemailer**: Manages transactional emails (OTP, password resets, order confirmations).

---

## 2. Developer Onboarding

### Prerequisites
Before setting up the project locally, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- Git
- MongoDB Atlas account (or a local MongoDB instance)
- Razorpay test account
- Cloudinary account

### Environment Variables (.env)
You will need to configure `.env` files in both the `client` and `server` directories.

**Server Environment Variables (`server/.env`)**:
```env
PORT=5000
MONGODB_URI=<Your_MongoDB_Connection_String>
JWT_SECRET=<Your_Access_Token_Secret>
JWT_REFRESH_SECRET=<Your_Refresh_Token_Secret>
RAZORPAY_KEY_ID=<Your_Razorpay_Key_ID>
RAZORPAY_KEY_SECRET=<Your_Razorpay_Key_Secret>
CLOUDINARY_CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
CLOUDINARY_API_KEY=<Your_Cloudinary_API_Key>
CLOUDINARY_API_SECRET=<Your_Cloudinary_API_Secret>
EMAIL_USER=<Your_SMTP_Email>
EMAIL_PASS=<Your_SMTP_Password>
FRONTEND_URL=http://localhost:5173
```

**Client Environment Variables (`client/.env`)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=<Your_Razorpay_Key_ID>
```

### Installation Steps
1. Clone the repository: `git clone <repository-url>`
2. Install Server dependencies: 
   ```bash
   cd server
   npm install
   ```
3. Install Client dependencies:
   ```bash
   cd ../client
   npm install
   ```
4. Start both servers concurrently or in separate terminal windows:
   - Server: `npm run dev` (starts on port 5000)
   - Client: `npm run dev` (starts on Vite's default port, usually 5173)

---

## 3. System Maintenance & Troubleshooting

### Common Debugging Scenarios
- **JWT Authentication Failures**: Ensure that both `JWT_SECRET` and `JWT_REFRESH_SECRET` are correctly set and differ from each other. If tokens fail to refresh, check the Axios interceptors in the frontend `client/src/services/api.ts`.
- **Razorpay Signature Mismatch**: This usually indicates an issue with `RAZORPAY_KEY_SECRET`. The backend relies on HMAC-SHA256 to verify signatures. Check `server/src/utils/razorpayService.js` for the exact verification logic.
- **WebSocket Disconnections**: If real-time updates stop working, check if the Socket.IO instance on the client is pointing to the correct backend URL.

### Database Backups
- It is strongly recommended to configure automated daily backups in MongoDB Atlas.
- For manual backups, use `mongodump` and `mongorestore` CLI tools.

---

## 4. Future Enhancements & Scope

### 4.1 Deployment Strategy
To make U-Laundry production-ready, the following deployment strategy is recommended:

- **Frontend Deployment (Vercel / Netlify)**: 
  - The Vite-built React application can be seamlessly deployed on Vercel or Netlify. 
  - Configure the build command (`npm run build`) and output directory (`dist`).
  - Set the `VITE_API_URL` environment variable to point to the production backend URL.

- **Backend Deployment (Render / AWS EC2 / DigitalOcean)**:
  - Deploy the Node.js server to Render (for PaaS simplicity) or an AWS EC2 instance (for more control).
  - Use PM2 for process management if deploying to a VPS (e.g., EC2) to ensure the Node application restarts automatically upon failure.
  - Set all production environment variables securely in the host's dashboard.

- **Containerization (Docker)**:
  - Dockerize the application to ensure consistency across environments. Create a `Dockerfile` for both client and server, and a `docker-compose.yml` to orchestrate them alongside an optional local Redis or MongoDB instance.

### 4.2 AI-Based Order Prediction
Integrating Artificial Intelligence will significantly enhance operational efficiency and revenue management.

- **Predictive Analytics Engine**:
  - Implement a Python-based microservice (using **FastAPI** and **scikit-learn** / **TensorFlow**) alongside the existing Node.js backend.
  - **Revenue & Demand Forecasting**: Use historical order data (timestamp, quantity, item types, total amount) to train a time-series forecasting model (e.g., ARIMA or Prophet). This can predict upcoming weekly or monthly revenue and identify peak laundry days.
  - **Smart Scheduling**: Implement a clustering algorithm to identify the busiest pickup/delivery slots and automatically suggest under-utilized slots to students by offering dynamic "off-peak" discounts.

- **Integration**: 
  - The Node.js server will periodically push historical order data to the AI microservice.
  - The Admin Dashboard will fetch these predictive insights from the AI microservice and visualize them using libraries like `Chart.js` or `Recharts`.

### 4.3 Other Planned Enhancements
- **Progressive Web App (PWA)**: Implement Service Workers and a Web App Manifest to allow students to install U-Laundry on their mobile home screens and view order history offline.
- **Gamification**: Introduce a loyalty points system where students earn badges ("Eco Warrior", "Frequent Washer") and points that can be redeemed for discounts.
- **Smart Notification System**: Integrate Twilio for SMS/WhatsApp order updates as a fallback to email notifications.
