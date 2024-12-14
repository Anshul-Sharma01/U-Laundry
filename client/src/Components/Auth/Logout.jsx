import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUserThunk } from "../../Redux/Slices/authSlice";


function Logout(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleLogout(){
        const res = await dispatch(logoutUserThunk());
        if(res?.payload?.statusCode == 200){
            navigate("/auth/sign-in");
        }
    }

    return(
        <>
            <button onClick={handleLogout} className="px-8 py-2 border-solid border-2 border-white bg-red-500 text-white rounded-lg hover:bg-red-800">
                Logout
            </button>
        </>
    )
}


export default Logout;

