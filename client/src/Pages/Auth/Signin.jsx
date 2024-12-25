import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authenticateUserThunk } from "../../Redux/Slices/authSlice";
import Loader from "../../Components/Feedback/Loader";

function Signin() {

    const [ studentEmail, setstudentEmail ] = useState("");
    const [ studentPassword, setStudentPassword ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
    


    const handleFormSubmission = async(e) => {
        toast.dismiss();
        setIsLoading(true);
        e.preventDefault();
        if(!studentEmail || !studentPassword){
            toast.error("All Fields are mandatory");
            setIsLoading(false);
            return;
        }

        const response = await dispatch(authenticateUserThunk({ email : studentEmail, password : studentPassword }))
        if(response?.payload?.statusCode == 200){
            setStudentPassword("");
            setstudentEmail("");
            setIsLoading(false);
            navigate(`/auth/verify-code?identifier=${studentEmail}`);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if(isLoggedIn){
            navigate("/");
        }
    }, [ isLoggedIn, navigate ])


    return (
        <>
            <section className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <section className="flex flex-col justify-center items-center border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg p-8 bg-white dark:bg-gray-800">
                    <div className="flex flex-col justify-center items-center mb-6">
                        <img src="/u-laundry.svg" alt="U-Laundry sign" className="h-[150px] w-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Welcome to U-Laundry
                        </h1>
                    </div>
                    <div className="w-full">
                        <form onSubmit={handleFormSubmission} className="flex flex-col gap-4 w-[300px]">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="id-email"
                                    className="text-gray-700 dark:text-gray-300 text-sm font-medium"
                                >
                                    Email 
                                </label>
                                <input
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter your student ID or email"
                                    value={studentEmail}
                                    onChange={(e) => setstudentEmail(e.target.value)}
                                    id="id-email"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="pass"
                                    className="text-gray-700 dark:text-gray-300 text-sm font-medium"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter your password"
                                    id="pass"
                                    value={studentPassword}
                                    onChange={(e) => setStudentPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <button
                                    type="submit"
                                    className={`bg-blue-500 w-full px-4 py-2 text-white rounded-lg transition-colors ${
                                        isLoading ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-400"
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader /> : "Sign In"}
                                </button>
                                <Link to="/auth/forgot-password" className="text-blue-600">Forgot Password ? </Link>
                            </div>
                        </form>
                    </div>
                </section>
            </section>
        </>
    );
}

export default Signin;
