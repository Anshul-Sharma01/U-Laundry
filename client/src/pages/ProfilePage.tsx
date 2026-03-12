
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
    HiUser, HiOutlineEnvelope, HiOutlineIdentification, HiOutlineHome, 
    HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function ProfilePage() {
    const { user } = useSelector((s: RootState) => s.auth);

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
                <div className="text-xl font-bold text-muted animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    const isStudent = user.role === 'student';
    const isAdmin = user.role === 'admin';
    const isModerator = user.role === 'laundry-moderator';

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-8">
            {/* Header Banner */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl overflow-hidden p-8 sm:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 flex-shrink-0 backdrop-blur-sm relative group">
                        {user.avatar?.secure_url ? (
                            <img 
                                src={user.avatar.secure_url} 
                                alt={user.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-black/20">
                                <HiUser className="w-12 h-12 mb-1" />
                                <span className="text-xs font-medium uppercase tracking-wider">No Avatar</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center sm:text-left flex-1 min-w-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 mb-3">
                            <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">
                                {isAdmin ? 'Administrator' : isModerator ? 'Laundry Moderator' : 'Student'}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 truncate">
                            {user.name}
                        </h1>
                        <p className="text-white/80 text-lg font-medium tracking-wide">
                            @{user.username}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Information Card */}
                <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-xl border border-accent/20 hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 rounded-full bg-primary/80" />
                        General Information
                    </h2>
                    <div className="space-y-5">
                        <InfoRow 
                            icon={<HiOutlineEnvelope className="w-5 h-5" />}
                            label="Email Address"
                            value={user.email}
                            color="text-blue-500"
                            bgColor="bg-blue-50"
                        />
                        <InfoRow 
                            icon={<HiUser className="w-5 h-5" />}
                            label="Full Name"
                            value={user.name}
                            color="text-purple-500"
                            bgColor="bg-purple-50"
                        />
                        <InfoRow 
                            icon={<HiOutlineBriefcase className="w-5 h-5" />}
                            label="Account Role"
                            value={user.role || 'N/A'}
                            color="text-emerald-500"
                            bgColor="bg-emerald-50"
                        />
                    </div>
                </div>

                {/* Role Specific Card */}
                {isStudent && (
                    <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-xl border border-accent/20 hover:shadow-2xl transition-shadow duration-300">
                        <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                            <div className="w-2 h-6 rounded-full bg-secondary/80" />
                            Student Details
                        </h2>
                        <div className="space-y-5">
                            <InfoRow 
                                icon={<HiOutlineIdentification className="w-5 h-5" />}
                                label="Student ID"
                                value={user.studentId?.toString() || 'N/A'}
                                color="text-orange-500"
                                bgColor="bg-orange-50"
                            />
                            <InfoRow 
                                icon={<HiOutlineHome className="w-5 h-5" />}
                                label="Hostel & Room"
                                value={`${user.hostelName || 'N/A'} - Room ${user.roomNumber || 'N/A'}`}
                                color="text-indigo-500"
                                bgColor="bg-indigo-50"
                            />
                            <InfoRow 
                                icon={<HiOutlineAcademicCap className="w-5 h-5" />}
                                label="Degree"
                                value={user.degreeName || 'N/A'}
                                color="text-rose-500"
                                bgColor="bg-rose-50"
                            />
                            {user.fatherName && (
                                <InfoRow 
                                    icon={<HiUser className="w-5 h-5" />}
                                    label="Father's Name"
                                    value={user.fatherName}
                                    color="text-cyan-500"
                                    bgColor="bg-cyan-50"
                                />
                            )}
                        </div>
                    </div>
                )}
                
                {/* Status Card (Always visible for balance/layout) */}
                <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-xl border border-accent/20 hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 rounded-full bg-emerald-500/80" />
                        Account Status
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-accent/10">
                            <span className="font-bold text-text/70">Email Verification</span>
                            {user.isVerified ? (
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 rounded-full">Verified</span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 rounded-full">Pending</span>
                            )}
                        </div>
                        {isStudent && (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-accent/10">
                                <span className="font-bold text-text/70">Admin Approval</span>
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                    user.verificationStatus === 'Approved' ? 'text-green-600 bg-green-100' :
                                    user.verificationStatus === 'Rejected' ? 'text-red-600 bg-red-100' :
                                    'text-amber-600 bg-amber-100'
                                }`}>
                                    {user.verificationStatus || 'Pending'}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-accent/10 mt-auto">
                            <span className="text-sm font-medium text-muted">Member Since</span>
                            <span className="text-sm font-bold text-text">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, color, bgColor }: { icon: React.ReactNode, label: string, value: string, color: string, bgColor: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bgColor} ${color}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 border-b border-accent/10 pb-2">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-base font-semibold text-text truncate">{value}</p>
            </div>
        </div>
    );
}
