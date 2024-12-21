import Logout from "../Components/Auth/Logout";
import NavigationLayout from "../NavigationLayout/NavigationLayout";


function HomePage(){
    return(
        <NavigationLayout>
            <h1 className="text-5xl text-center ">Home Page</h1>
            <Logout/>
        </NavigationLayout>
    )
}

export default HomePage;
