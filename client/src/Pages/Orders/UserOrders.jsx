import React, { useEffect, useState } from "react";
import { FaDownload, FaBoxOpen, FaCalendarAlt, FaRupeeSign, FaFileInvoice } from "react-icons/fa";
import { Link } from "react-router-dom";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrdersHistoryThunk } from "../../Redux/Slices/orderSlice";
import generateInvoice from "../../Helpers/generateInvoice";
import Loader from "../../Components/Feedback/Loader";

const UserOrders = () => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const dispatch = useDispatch();
    const { data: user } = useSelector((state) => state.auth);
    const { userOrders, totalOrders, totalPages, loading } = useSelector((state) => state.order);

    useEffect(() => {
        if (user?._id) {
            dispatch(getUserOrdersHistoryThunk({ userId: user._id, page, limit }));
        }
    }, [dispatch, user, page]);

    const handleDownloadReceipt = (order) => {
        generateInvoice(order, user);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">My Orders</h1>
                        <Link to="/orders/place-new-order" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Place New Order
                        </Link>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : userOrders && userOrders.length > 0 ? (
                        <div className="space-y-6">
                            {userOrders.map((order) => (
                                <div key={order._id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order #{order._id}</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                <FaCalendarAlt className="mr-2" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="mt-4 sm:mt-0 text-right">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pending' || order.status === 'Order Placed' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start">
                                        <div className="space-y-2">
                                            {order?.items?.map(item => (
                                                <div key={item._id} className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaBoxOpen className="mr-3 text-blue-500" />
                                                    <span>{item.name} ({item.category}) - {item.quantity} x ₹{item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 sm:mt-0 text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center justify-end">
                                                <FaRupeeSign className="mr-1" /> {order?.totalAmount?.toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => handleDownloadReceipt(order)}
                                                className="mt-2 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                <FaDownload className="mr-2" />
                                                Download Receipt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <FaFileInvoice className="mx-auto text-6xl text-gray-400 dark:text-gray-500" />
                            <h2 className="mt-6 text-2xl font-bold text-gray-800 dark:text-gray-200">No Orders Found</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">You haven't placed any orders yet.</p>
                        </div>
                    )}

                    {totalOrders > limit && (
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <p className="text-sm">
                                Page {page} of {totalPages}
                            </p>
                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages}
                                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </NavigationLayout>
    );
};

export default UserOrders;
