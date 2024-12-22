import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPasswordTokenThunk } from "../../Redux/Slices/authSlice";

function ResetPassword() {
    const [ password, setPassword ] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { resetToken } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!password){
            toast.error("Please enter new password");
            return;
        }
        const res = await dispatch(resetPasswordTokenThunk({ resetToken, password  }));
        navigate("/auth/sign-in");
    };

    return (
        <>
            <section className="flex flex-col justify-center items-center min-h-screen dark:bg-gray-700">
                <div className="flex flex-col justify-center items-center gap-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Reset Password
                    </h1>

                    {/* Description */}
                    <p className="text-center text-base text-gray-700 dark:text-gray-300">
                        Please enter a new password below to reset your account access.
                    </p>

                    {/* Form */}
                    <form
                        noValidate
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center items-center gap-6 w-full"
                    >
                        {/* Password Input */}
                        <div className="w-full relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full p-3 border-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
                                required
                            />
                            <span className="absolute right-3 top-3 text-gray-400 dark:text-gray-500">
                                🔒
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-500 hover:bg-blue-900 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
                        >
                            Reset Password
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Remembered your password?{" "}
                        <button
                            onClick={() => navigate("/auth/sign-in")}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Login here
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ResetPassword;
