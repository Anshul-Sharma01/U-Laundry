import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllUsers, deleteUser } from '../../store/slices/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import toast from 'react-hot-toast';
import {
    HiUserGroup, HiTrash, HiMagnifyingGlass, HiArrowLeft,
    HiCheckCircle, HiClock, HiXCircle, HiFunnel, HiShieldCheck,
} from 'react-icons/hi2';

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
    approved: { label: 'Verified', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ManageUsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { allUsers, isLoading } = useSelector((s: RootState) => s.admin);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [deleteModal, setDeleteModal] = useState<{ userId: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { dispatch(fetchAllUsers()); }, [dispatch]);

    const filtered = allUsers.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.studentId && String(u.studentId).includes(search));
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        const result = await dispatch(deleteUser(deleteModal.userId));
        setDeleting(false);
        setDeleteModal(null);
        if (deleteUser.fulfilled.match(result)) {
            toast.success('User deleted');
        } else {
            toast.error((result.payload as string) || 'Delete failed');
        }
    };

    return (
        <div className="min-h-screen bg-bg">
            {/* Header */}
            <header className="relative bg-primary text-white px-6 py-6 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-70" />
                <div className="max-w-6xl mx-auto relative flex items-center gap-3">
                    <Link to="/admin/dashboard" className="text-white/70 hover:text-white transition-colors"><HiArrowLeft size={20} /></Link>
                    <div>
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Admin</p>
                        <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2"><HiUserGroup size={24} /> Manage Users</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <HiMagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, username, or ID..."
                            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-accent/50 rounded-xl text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <HiFunnel size={16} className="text-muted" />
                        {['all', 'student', 'admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${roleFilter === r ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-accent/50 hover:border-primary'}`}
                            >
                                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-muted mb-3">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <HiUserGroup size={48} className="mx-auto text-muted/40 mb-3" />
                        <p className="text-sm text-muted">No users match your search.</p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-xl border border-accent/40 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-muted border-b border-accent/30 text-left">
                                    <th className="py-3 px-4 font-semibold">User</th>
                                    <th className="py-3 px-4 font-semibold hidden sm:table-cell">Email</th>
                                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Hostel</th>
                                    <th className="py-3 px-4 font-semibold">Role</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => {
                                    const badge = STATUS_BADGE[u.verificationStatus || 'pending'];
                                    const isAdmin = u.role === 'admin';
                                    return (
                                        <tr key={u._id} className={`border-b border-accent/20 last:border-0 hover:bg-bg/50 transition-colors ${isAdmin ? 'bg-violet-50/40 border-l-[3px] border-l-violet-500' : ''}`}>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative">
                                                        <img src={u.avatar.secure_url} alt="" className={`w-8 h-8 rounded-full object-cover border ${isAdmin ? 'border-violet-400 ring-2 ring-violet-200' : 'border-accent/40'}`} />
                                                        {isAdmin && <HiShieldCheck size={14} className="absolute -bottom-0.5 -right-0.5 text-violet-600 bg-white rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold truncate max-w-[140px] ${isAdmin ? 'text-violet-700' : 'text-text'}`}>{u.name}</p>
                                                        <p className="text-muted text-[10px]">@{u.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-muted hidden sm:table-cell">{u.email}</td>
                                            <td className="py-3 px-4 text-muted hidden md:table-cell">{u.hostelName || '—'}</td>
                                            <td className="py-3 px-4">
                                                {isAdmin ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                                                        <HiShieldCheck size={12} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase text-muted">{u.role || 'student'}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                                                    {u.verificationStatus === 'approved' ? <HiCheckCircle size={12} /> : u.verificationStatus === 'rejected' ? <HiXCircle size={12} /> : <HiClock size={12} />}
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {!isAdmin ? (
                                                    <button
                                                        onClick={() => setDeleteModal({ userId: u._id, name: u.name })}
                                                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                                                        title="Delete user"
                                                    >
                                                        <HiTrash size={16} />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-violet-400 font-medium">Protected</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal(null)}>
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-bold text-text mb-1">Delete User?</h3>
                        <p className="text-sm text-muted mb-4">Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone and will remove all their data.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteModal(null)} className="px-4 py-2 bg-surface border border-accent rounded-lg text-sm font-semibold text-text cursor-pointer hover:bg-bg transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-500 text-white border-none rounded-lg text-sm font-bold cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
