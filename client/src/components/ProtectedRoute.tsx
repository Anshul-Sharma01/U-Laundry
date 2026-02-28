import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function ProtectedRoute() {
    const { isLoggedIn, isHydrating } = useSelector((s: RootState) => s.auth);
    const location = useLocation();

    if (isHydrating) {
        // While checking auth status via AuthHydrator, show nothing or a full screen loader.
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" className="animate-spin text-primary">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
            </div>
        );
    }

    if (!isLoggedIn) {
        // Redirect to login page and preserve the location the user was trying to reach.
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    // Wrap child routes in an Outlet
    return <Outlet />;
}
