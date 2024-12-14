import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authenticateUserThunk } from "../../Redux/Slices/authSlice";

function Signin() {

    const [ studentEmail, setstudentEmail ] = useState("");
    const [ studentPassword, setStudentPassword ] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFormSubmission = async(e) => {
        toast.dismiss();
        e.preventDefault();
        if(!studentEmail || !studentPassword){
            toast.error("All Fields are mandatory");
            return;
        }

        const response = await dispatch(authenticateUserThunk({ email : studentEmail, password : studentPassword }))
        if(response?.payload?.statusCode == 200){
            setStudentPassword("");
            setstudentEmail("");
            navigate(`/auth/verify-code?identifier=${studentEmail}`);
        }
    }


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
                        <form onSubmit={handleFormSubmission} className="flex flex-col gap-6 w-[300px]">
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
                            <button
                                type="submit"
                                className="bg-blue-500 w-full px-4 py-2 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </section>
            </section>
        </>
    );
}

export default Signin;
