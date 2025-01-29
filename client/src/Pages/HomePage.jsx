import { useSelector } from "react-redux";
import NavigationLayout from "../NavigationLayout/NavigationLayout";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function HomePage() {
    const isCodeVerified = useSelector((state) => state?.auth?.isCodeVerified);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isCodeVerified) {
            navigate("/auth/sign-in");
        }
    }, [isCodeVerified, navigate]); // ✅ Added dependencies to avoid warning

    return (
        <NavigationLayout>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">
                    Welcome to Your Dashboard
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-lg text-center mb-6">
                    Manage your orders and explore more options right from here.
                </p>

                <div className="flex space-x-4">
                    <Link 
                        to="/orders/place-new-order" 
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                    >
                        Create New Order
                    </Link>
                    <Link 
                        to="/orders/my-orders" 
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        View Orders
                    </Link>
                </div>

            </div>
        </NavigationLayout>
    );
}

export default HomePage;
