import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SignupPage from './pages/auth/SignupPage'
import AdminRegisterPage from './pages/auth/AdminRegisterPage'
import LoginPage from './pages/auth/LoginPage'
import VerificationPendingPage from './pages/auth/VerificationPendingPage'
import AuthHydrator from './components/AuthHydrator'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ModeratorRoute from './components/ModeratorRoute'
import NavigationLayout from './layouts/NavigationLayout'
import HomePage from './pages/HomePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import PendingVerificationsPage from './pages/admin/PendingVerificationsPage'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import OrdersOverviewPage from './pages/admin/OrdersOverviewPage'
import LaundryModeratorPage from './pages/moderator/LaundryModeratorPage'
import ModeratorOrdersPage from './pages/moderator/ModeratorOrdersPage'
import ProfilePage from './pages/ProfilePage'
import "./index.css"

function App() {

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          borderRadius: 'var(--radius-lg)',
        }
      }} />
      <AuthHydrator>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/auth/sign-up" element={<SignupPage />} />
          <Route path="/auth/admin-register" element={<AdminRegisterPage />} />
          <Route path="/auth/sign-in" element={<LoginPage />} />
          <Route path="/auth/verification-pending" element={<VerificationPendingPage />} />

          {/* Protected Routes (Require Login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<NavigationLayout />}>
              {/* Student / General Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Future dashboard routes like /orders would go here */}

              {/* Admin-only Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/pending" element={<PendingVerificationsPage />} />
                <Route path="/admin/users" element={<ManageUsersPage />} />
                <Route path="/admin/orders" element={<OrdersOverviewPage />} />
              </Route>

              {/* Moderator-only Routes */}
              <Route element={<ModeratorRoute />}>
                <Route path="/laundry-moderator" element={<LaundryModeratorPage />} />
                <Route path="/moderator/orders" element={<ModeratorOrdersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthHydrator>
    </Router>
  )
}

export default App;
