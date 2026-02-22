# U-Laundry: University Laundry Management System

## Synopsis

**Project Title**: U-Laundry — A Web-Based University Laundry Management System

**Domain**: Web Application Development (Full-Stack)

**Specialization**: Service Digitalization & Real-Time Management Systems

---

## 1. Introduction

### 1.1 Problem Statement

In most universities and colleges, the laundry management process remains manual and unorganized. Students are required to physically visit the laundry facility, submit their clothes, track the status through word of mouth, and often face issues such as lost garments, delayed pickups, and lack of transparent pricing. The laundry staff, on the other hand, struggles with managing a large volume of orders, maintaining records, and coordinating pickups and deliveries across multiple hostels. There is no centralized system for order tracking, payment processing, or communication between students and the laundry service.

This absence of digitalization leads to inefficiency, dissatisfaction among students, and operational overhead for the university administration. The need for a structured, transparent, and user-friendly system to manage the end-to-end laundry workflow is evident.

### 1.2 Proposed Solution

**U-Laundry** is a full-stack web application designed to digitalize and streamline the entire laundry management process within a university campus. It acts as a centralized platform where students can place laundry orders, select clothing items, make secure online payments, and track the real-time status of their orders. On the administrative side, laundry moderators can view all incoming orders, update their statuses, filter and search through orders, and manage operations efficiently.

The system introduces role-based access control (student, admin, and laundry-moderator roles), ensuring that each user only accesses features relevant to their responsibilities. The application is built with a modern tech stack and follows industry-standard practices including JWT-based authentication with access and refresh token rotation, OTP-based email verification, and secure payment processing through Razorpay.

### 1.3 Project Objectives

1. To eliminate the manual and paper-based laundry management process in universities.
2. To provide students with a seamless interface for placing laundry orders, making payments, and tracking order status.
3. To equip laundry moderators with tools for real-time order management, status updates, search, and filtering.
4. To implement secure authentication mechanisms including OTP verification, password reset via email, and JWT-based session management with automatic token refresh.
5. To integrate a payment gateway (Razorpay) for cashless transactions with signature verification and receipt generation.
6. To build a scalable, maintainable, and responsive web application using modern full-stack technologies.
7. To implement features such as real-time notifications (Socket.IO), slot-based scheduling, analytics dashboard, and feedback systems to enhance the overall user experience.

### 1.4 Technologies Used

**Frontend**:
- **React.js with TypeScript** — A component-based JavaScript library for building interactive user interfaces. TypeScript adds static type checking, improving code quality and developer experience.
- **Vite** — A next-generation build tool providing fast development server startup and hot module replacement (HMR).
- **Tailwind CSS** — A utility-first CSS framework enabling rapid UI development with support for dark mode (`class` strategy).
- **Redux Toolkit** — A state management library for predictable and centralized application state, used with `createAsyncThunk` for handling asynchronous API calls.
- **React Router DOM** — Client-side routing for single-page application (SPA) navigation.
- **Axios** — HTTP client with interceptor support for automatic token attachment and refresh token rotation.
- **Socket.IO Client** — For establishing WebSocket connections enabling real-time, bidirectional communication between server and client.

**Backend**:
- **Node.js** — A JavaScript runtime built on Chrome's V8 engine, enabling server-side execution of JavaScript.
- **Express.js** — A minimal and flexible web application framework for building RESTful APIs.
- **MongoDB with Mongoose** — A NoSQL document database paired with Mongoose ODM (Object Data Modeling) for schema definition, validation, and query building.
- **JWT (JSON Web Tokens)** — Used for stateless authentication with access token and refresh token mechanism.
- **Razorpay** — A payment gateway for processing secure online transactions in INR, with server-side order creation and HMAC-SHA256 signature verification.
- **Cloudinary** — A cloud-based image management service for storing and serving user avatar images.
- **Nodemailer** — For sending transactional emails including OTP verification codes, password reset links, and order confirmation emails.
- **Multer** — Middleware for handling `multipart/form-data` (file uploads).

