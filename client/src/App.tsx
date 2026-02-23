import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SignupPage from './pages/auth/SignupPage'
import LoginPage from './pages/auth/LoginPage'
import VerificationPendingPage from './pages/auth/VerificationPendingPage'
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
      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/auth/sign-up" element={<SignupPage />} />
        <Route path="/auth/sign-in" element={<LoginPage />} />
        <Route path="/auth/verification-pending" element={<VerificationPendingPage />} />
      </Routes>
    </Router>
  )
}

export default App;
