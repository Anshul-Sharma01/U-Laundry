import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';
import socketService from '../helpers/socketService';

/**
 * AuthHydrator
 *
 * Headless wrapper that fires GET /users/me on every page load to restore
 * auth state from the existing cookie session. axiosInstance handles
 * access-token → refresh-token rotation automatically.
 *
 * Also manages the Socket.IO lifecycle:
 *   - Connects when a valid user session is found
 *   - Disconnects when the user logs out (user becomes null)
 *
 * While hydrating → shows a full-screen branded spinner.
 * Once settled → renders children (the route tree).
 */
export default function AuthHydrator({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const isHydrating = useSelector((s: RootState) => s.auth.isHydrating);
    const user = useSelector((s: RootState) => s.auth.user);
    const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);

    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);

    // Connect socket when user is authenticated, disconnect on logout
    useEffect(() => {
        if (isLoggedIn && user?._id && user?.role) {
            socketService.connect(user._id, user.role);
        } else if (!isLoggedIn && !isHydrating) {
            socketService.disconnect();
        }
        // Cleanup on unmount (e.g. full page unload)
        return () => {
            socketService.disconnect();
        };
    }, [isLoggedIn, user?._id, user?.role, isHydrating]);

    if (isHydrating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    className="animate-spin"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="31.4 31.4"
                        strokeLinecap="round"
                        className="text-primary"
                    />
                </svg>
                <p className="text-sm text-muted font-sans">Restoring your session…</p>
            </div>
        );
    }

    return <>{children}</>;
}
