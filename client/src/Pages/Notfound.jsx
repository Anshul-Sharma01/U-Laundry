import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaExclamationTriangle, FaLongArrowAltLeft } from "react-icons/fa";

function NotFound() {

    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100 p-5">
            <FaExclamationTriangle className="text-red-500 dark:text-yellow-400 mb-6" size={80} />
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-lg mb-6">
                Oops! The page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                className="flex items-center gap-2 bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 px-6 py-3 rounded-lg text-lg font-medium transition duration-300"
            >
                <FaHome size={20} />
                Go to Homepage
            </Link>
            <button onClick={() => navigate(-1)} className="flex justify-center items-center gap-4 text-xl bg-red-600 text-white px-10 py-2 m-2 rounded-lg hover:bg-red-800">
                <FaLongArrowAltLeft size={40}/> Go Back
            </button>
        </div>
    );
}

export default NotFound;
