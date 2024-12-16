import { FaLock } from "react-icons/fa";

function Denied() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-red-500 dark:text-red-400 text-6xl md:text-7xl mb-4">
                    <FaLock />
                </div>

                <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
                    Access Denied
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    You don't have the necessary permissions to view this page.
                </p>

                <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-6 py-2 text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-md transition-colors duration-300"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

export default Denied;
