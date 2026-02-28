import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { HiFire, HiClock, HiCheckCircle } from 'react-icons/hi2';

export default function HomePage() {
    const { user } = useSelector((s: RootState) => s.auth);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

            {/* Welcome Header */}
            <div className="mb-10 p-8 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                        {user?.role === 'admin'
                            ? 'Manage laundry orders, verification requests, and system settings from your dashboard.'
                            : 'Track your laundry, schedule pickups, and manage your account easily.'}
                    </p>
                </div>
            </div>

            {/* Stats/Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<HiClock className="text-orange-500" />}
                    title="Pending Loads"
                    value="2"
                    subtitle="Waiting for pickup"
                    bgClass="bg-orange-50"
                />
                <StatCard
                    icon={<HiFire className="text-secondary" />}
                    title="In Progress"
                    value="1"
                    subtitle="Washing right now"
                    bgClass="bg-red-50"
                />
                <StatCard
                    icon={<HiCheckCircle className="text-green-500" />}
                    title="Completed"
                    value="12"
                    subtitle="This month"
                    bgClass="bg-green-50"
                />
            </div>

            {/* Recent Activity placeholder */}
            <div className="bg-surface rounded-3xl shadow-lg border border-accent/20 overflow-hidden">
                <div className="px-6 py-5 border-b border-accent/20 flex justify-between items-center bg-bg/50">
                    <h2 className="text-xl font-bold text-text">Recent Activity</h2>
                    <button className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
                        View All
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <ActivityRow status="completed" label="Load #L-8902 washed & folded" time="2 days ago" />
                        <ActivityRow status="progress" label="Load #L-8903 picked up" time="Yesterday" />
                        <ActivityRow status="pending" label="Account password updated" time="1 hour ago" />
                    </div>
                </div>
            </div>

        </div>
    );
}

function StatCard({ icon, title, value, subtitle, bgClass }: { icon: React.ReactNode, title: string, value: string, subtitle: string, bgClass: string }) {
    return (
        <div className="bg-surface rounded-3xl p-6 shadow-lg border border-accent/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-text/70 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text">{value}</span>
                <span className="text-sm font-medium text-muted">{subtitle}</span>
            </div>
        </div>
    );
}

function ActivityRow({ status, label, time }: { status: 'completed' | 'progress' | 'pending', label: string, time: string }) {
    const getColors = () => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-600 border-green-200';
            case 'progress': return 'bg-red-100 text-secondary border-red-200';
            case 'pending': return 'bg-orange-100 text-orange-600 border-orange-200';
        }
    };

    const getDotColor = () => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'progress': return 'bg-secondary';
            case 'pending': return 'bg-orange-500';
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-bg transition-colors cursor-pointer group border border-transparent hover:border-accent/20">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getColors()}`}>
                <div className={`w-3 h-3 rounded-full ${getDotColor()}`} />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors">{label}</h4>
                <p className="text-sm text-muted font-medium">{time}</p>
            </div>
            <div>
                <svg className="w-5 h-5 text-accent group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}
