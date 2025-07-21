import { Link } from "react-router-dom";
import DashboardCard from "./DashboardCard";

function QuickLinks() {
    const links = [
        { to: "/orders/place-new-order", text: "Place New Order" },
        { to: "/orders/my-orders", text: "View All Orders" },
        { to: "/user/profile", text: "Manage Profile" },
    ];

    return (
        <DashboardCard title="Quick Links">
            <div className="grid grid-cols-1 gap-4">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="bg-blue-500 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        {link.text}
                    </Link>
                ))}
            </div>
        </DashboardCard>
    );
}

export default QuickLinks; 