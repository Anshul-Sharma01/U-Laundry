import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SignupPage from './pages/auth/SignupPage'
import AdminRegisterPage from './pages/auth/AdminRegisterPage'
import LoginPage from './pages/auth/LoginPage'
import VerificationPendingPage from './pages/auth/VerificationPendingPage'
import AuthHydrator from './components/AuthHydrator'
import ProtectedRoute from './components/ProtectedRoute'
import NavigationLayout from './layouts/NavigationLayout'
import HomePage from './pages/HomePage'
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
              <Route path="/" element={<HomePage />} />
              {/* Future dashboard routes like /orders, /profile would go here */}
            </Route>
          </Route>
        </Routes>
      </AuthHydrator>
    </Router>
  )
}

export default App;
