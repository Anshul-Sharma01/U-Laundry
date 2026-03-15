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
                            <HiUserGroup size={32} /> Manage Users
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl font-medium">
                            View, search, and manage all system users
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-text flex items-center gap-3 mb-1">
                            <div className="w-2 h-6 rounded-full bg-primary/80" />
                            Search & Filter
                        </h2>
                        <p className="text-muted text-sm">Find users by name, email, username, or student ID</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <HiMagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, username, or ID..."
                                className="w-full pl-11 pr-4 py-3 bg-bg border border-accent/20 rounded-xl text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <HiFunnel size={18} className="text-muted" />
                            {['all', 'student', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 ${
                                        roleFilter === r 
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary shadow-lg' 
                                            : 'bg-bg text-muted border-accent/20 hover:border-primary hover:text-primary hover:bg-surface'
                                    }`}
                                >
                                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted mt-4 font-medium">
                        {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="animate-spin text-primary">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl p-12 text-center">
                        <HiUserGroup size={64} className="mx-auto text-muted/30 mb-4" />
                        <h3 className="text-xl font-bold text-text/70 mb-2">No Users Found</h3>
                        <p className="text-muted text-sm">No users match your search criteria.</p>
                    </div>
                ) : (
                    <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl overflow-hidden">
                        <div className="px-6 sm:px-8 py-6 border-b border-accent/20 bg-bg/50">
                            <h2 className="text-xl font-bold text-text flex items-center gap-3">
                                <div className="w-2 h-6 rounded-full bg-secondary/80" />
                                Users List
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-muted border-b border-accent/20 text-left bg-bg/50">
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">User</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Email</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs hidden md:table-cell">Hostel</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Role</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Status</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => {
                                        const badge = STATUS_BADGE[u.verificationStatus || 'pending'];
                                        const isAdmin = u.role === 'admin';
                                        return (
                                            <tr key={u._id} className={`border-b border-accent/10 last:border-0 hover:bg-bg transition-colors ${isAdmin ? 'bg-violet-50/30' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img src={u.avatar.secure_url} alt="" className={`w-12 h-12 rounded-full object-cover border-2 ${isAdmin ? 'border-violet-400 ring-2 ring-violet-200' : 'border-accent/20'}`} />
                                                            {isAdmin && <HiShieldCheck size={16} className="absolute -bottom-0.5 -right-0.5 text-violet-600 bg-white rounded-full p-0.5" />}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold truncate max-w-[160px] ${isAdmin ? 'text-violet-700' : 'text-text'}`}>{u.name}</p>
                                                            <p className="text-muted text-xs">@{u.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-muted font-medium hidden sm:table-cell">{u.email}</td>
                                                <td className="py-4 px-6 text-muted font-medium hidden md:table-cell">{u.hostelName || '—'}</td>
                                                <td className="py-4 px-6">
                                                    {isAdmin ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                                                            <HiShieldCheck size={14} /> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold uppercase text-muted tracking-wider">{u.role || 'student'}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border`}>
                                                        {u.verificationStatus === 'approved' ? <HiCheckCircle size={14} /> : u.verificationStatus === 'rejected' ? <HiXCircle size={14} /> : <HiClock size={14} />}
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {!isAdmin ? (
                                                        <button
                                                            onClick={() => setDeleteModal({ userId: u._id, name: u.name })}
                                                            className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer"
                                                            title="Delete user"
                                                        >
                                                            <HiTrash size={18} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-violet-400 font-bold">Protected</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal(null)}>
                    <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 border border-accent/20" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-text mb-2">Delete User?</h3>
                        <p className="text-sm text-muted mb-6">Are you sure you want to delete <strong className="text-text">{deleteModal.name}</strong>? This action cannot be undone and will remove all their data.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 bg-bg border border-accent/30 rounded-xl text-sm font-bold text-text cursor-pointer hover:bg-surface transition-all duration-300">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="px-5 py-2.5 bg-red-500 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-red-600 transition-all duration-300 disabled:opacity-50 shadow-lg">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