**Other Technical Terms**:
- **REST API** — Representational State Transfer, an architectural style for designing networked applications using standard HTTP methods.
- **OTP (One-Time Password)** — A time-sensitive verification code sent via email for two-factor authentication during login.
- **HMAC-SHA256** — A cryptographic hash function used for verifying the integrity and authenticity of Razorpay payment signatures.
- **CORS (Cross-Origin Resource Sharing)** — A security mechanism that allows controlled access to resources from different origins.
- **RBAC (Role-Based Access Control)** — An access control method where permissions are assigned based on user roles (student, admin, laundry-moderator).
- **WebSocket** — A communication protocol enabling full-duplex, persistent connections between client and server for real-time data exchange.

### 1.5 Key Features

| Module | Features |
|---|---|
| **Authentication** | Email/password login, 6-digit OTP email verification, forgot/reset password via token-based email link, automatic access/refresh token rotation |
| **Student Dashboard** | Recent orders overview, quick action links, notification area |
| **Order Management** | Clothing item selection with pricing, cart system, Razorpay payment integration, order history with pagination, PDF invoice download |
| **Profile Management** | View/edit profile details, avatar upload via Cloudinary, change password |
| **Admin/Moderator Panel** | View all orders with search and filter, update order status (Pending → Prepared → Picked Up / Cancelled), paginated order management |
| **Real-Time Features** | Socket.IO-based live order status updates, in-app notification system |
| **Scheduling** | Slot-based pickup time selection with capacity management |
| **Analytics** | Revenue charts, order trends, hostel-wise breakdown, status distribution |
| **Feedback** | Post-order star rating and review system |
| **UI/UX** | Dark/light theme toggle (persisted), responsive design, toast notifications |

---

## 2. Literature Survey

A comprehensive review of existing laundry management systems and related academic work was conducted to understand the current landscape and identify gaps that U-Laundry aims to address.

### 2.1 Existing Systems & Related Work

**1. LaundryWala / PickMyLaundry (Commercial Apps)**
Commercial laundry aggregator platforms like LaundryWala and PickMyLaundry operate in the consumer market, allowing users to schedule laundry pickups, track orders, and pay online. These applications serve urban households and utilize GPS-based delivery tracking, multiple payment gateways, and driver assignment algorithms. However, they are designed for a B2C (Business-to-Consumer) model and are not tailored for the university ecosystem where the laundry facility is on-campus, students live in hostels, and the service is managed internally by the institution. U-Laundry addresses this gap by providing a campus-specific solution with hostel-wise management and role-based access for university staff.

**2. Laundry Management System by Tumbledry**
Tumbledry offers a franchise-based laundry management solution with POS (Point of Sale) systems, barcode-based garment tracking, and CRM integration. While feature-rich for commercial laundry businesses, such systems are over-engineered and expensive for university deployments. They require dedicated hardware (barcode scanners, POS terminals) and staff training, making them impractical for educational institutions operating on limited budgets. U-Laundry offers a lightweight, web-based alternative requiring only a browser.

**3. "Smart Laundry Management System Using IoT" — Research Paper**
Researchers have proposed IoT-based laundry systems that use sensors to detect machine availability, monitor wash cycles, and send notifications upon completion (e.g., studies published in International Journal of Engineering Research & Technology). These systems focus on washing machine monitoring in shared laundry rooms, which is common in Western universities. In contrast, Indian universities typically have centralized laundry services where students submit clothes to staff. U-Laundry is designed for this submission-based model, focusing on order placement, tracking, and payment rather than machine monitoring.

**4. "Online Laundry Management System" — Academic Projects**
Several academic projects documented on platforms like IEEE Xplore and ResearchGate have explored web-based laundry management systems. A notable example is the "Automated Laundry Management System" (2019) which implemented order tracking using PHP and MySQL. Another is the "E-Laundry System" (2020) built with basic HTML/CSS and a servlet backend. While these projects demonstrated the feasibility of digitizing laundry workflows, they typically lack modern features such as real-time updates (WebSockets), secure token-based authentication (JWT), responsive design, and integrated payment gateways. U-Laundry builds upon these concepts using a modern MERN stack with industry-standard security practices.

**5. University ERP Modules**
Some universities integrate laundry management as a module within their existing ERP (Enterprise Resource Planning) systems. These modules are typically rigid, difficult to customize, and offer a poor user experience due to their monolithic architecture. U-Laundry is designed as a standalone, modular microservice that can operate independently or be integrated with existing university systems through its RESTful API.

