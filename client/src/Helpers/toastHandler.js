import toast from "react-hot-toast"

export const toastHandler = (promise, loadingMsg, successMsg, errorMsg) => {
    return toast.promise(promise,{
        loading : loadingMsg,
        success : (data) => data?.data?.message || successMsg,
        error : errorMsg
    });
}
