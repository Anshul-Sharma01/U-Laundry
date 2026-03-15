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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
            {/* Header */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 flex items-center gap-4">
                    <Link to="/admin/dashboard" className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
                        <HiArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                            <HiShieldCheck size={32} /> Pending Verifications
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl font-medium">
                            Review and approve student registration requests
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                ) : pendingUsers.length === 0 ? (
                    <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-12 text-center">
                        <HiCheckCircle size={64} className="mx-auto text-emerald-400 mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-2">All Caught Up! 🎉</h2>
                        <p className="text-muted text-sm">There are no pending verification requests right now.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-6">
                            <h2 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                                <div className="w-2 h-6 rounded-full bg-amber-500/80" />
                                Pending Requests
                            </h2>
                            <p className="text-muted text-sm">{pendingUsers.length} request{pendingUsers.length !== 1 ? 's' : ''} awaiting review</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {pendingUsers.map((u) => (
                                <div key={u._id} className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:shadow-2xl transition-all duration-300">
                                    {/* Avatar + Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <img
                                            src={u.avatar.secure_url}
                                            alt={u.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-accent/20 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-bold text-text truncate mb-2">{u.name}</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                                <div className="flex items-center gap-2 text-sm text-muted">
                                                    <HiEnvelope size={16} className="text-primary" />
                                                    <span className="font-medium truncate">{u.email}</span>
                                                </div>
                                                {u.studentId && (
                                                    <div className="flex items-center gap-2 text-sm text-muted">
                                                        <HiIdentification size={16} className="text-primary" />
                                                        <span className="font-medium">ID: {u.studentId}</span>
                                                    </div>
                                                )}
                                                {u.hostelName && (
                                                    <div className="flex items-center gap-2 text-sm text-muted">
                                                        <HiHome size={16} className="text-primary" />
                                                        <span className="font-medium">{u.hostelName}{u.roomNumber ? `, Room ${u.roomNumber}` : ''}</span>
                                                    </div>
                                                )}
                                                {u.degreeName && (
                                                    <div className="flex items-center gap-2 text-sm text-muted">
                                                        <HiAcademicCap size={16} className="text-primary" />
                                                        <span className="font-medium">{u.degreeName}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted font-medium">
                                                Registered {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => handleApprove(u._id)}
                                            disabled={actionLoading === u._id}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <HiCheckCircle size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectModal({ userId: u._id, name: u.name })}
                                            disabled={actionLoading === u._id}
                                            className="flex items-center gap-2 px-6 py-3 bg-surface text-red-500 border-2 border-red-300 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-red-50 hover:border-red-400 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <HiXCircle size={18} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            {/* ── Reject Modal ── */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setRejectModal(null)}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 border border-accent/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-text mb-2">Reject {rejectModal.name}?</h3>
                        <p className="text-sm text-muted mb-6">Provide an optional reason for rejection. The user will be notified via email.</p>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            rows={4}
                            className="w-full px-4 py-3 bg-bg border border-accent/20 rounded-xl text-sm text-text outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted font-medium"
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setRejectModal(null)} className="px-5 py-2.5 bg-bg border border-accent/30 rounded-xl text-sm font-bold text-text cursor-pointer hover:bg-surface transition-all duration-300">
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModal.userId}
                                className="px-5 py-2.5 bg-red-500 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-red-600 transition-all duration-300 disabled:opacity-50 shadow-lg"
                            >
                                {actionLoading === rejectModal.userId ? 'Rejecting...' : 'Reject User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
