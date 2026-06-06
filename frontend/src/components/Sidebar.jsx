import React, { useState, useContext, useEffect } from 'react'
import Logo from './Logo'
import { Bell, Home, Search, TrendingUp, Eye, Menu, Info, LogOut, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import avatar from '../assets/avatar.jpg'
import { SettingsContext } from '../context/SettingsContext'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '../api/Auth'
import Alert from '../components/Alert'

const Sidebar = () => {
    const { theme } = useContext(SettingsContext);

    const bgClass = theme === 'dark' ? 'bg-black' : '';
    const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-900';
    const placeholderClass = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-700';

    const [isOpen, setIsOpen] = useState(true);
    const [activePath, setActivePath] = useState("/");
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();


    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
    const onError = (message) => setNotification({ show: true, message, type: 'error' });


    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 868px)');

        const updateViewport = (event) => {
            setIsMobile(event.matches);
            if (!event.matches) {
                setIsAvatarMenuOpen(false);
            }
        };

        setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener('change', updateViewport);

        return () => mediaQuery.removeEventListener('change', updateViewport);
    }, []);

    const mainMenuItems = [
        { icon: <Home size={20} />, label: "Dashboard", path: "/" },
        { icon: <Eye size={20} />, label: "View", path: "/view" },
        { icon: <TrendingUp size={20} />, label: "Statistics", path: "/statistics" },
        { icon: <Info size={20} />, label: "About Me", path: "/about" },
        // { icon: <Settings size={20} />, label: "Setting", path: "/setting" }
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const handleAvatarMouseEnter = () => {
        if (!isMobile) {
            setIsAvatarMenuOpen(true);
        }
    };

    const handleAvatarMouseLeave = () => {
        if (!isMobile) {
            setIsAvatarMenuOpen(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            window.location.href = "/auth";
        } catch (error) {
            onError('Failed to log out');
        }
    }

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

                        <div
                            className="relative"
                            onMouseEnter={handleAvatarMouseEnter}
                            onMouseLeave={handleAvatarMouseLeave}
                        >
                            <DropdownMenu
                                open={isAvatarMenuOpen}
                                onOpenChange={(open) => {
                                    if (isMobile) {
                                        setIsAvatarMenuOpen(open);
                                    }
                                }}
                            >
                                <DropdownMenuTrigger asChild>
                                    <button className='w-10 h-10 bg-neutral-700 overflow-hidden rounded-full flex items-center justify-center cursor-pointer border border-neutral-600 hover:border-neutral-400 transition-colors'>
                                        <img src={avatar} alt="User avatar" className='w-full h-full object-cover' />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    side="bottom"
                                    align="end"
                                    sideOffset={12}
                                    className="z-1000 min-w-[190px] rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                                >
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-white">My account</p>
                                        <p className="text-xs text-neutral-400">Profile shortcuts</p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-neutral-700" />
                                    <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-neutral-200 data-[highlighted]:bg-neutral-800 data-[highlighted]:text-white">
                                        <UserRound className="h-4 w-4" />
                                        <span>About me</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer rounded-lg px-3 py-2 text-red-300 data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-200">
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                                            <Motion.div
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
            {/* ----- Notification ----- */}
            {
                notification.show && (
                    <Alert
                        onClose={() => setNotification({ ...notification, show: false })}
                        message={notification.message}
                        type={notification.type}
                    />
                )
            }
        </>
    )
}

export default Sidebar
