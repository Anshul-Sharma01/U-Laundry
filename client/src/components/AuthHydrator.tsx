import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';

/**
 * AuthHydrator
 *
 * Headless wrapper that fires GET /users/me on every page load to restore
 * auth state from the existing cookie session. axiosInstance handles
 * access-token → refresh-token rotation automatically.
 *
 * While hydrating → shows a full-screen branded spinner.
 * Once settled → renders children (the route tree).
 */
export default function AuthHydrator({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const isHydrating = useSelector((s: RootState) => s.auth.isHydrating);

    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);

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
