import React, { useEffect, useState } from "react";
import {
    FaReceipt,
    FaTshirt,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrdersHistoryThunk } from "../../Redux/Slices/orderSlice";

const UserOrders = () => {
    const [page, setPage] = useState(1); 
    const limit = 5; 

    const dispatch = useDispatch();
    const userData = useSelector((state) => state?.auth?.userData);
    const orders = useSelector((state) => state?.order?.userOrders);
    const totalOrders = useSelector((state) => state?.order?.totalOrders); 
    const totalPages = useSelector((state) => state?.order?.totalPages); 
    


    const formatDate = (dateStr) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        if (userData?._id) {
            dispatch(
                getUserOrdersHistoryThunk({ userId: userData._id, page, limit })
            );
        }
    }, [dispatch, userData, page]);

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    {/* Heading */}
                    <h1 className="text-3xl font-bold mb-6">
                        Welcome,{" "}
                        <span className="text-blue-500 font-bold capitalize">
                        {userData?.name}
                        </span>
                    </h1>

                    {/* Orders List */}
                    {orders && orders.length > 0 ? (
                        <div className="grid gap-6">
                            {orders.map((order, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col md:flex-row justify-between items-center"
                                >
                                    <div className="flex flex-col md:flex-row items-center md:gap-6">
                                        {/* Order Details */}
                                        <div className="text-sm md:text-base flex flex-col gap-2">
                                            <p className="flex items-center gap-2">
                                                <FaTshirt className="text-blue-500" />
                                                <strong>Total Clothes:</strong> {order.totalClothes}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-green-500" />
                                                <strong>Date:</strong> {formatDate(order.date)}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                {order.status === "Completed" ? (
                                                <FaCheckCircle className="text-green-500" />
                                                ) : (
                                                <FaTimesCircle className="text-red-500" />
                                                )}
                                                <strong>Status:</strong>{" "}
                                                <span
                                                className={`${
                                                    order.status === "Completed"
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                                } font-medium`}
                                                >
                                                {order.status}
                                                </span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FaMoneyBillWave className="text-yellow-500" />
                                                <strong>Total Amount:</strong> ₹{order.moneyAmount / 100}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Receipt Icon */}
                                    <div className="mt-4 md:mt-0">
                                        <a
                                            href={order.receipt}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 flex items-center gap-2"
                                        >
                                            <FaReceipt />
                                            Receipt
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-lg font-medium mb-4">No orders found!</p>
                            <Link
                                to="/orders/place-new-order"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                            >
                                Create Order
                            </Link>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            className={`${
                                page === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            } py-2 px-4 rounded-md font-bold`}
                        >
                            Previous
                        </button>
                        <p className="text-sm">
                            Page {page} of {totalPages}
                        </p>
                        <button
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                            className={`${
                                page === totalPages
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            } py-2 px-4 rounded-md font-bold`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </NavigationLayout>
    );
};

export default UserOrders;
