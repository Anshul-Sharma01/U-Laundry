import { useSelector } from "react-redux";
import Logout from "../Components/Auth/Logout";
import NavigationLayout from "../NavigationLayout/NavigationLayout";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function HomePage() {

    const isCodeVerified = useSelector((state) => state?.auth?.isCodeVerified);
    const navigate = useNavigate();

    
    useEffect(() => {
        if(!isCodeVerified){
            navigate("/auth/sign-in");
            return;
        }
    }, [])



    return (
        <NavigationLayout>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
                <h1 className="text-5xl text-center text-gray-900 dark:text-gray-100 mb-6">
                    Home Page
                </h1>
                <Logout />
            </div>
        </NavigationLayout>
    );
}

export default HomePage;
