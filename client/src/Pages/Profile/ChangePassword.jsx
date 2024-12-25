import { useState } from "react";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePasswordThunk } from "../../Redux/Slices/authSlice";
import Loader from "../../Components/Feedback/Loader";

function ChangePassword() {
    const [formData, setFormData] = useState({ oldPassword: "", newPassword: "" });
    const [ isLoading, setIsLoading ] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async(e) => {
        setIsLoading(true);
        e.preventDefault();
        toast.dismiss();

        // Validation
        if (!formData.oldPassword || !formData.newPassword) {
            toast.error("All the fields are mandatory!");
            setIsLoading(false);
            return;
        }

        const res = await dispatch(changePasswordThunk({oldPassword : formData.oldPassword, newPassword : formData.newPassword}));
        // console.log("response for change password : ", res);
        setFormData({ oldPassword : "", newPassword : "" });
        setIsLoading(false);
    };

    return (
        <div className="dark:bg-gray-900 dark:text-white bg-white text-gray-900 min-h-screen">
            <NavigationLayout>
                <div className="flex justify-center items-center h-[80vh] px-4">
                    <section className="flex flex-col justify-center items-center gap-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                        <h1 className="text-2xl font-semibold">Change Password</h1>
                        <form
                            noValidate
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 w-full"
                        >
                            {/* Old Password Input */}
                            <div className="flex flex-col">
                                <label
                                    htmlFor="oldPassword"
                                    className="mb-1 text-sm font-medium"
                                >
                                    Old Password
                                </label>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter old password"
                                    required
                                />
                            </div>

                            {/* New Password Input */}
                            <div className="flex flex-col">
                                <label
                                    htmlFor="newPassword"
                                    className="mb-1 text-sm font-medium"
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`p-2 text-white rounded transition flex flex-row justify-center items-center gap-2 ${
                                    isLoading ? "bg-gray-400 text-black cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader/> : "Submit"}
                            </button>
                        </form>
                    </section>
                </div>
            </NavigationLayout>
        </div>
    );
}

export default ChangePassword;
