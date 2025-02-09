import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchAllOrdersThunk, updateOrderStatusThunk } from '../../Redux/Slices/adminSlice.js';

function AllOrders() {
    const dispatch = useDispatch();
    const [limit, setLimit] = useState(10);
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
    console.log("Orders for laudnry-moderator : ", orders);

    const filteredOrders = filter ? orders.filter(order => order.status === filter) : orders;
    console.log("Filtered orders : ", filteredOrders);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-5">
            {/* Header and Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-5">
                <h1 className="text-2xl font-bold">All Orders</h1>
                <select
                    className="p-2 border dark:bg-gray-700 rounded"
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Prepared">Prepared</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Payment left">Payment left</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-200 dark:bg-gray-800">
                        <tr>
                            <th className="p-2">Receipt</th>
                            <th className="p-2">Customer</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order._id} className="border-b border-gray-300 dark:border-gray-700">
                                    <td className="p-2">{order.receipt}</td>
                                    <td className="p-2">{order?.user?.name}</td>
                                    <td className="p-2">{order.status}</td>
                                    <td className="p-2">
                                        <select
                                            className="p-1 border dark:bg-gray-700"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
                                <td colSpan="4" className="text-center p-3">No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-5">
                <button
                    className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    className="px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={orders.length < limit} // Disable if no more orders
                >
                    Next
                </button>
            </div> 
        </div>
    );
}

export default AllOrders;