### 2.2 Gaps Identified

| Gap | How U-Laundry Addresses It |
|---|---|
| No campus-specific laundry solution | Built specifically for the university hostel ecosystem with role-based access |
| Lack of modern tech stack in academic projects | Uses MERN stack with TypeScript, JWT auth, and real-time capabilities |
| No integrated payment in existing systems | Razorpay integration with server-side signature verification |
| Poor mobile responsiveness | Responsive design using Tailwind CSS with dark mode support |
| No real-time order tracking | Socket.IO integration for live status updates |
| No feedback mechanism | Post-order rating and review system for continuous service improvement |

---

## 3. Methodology / Planning of Work

The project follows the **Agile Software Development** methodology with iterative development cycles. The work is divided into the following phases:

### Phase 1: Requirement Analysis & Planning
- Identify pain points in the existing manual laundry system
- Define functional and non-functional requirements
- Design the database schema (User, Order, Notification, Feedback models)
- Plan the API endpoints and define request/response contracts

### Phase 2: Backend Development
- Set up Node.js + Express server with MongoDB connection
- Implement user authentication (registration, login, OTP verification, JWT token management)
- Build order management APIs (create, update status, fetch by user/status, cancel)
- Integrate Razorpay payment gateway with signature verification
- Set up Cloudinary for image uploads and Nodemailer for email services
- Add role-based middleware for access control

### Phase 3: Frontend Development
- Initialize React + TypeScript project with Vite and Tailwind CSS
- Set up Redux Toolkit store with typed slices for auth, order, and admin
- Build authentication pages (sign-in, OTP verify, forgot/reset password)
- Develop dashboard, order placement (with Razorpay checkout), order history, and profile pages
- Create admin panel with search, filter, pagination, and status update functionality
- Implement dark/light theme toggle and responsive layouts

### Phase 4: Advanced Feature Integration
- Implement Socket.IO for real-time order tracking and notifications
- Build slot-based scheduling system with calendar UI
- Create analytics dashboard with data visualization (charts and graphs)
- Add feedback and rating system
- Implement QR code–based order pickup verification

### Phase 5: Testing & Deployment
- Conduct unit testing and integration testing
- Perform UI/UX review and responsiveness testing across devices
- Fix identified bugs and optimize performance
- Prepare documentation and deploy the application

---

## 4. Facilities Required

### Software
| Software | Purpose |
|---|---|
| VS Code | Code editor / IDE |
| Node.js | JavaScript runtime for backend |
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Git & GitHub | Version control and repository hosting |
| Postman | API testing and development |
| Google Chrome | Browser for development and testing |
| Razorpay Dashboard | Payment gateway configuration and testing |
| Cloudinary Dashboard | Image storage configuration |

### Hardware
| Component | Minimum Requirement |
|---|---|
| Processor | Intel Core i5 or equivalent |
| RAM | 8 GB |
| Storage | 256 GB SSD |
| Internet | Stable broadband connection |
| Display | 1920×1080 resolution |

---

## 5. References

1. React Official Documentation — https://react.dev/
2. Node.js Documentation — https://nodejs.org/en/docs/
3. Express.js Guide — https://expressjs.com/en/guide/routing.html
4. MongoDB Manual — https://www.mongodb.com/docs/manual/
5. Mongoose ODM Documentation — https://mongoosejs.com/docs/
6. Redux Toolkit Documentation — https://redux-toolkit.js.org/
7. Tailwind CSS Documentation — https://tailwindcss.com/docs
8. Razorpay Integration Guide — https://razorpay.com/docs/
9. Socket.IO Documentation — https://socket.io/docs/v4/
10. Cloudinary Node.js SDK — https://cloudinary.com/documentation/node_integration
11. JSON Web Tokens (JWT) Introduction — https://jwt.io/introduction
12. Vite Build Tool — https://vitejs.dev/guide/
13. TypeScript Handbook — https://www.typescriptlang.org/docs/handbook/
14. Nodemailer Documentation — https://nodemailer.com/about/
15. Chart.js Documentation — https://www.chartjs.org/docs/latest/
