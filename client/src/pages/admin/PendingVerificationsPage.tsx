import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPendingUsers, approveUser, rejectUser } from '../../store/slices/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
    HiShieldCheck, HiCheckCircle, HiXCircle, HiArrowLeft,
    HiEnvelope, HiHome, HiIdentification, HiAcademicCap,
} from 'react-icons/hi2';

export default function PendingVerificationsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { pendingUsers, isLoading } = useSelector((s: RootState) => s.admin);
    const [rejectModal, setRejectModal] = useState<{ userId: string; name: string } | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => { dispatch(fetchPendingUsers()); }, [dispatch]);

    const handleApprove = async (userId: string) => {
        setActionLoading(userId);
        const result = await dispatch(approveUser(userId));
        setActionLoading(null);
        if (approveUser.fulfilled.match(result)) {
            toast.success('User approved!');
        } else {
            toast.error((result.payload as string) || 'Approval failed');
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(rejectModal.userId);
        const result = await dispatch(rejectUser({ userId: rejectModal.userId, note: rejectNote }));
        setActionLoading(null);
        setRejectModal(null);
        setRejectNote('');
        if (rejectUser.fulfilled.match(result)) {
            toast.success('User rejected');
        } else {
            toast.error((result.payload as string) || 'Rejection failed');
        }
    };

    return (
        <div className="min-h-screen bg-bg">
            {/* Header */}
            <header className="relative bg-primary text-white px-6 py-6 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />
                <div className="max-w-5xl mx-auto relative flex items-center gap-3">
                    <Link to="/admin/dashboard" className="text-white/70 hover:text-white transition-colors">
                        <HiArrowLeft size={20} />
                    </Link>
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Admin</p>
                        <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                            <HiShieldCheck size={24} /> Pending Verifications
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                ) : pendingUsers.length === 0 ? (
                    <div className="text-center py-16">
                        <HiCheckCircle size={48} className="mx-auto text-emerald-400 mb-3" />
                        <h2 className="text-lg font-bold text-text mb-1">All Caught Up!</h2>
                        <p className="text-sm text-muted">There are no pending verification requests right now.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted font-medium">{pendingUsers.length} pending request{pendingUsers.length !== 1 ? 's' : ''}</p>
                        {pendingUsers.map((u) => (
                            <div key={u._id} className="bg-surface rounded-xl border border-accent/40 p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                                {/* Avatar + Info */}
                                <div className="flex items-start gap-3 flex-1">
                                    <img
                                        src={u.avatar.secure_url}
                                        alt={u.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-accent/40 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-text truncate">{u.name}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted">
                                            <span className="flex items-center gap-1"><HiEnvelope size={13} /> {u.email}</span>
                                            {u.studentId && <span className="flex items-center gap-1"><HiIdentification size={13} /> {u.studentId}</span>}
                                            {u.hostelName && <span className="flex items-center gap-1"><HiHome size={13} /> {u.hostelName}{u.roomNumber ? ` — ${u.roomNumber}` : ''}</span>}
                                            {u.degreeName && <span className="flex items-center gap-1"><HiAcademicCap size={13} /> {u.degreeName}</span>}
                                        </div>
                                        <p className="text-[10px] text-muted mt-1">Registered {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleApprove(u._id)}
                                        disabled={actionLoading === u._id}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-50"
                                    >
                                        <HiCheckCircle size={15} /> Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectModal({ userId: u._id, name: u.name })}
                                        disabled={actionLoading === u._id}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-surface text-red-500 border border-red-300 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-red-50 active:scale-[0.97] disabled:opacity-50"
                                    >
                                        <HiXCircle size={15} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Reject Modal ── */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setRejectModal(null)}>
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-text mb-1">Reject {rejectModal.name}?</h3>
                        <p className="text-xs text-muted mb-4">Provide an optional reason for rejection. The user will be notified via email.</p>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            rows={3}
                            className="w-full px-3 py-2.5 bg-bg border border-accent/50 rounded-xl text-sm text-text outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setRejectModal(null)} className="px-4 py-2 bg-surface border border-accent rounded-lg text-sm font-semibold text-text cursor-pointer hover:bg-bg transition-colors">Cancel</button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModal.userId}
                                className="px-4 py-2 bg-red-500 text-white border-none rounded-lg text-sm font-bold cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading === rejectModal.userId ? 'Rejecting...' : 'Reject User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
