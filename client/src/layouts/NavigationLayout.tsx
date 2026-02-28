import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export default function NavigationLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <Navbar />
            <main className="flex-grow pt-[72px]">
                {/* The pt-[72px] offsets the fixed navbar's height */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
