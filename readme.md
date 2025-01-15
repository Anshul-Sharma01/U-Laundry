# U-Laundry

## Repository Structure

### Client
```
u-laundry-client/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.js
│   ├── index.js
│   └── styles/
├── .gitignore
├── package.json
└── README.md
```

### Server
```
u-laundry-server/
├── config/
│   ├── db.js
│   ├── keys.js
├── controllers/
├── models/
├── routes/
├── middleware/
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Project Overview
U-Laundry is a web-based application designed to streamline the laundry process for users. It allows users to schedule laundry pickups, track their laundry status, and make payments online.

## Features
- **User Registration and Login**: Secure user authentication and profile management.
- **Laundry Scheduling**: Users can schedule laundry pickups and deliveries.
- **Order Tracking**: Real-time tracking of laundry status.
- **Payment Integration**: Secure online payment options.
- **Notifications**: Email and SMS notifications for order updates.
- **Admin Dashboard**: Manage orders, users, and payments.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment Gateway**: Razorpay
- **Notifications**:  Nodemailer for email

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/u-laundry.git
    ```
2. Navigate to the project directory:
    ```bash
    cd u-laundry
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
        ```
        MONGO_URI=your_mongodb_uri
        STRIPE_SECRET_KEY=your_stripe_secret_key
        TWILIO_ACCOUNT_SID=your_twilio_account_sid
        TWILIO_AUTH_TOKEN=your_twilio_auth_token
        EMAIL_USER=your_email
        EMAIL_PASS=your_email_password
        ```

## Usage
1. Start the development server:
    ```bash
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## Contributing
1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add new feature"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, please contact [your-email@example.com](mailto:your-email@example.com).
