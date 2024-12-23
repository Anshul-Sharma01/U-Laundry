import { useSelector } from "react-redux";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import UpdateAvatar from "../../Components/Profile/UpdateAvatar";

function UserProfile() {
    const [ showAvatarModal, setShowAvatarModal ] = useState(false);

    const userData = useSelector((state) => state?.auth?.userData);
    const navigate = useNavigate();





    return (
        <NavigationLayout>
            <section className="dark:bg-gray-900 bg-gray-100 min-h-screen flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-lg w-full p-6 md:p-8">
                    <div className="flex flex-col items-center">
                        {/* Avatar Section */}
                        <div className="w-28 h-28 mb-4">
                            <img
                                src={userData?.avatar?.secure_url || "https://via.placeholder.com/150"} 
                                alt="User Avatar"
                                className="rounded-full w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                            {userData?.name || "John Doe"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            {userData?.email || "john.doe@example.com"}
                        </p>

                        <div className="w-full">
                            {[
                                { label: "Student ID", value: userData?.studentId || "N/A" },
                                { label: "Father's Name", value: userData?.fatherName || "N/A" },
                                { label: "Hostel Name", value: userData?.hostelName || "N/A" },
                                { label: "Room Number", value: userData?.roomNumber || "N/A" },
                                { label: "Role", value: userData?.role || "N/A" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between py-2 border-b dark:border-gray-700"
                                >
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {item.label}:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4 w-full">
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                className="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
                            >
                                Update Avatar
                            </button>
                            <button
                                onClick={() => alert("Update Profile Clicked")}
                                className="w-full md:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition"
                            >
                                Update Profile
                            </button>
                            <button
                                onClick={() => navigate("/auth/change-password")}
                                className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showAvatarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setShowAvatarModal(false)} // Close modal on click outside
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
                    >
                        <UpdateAvatar setShowModal={setShowAvatarModal} />
                    </div>
                </div>
            )}
        </NavigationLayout>
    );
}

export default UserProfile;
