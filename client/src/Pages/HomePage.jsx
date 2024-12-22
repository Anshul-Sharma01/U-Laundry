import Logout from "../Components/Auth/Logout";
import NavigationLayout from "../NavigationLayout/NavigationLayout";

function HomePage() {
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
