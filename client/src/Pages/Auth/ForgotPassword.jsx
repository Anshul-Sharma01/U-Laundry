import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { resetPasswordThunk } from "../../Redux/Slices/authSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Feedback/Loader";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        setIsLoading(true);
        e.preventDefault();
        toast.dismiss();

        if (!email) {
            toast.error("Email is required!");
            setIsLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address!");
            setIsLoading(false);
            return;
        }

        const res = await dispatch(resetPasswordThunk({ email }));
        // console.log("Res  : ", res);
        setIsLoading(false);
        navigate("/auth/sign-in");
    };

    return (
        <>
            <section className="flex flex-col justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-900 px-4">
                <div className="flex flex-col justify-center items-center gap-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                    {/* Heading */}
                    <h1 className="text-2xl font-semibold">Forgot Password</h1>

                    {/* Form */}
                    <form
                        noValidate
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center items-center gap-4 w-full"
                    >
                        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                            Enter your registered email address below. If it is associated with an account, you will receive instructions to reset your password.
                        </p>
                        {/* Email Input */}
                        <div className="w-full">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`bg-blue-500 w-full px-4 py-2 text-white rounded-lg transition-colors ${
                            isLoading ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-400"
                            }`}                                    disabled={isLoading}
                        >
                            {isLoading ? <Loader /> : "Submit"}
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}

export default ForgotPassword;
