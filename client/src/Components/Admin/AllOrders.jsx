import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchAllOrdersThunk, updateOrderStatusThunk } from '../../Redux/Slices/adminSlice.js';
import NavigationLayout from '../../NavigationLayout/NavigationLayout.jsx';

function AllOrders() {
    const dispatch = useDispatch();
    const [limit, setLimit] = useState(6);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('');

    // Fetch orders from Redux store
    const orders = useSelector((state) => state?.admin?.allOrders) || [];

    useEffect(() => {
        dispatch(fetchAllOrdersThunk({ page, limit }));
    }, [dispatch, page, limit]); // Re-fetch on page/limit change

    const handleStatusChange = async (orderId, newStatus) => {
        await dispatch(updateOrderStatusThunk({ orderId, status: newStatus }));
        dispatch(fetchAllOrdersThunk({ page, limit })); // Refresh orders
    };
    console.log("Orders for laundry-moderator : ", orders);

    const filteredOrders = filter ? orders.filter(order => order.status === filter) : orders;
    console.log("Filtered orders : ", filteredOrders);

    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
                {/* Header and Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">All Orders</h1>
                    <select
                        className="p-3 border dark:bg-gray-800 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All Orders</option>
                        <option value="Pending">Pending</option>
                        <option value="Prepared">Prepared</option>
                        <option value="Order Placed">Order Placed</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 border-b border-gray-300 dark:border-gray-600">Receipt</th>
                                <th className="p-4 border-b border-gray-300 dark:border-gray-600">Customer</th>
                                <th className="p-4 border-b border-gray-300 dark:border-gray-600">Status</th>
                                <th className="p-4 border-b border-gray-300 dark:border-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-300 dark:border-gray-600">
                                        <td className="p-4">{order.receipt}</td>
                                        <td className="p-4">{order?.user?.name}</td>
                                        <td className="p-4">{order.status}</td>
                                        <td className="p-4">
                                            <select
                                                className={`p-2 border dark:bg-gray-700 rounded shadow-sm focus:ring-2 focus:ring-blue-500 ${order.status === "Picked Up" ? "bg-gray-400 cursor-not-allowed" : ""} ${order.status === "Cancelled" ? "bg-red-800 text-white" : ""}`}
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                disabled={order.status === "Picked Up" || order.status === "Cancelled"}
                                            >
                                                <option value="Order Placed">Order Placed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Prepared">Prepared</option>
                                                <option value="Picked Up">Picked Up</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Payment left">Payment left</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-6">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between mt-6">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className="text-lg font-semibold">Page {page}</span>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={orders.length < limit}
                    >
                        Next
                    </button>
                </div>
            </div>
        </NavigationLayout>
    );
}

export default AllOrders;
