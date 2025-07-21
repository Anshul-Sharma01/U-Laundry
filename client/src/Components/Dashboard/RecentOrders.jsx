import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserOrdersHistoryThunk } from "../../Redux/Slices/orderSlice";
import DashboardCard from "./DashboardCard";
import Loader from "../Feedback/Loader";
import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

function RecentOrders() {
    const dispatch = useDispatch();
    const { _id: userId } = useSelector((state) => state?.auth?.userData);
    const { userOrders, loading, totalOrders } = useSelector((state) => state?.order);

    useEffect(() => {
        if (userId) {
            dispatch(getUserOrdersHistoryThunk({ userId, page: 1, limit: 5 }));
        }
    }, [dispatch, userId]);

    return (
        <DashboardCard title="Recent Orders">
            {loading ? <Loader /> : (
                <>
                    {userOrders && userOrders?.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {userOrders.slice(0, 5).map((order) => (
                                <li key={order?._id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Order #{order._id}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{order?.totalAmount?.toFixed(2)}</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Pending' || order.status === 'Order Placed' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">You have no recent orders.</p>
                    )}
                    {totalOrders > 5 && (
                        <div className="mt-4 text-center">
                            <Link to="/orders/my-orders" className="text-blue-500 hover:underline">
                                View All Orders
                            </Link>
                        </div>
                    )}
                </>
            )}
        </DashboardCard>
    );
}

export default RecentOrders; 