function DashboardCard({ title, children, className = '' }) {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
            <div>
                {children}
            </div>
        </div>
    );
}

export default DashboardCard; 