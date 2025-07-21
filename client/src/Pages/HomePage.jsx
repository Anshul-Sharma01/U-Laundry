import { useSelector } from "react-redux";
import NavigationLayout from "../NavigationLayout/NavigationLayout";
import RecentOrders from "../Components/Dashboard/RecentOrders";
import QuickLinks from "../Components/Dashboard/QuickLinks";
import DashboardCard from "../Components/Dashboard/DashboardCard";

function HomePage() {
    const { data } = useSelector((state) => state.auth);

    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, {data?.fullName || 'User'}!</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Here's a snapshot of your recent activity.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RecentOrders />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <QuickLinks />
                            <DashboardCard title="Notifications">
                                <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>
                            </DashboardCard>
                        </div>
                    </div>
                </div>
            </div>
        </NavigationLayout>
    );
}

export default HomePage;
