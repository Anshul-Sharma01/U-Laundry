import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast }  from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUserAvatarThunk } from "../../Redux/Slices/authSlice";

function UpdateAvatar({ setShowModal }) {

    const [ userAvatar, setUserAvatar ] = useState("");

    const dispatch = useDispatch();
    
    function handleAvatarUpload(e){
        const updatedAvatar = e.target.files[0];
        setUserAvatar(updatedAvatar);
    }

    async function updateUserAvatar(e){
        e.preventDefault();
        toast.dismiss();
        if(userAvatar === ""){
            toast.error("New Avatar file is required !!");
            return;
        }
        const formData = new FormData();
        formData.append("avatar", userAvatar);
        const res = await dispatch(updateUserAvatarThunk(formData));
        console.log("Res  :", res);
        setShowModal(false);

    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowModal(false)} // Close modal on click outside
        >
            <div
                className="relative shadow-lg flex flex-col justify-center rounded-lg items-center px-10 py-8 bg-white dark:bg-gray-800 dark:shadow-gray-700 transition-all"
                onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
            >
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowModal(false)}
                >
                    ✕
                </button>

                <form onSubmit={updateUserAvatar} >
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Upload New Avatar
                    </h2>

                    <label
                        htmlFor="avatar-upload"
                        className="flex flex-col justify-center items-center gap-4 cursor-pointer text-xl font-medium text-gray-700 dark:text-gray-300"
                    >
                        <span className="text-gray-500 dark:text-gray-400">
                            <FaCloudUploadAlt size={60} />
                        </span>
                    </label>
                    <input type="file" onChange={handleAvatarUpload} hidden id="avatar-upload" />

                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-red-500 text-white hover:bg-red-700 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 text-white hover:bg-blue-700 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all">
                            Upload
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default UpdateAvatar;
