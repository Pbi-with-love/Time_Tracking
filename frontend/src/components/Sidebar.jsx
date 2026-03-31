import React, { useState, useContext, useEffect } from 'react'
import Logo from './Logo'
import { Bell, Home, Search, TrendingUp, Eye, Menu, Info, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import avatar from '../assets/avatar.jpg'
import { SettingsContext } from '../context/SettingsContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
    const { theme } = useContext(SettingsContext);

    const bgClass = theme === 'dark' ? 'bg-black' : '';
    const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-900';
    const placeholderClass = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-700';

    const [isOpen, setIsOpen] = useState(true);
    const [activePath, setActivePath] = useState("/");
    const location = useLocation();


    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    const mainMenuItems = [
        { icon: <Home size={20} />, label: "Dashboard", path: "/" },
        { icon: <Eye size={20} />, label: "View", path: "/view" },
        { icon: <TrendingUp size={20} />, label: "Statistics", path: "/statistics" },
        { icon: <Info size={20} />, label: "About Me", path: "/about" },
        // { icon: <Settings size={20} />, label: "Setting", path: "/setting" }
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* ----- Hamburger Menu ----- */}
            <button onClick={toggleSidebar} className="fixed z-500 top-4 left-4 md:hidden bg-neutral-800 w-10 h-10 flex items-center rounded-lg justify-center text-white hover:bg-neutral-700 cursor-pointer transition-colors duration-300">
                <Menu size={24} />
            </button>

            {/* ----- Sidebar ----- */}
            <aside className={`absolute md:static z-100 h-screen w-full md:w-57 lg:w-72 ${bgClass} flex flex-col p-8 md:p-4 lg:p-6 border-r-2 ${theme === 'dark' ? 'border-neutral-800' : 'border-black'} transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${textClass}`}>

                {/* ----- Header ----- */}
                <div className='md:flex items-center justify-between relative md:static'>
                    <div className={`flex items-center ${theme === 'dark' ? "" : ""} gap-0 w-full justify-center md:justify-start`}>
                        <Logo width={40} height={40} />
                        <p className={`font-semibold md:text-sm ${textClass}`}>SmartTime</p>
                    </div>
                    <div className="flex items-center gap-2 absolute md:static right-0 top-0">
                        <button className={`w-10 h-10 ${theme === 'dark' ? "bg-neutral-900 hover:bg-neutral-800" : ""} rounded-full flex items-center justify-center cursor-pointer`}>
                            <Bell className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                        </button>

                        <button className='w-10 h-10 bg-neutral-700 overflow-hidden rounded-full flex items-center justify-center'>
                            <img src={avatar} alt="" className='w-full h-full object-cover' />
                        </button>
                    </div>
                </div>

                {/* ----- Search ----- */}
                <div className="my-8 relative">
                    <Search size={20} className='text-gray-500 absolute left-3 top-3' />
                    <input
                        type="text"
                        className={`rounded-xl px-4 py-3 pl-10 w-full text-sm ${theme === 'dark' ? "bg-neutral-900 focus:border-neutral-600" : ""}  ${textClass} border-2 border-neutral-800 focus:outline-none  ${placeholderClass}`}
                        placeholder='Search'
                    />
                </div>

                {/* ----- Menu ----- */}
                <nav className="flex-1 overflow-y-auto">
                    <ul className="space-y-3">
                        {mainMenuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => {
                                        toggleSidebar();
                                        setActivePath(item.path);
                                    }}
                                    className="relative w-full flex px-3 py-2.5 rounded-lg"
                                >

                                    {/* 🔥 animated background */}
                                    <AnimatePresence>
                                        {activePath === item.path && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 rounded-lg bg-neutral-800"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 35
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* content */}
                                    <div className="relative z-10 flex gap-2 items-center">
                                        <div>{item.icon}</div>
                                        <span>{item.label}</span>
                                    </div>

                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    )
}

export default Sidebar
