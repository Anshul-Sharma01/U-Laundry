import { useState } from "react";
import NavigationLayout from "../../NavigationLayout/NavigationLayout";
import toast from "react-hot-toast";

function ChangePassword() {
    const [formData, setFormData] = useState({ oldPassword: "", newPassword: "" });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        toast.dismiss();
        if(!formData.oldPassword || !formData.newPassword){
            toast.error("All the fields are mandatory !!");
            return;
        }
        console.log("Password Changed", formData);
    };

    return (
        <div className="dark:bg-gray-900 dark:text-white bg-white text-gray-900">
            <NavigationLayout>
                <div className="flex justify-center items-center h-[80vh]">
                    <section className="flex flex-col justify-center items-center gap-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
                        <h1 className="text-2xl font-semibold">Change Password</h1>
                        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
                            {/* Old Password Input */}
                            <div className="flex flex-col">
                                <label htmlFor="oldPassword"    className="mb-1 text-sm">
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
                                <label htmlFor="newPassword" className="mb-1 text-sm">
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
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                Change Password
                            </button>
                        </form>

                    </section>
                </div>
            </NavigationLayout>
        </div>
    );
}

export default ChangePassword;
