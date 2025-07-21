import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchAllOrdersThunk, updateOrderStatusThunk } from '../../Redux/Slices/adminSlice.js';
import NavigationLayout from '../../NavigationLayout/NavigationLayout.jsx';
import { FaSearch, FaFilter, FaBox, FaUser, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import Loader from '../Feedback/Loader.jsx';

function AllOrders() {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 10;

    const { allOrders, loading, totalOrders, totalPages } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchAllOrdersThunk({ page, limit, status: filter, searchTerm }));
    }, [dispatch, page, limit, filter, searchTerm]);

    const handleStatusChange = (orderId, newStatus) => {
        dispatch(updateOrderStatusThunk({ orderId, status: newStatus }));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); 
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Prepared': return 'bg-blue-100 text-blue-800';
            case 'Picked Up': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Order Placed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">All Orders</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all customer orders.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by User Name or Order ID"
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <FaFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filter}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Order Placed">Order Placed</option>
                                <option value="Prepared">Prepared</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading ? <Loader /> : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allOrders && allOrders.length > 0 ? allOrders.map((order) => (
                                    <div key={order._id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-xl font-bold">Order #{order._id}</h2>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                        <FaCalendarAlt className="mr-2" />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-4">
                                                <p className="flex items-center mb-2"><FaUser className="mr-3 text-blue-500" /> {order.user?.fullName || 'N/A'}</p>
                                                {order.items.map(item => (
                                                    <div key={item._id} className="flex items-center text-sm text-gray-700 dark:text-gray-300 ml-1">
                                                        <FaBox className="mr-3" />
                                                        <span>{item.name} ({item.quantity})</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-lg font-bold flex items-center justify-end"><FaRupeeSign className="mr-1" /> {order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="mt-6">
                                            <select
                                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                disabled={order.status === 'Picked Up' || order.status === 'Cancelled'}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Prepared">Prepared</option>
                                                <option value="Picked Up">Picked Up</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">No orders found.</p>
                                )}
                            </div>

                            {totalOrders > limit && (
                                <div className="flex justify-between items-center mt-8">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">Previous</button>
                                    <span>Page {page} of {totalPages}</span>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </NavigationLayout>
    );
}

export default AllOrders;
