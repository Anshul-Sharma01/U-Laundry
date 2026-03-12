import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

/**
 * ModeratorRoute — Wraps laundry-moderator-only routes.
 * If the logged-in user's role is NOT 'laundry-moderator', redirects to home.
 */
export default function ModeratorRoute() {
    const { user, isHydrating } = useSelector((s: RootState) => s.auth);

    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" className="animate-spin text-primary">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
            </div>
        );
    }

    if (user?.role !== 'laundry-moderator') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
