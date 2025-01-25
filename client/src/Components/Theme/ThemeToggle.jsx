import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

function ThemeToggle(){

    const [ isDarkMode, setIsDarkMode ] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            document.documentElement.classList.toggle("dark", newMode);

            localStorage.setItem("theme", newMode ? "dark" : "light");
            return newMode;
        })
    }


    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if(savedTheme == "dark"){
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }else{
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, [])

    return(
        <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="hidden" onChange={toggleTheme} />
            <div className="relative flex items-center justify-center" style={{ width : '40px', height : '40px' }}>
                <div
                    className={`icon transition-all duration-300 absolute ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        opacity: isDarkMode ? 0 : 1,
                        transform: isDarkMode ? 'scale(0.5)' : 'scale(1)',
                    }}
                >
                    <FiMoon size={30} />
                </div>
                <div
                    className={`icon transition-all duration-300 absolute ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        opacity: isDarkMode ? 1 : 0,
                        transform: isDarkMode ? 'scale(1)' : 'scale(0.5)',
                    }}
                >
                    <FiSun size={30} />
                </div>

            </div>

        </label>
    )
}

export default ThemeToggle;

