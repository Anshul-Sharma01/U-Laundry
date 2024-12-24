import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateUserDetailsThunk } from "../../Redux/Slices/authSlice";

function UpdateUserDetails({ closeModal }) {
    const userData = useSelector((state) => state?.auth?.userData);
    const [username, setUsername] = useState(userData?.username);
    const [name, setName] = useState(userData?.name);

    const dispatch = useDispatch();

    const handleSubmit = async(e) => {
        e.preventDefault();
        toast.dismiss();
        if(username === userData.username && name === userData.name){
            toast.error("No details changed detected!!");
            return;
        }

        const updatedDetails = {};
        if(username !== userData.username) {
            updatedDetails.username = username;
        }
        if(name !== userData.name) {
            updatedDetails.name = name;
        }

        const res = await dispatch(updateUserDetailsThunk(updatedDetails));
        console.log("Response : ", res);

        closeModal(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 dark:bg-opacity-80">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Update User Details
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 dark:text-gray-300 mb-2"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 dark:text-gray-300 mb-2"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => closeModal(false)} // Close modal on cancel
                            className="mr-4 dark:text-gray-200  dark:hover:bg-gray-600 bg-red-500 text-white hover:bg-red-700 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateUserDetails;
