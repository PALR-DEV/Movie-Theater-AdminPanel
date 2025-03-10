import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import authService from '../Services/AuthService'

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()

    const navigate = useNavigate()

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleLogout = async () => {
        try {
            await authService.Logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const isActivePath = (path) => {
        return location.pathname === path || (path === '/dashboard' && location.pathname === '/')
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`${isSidebarOpen ? 'hidden' : 'block'} md:hidden fixed top-4 left-4 z-50 rounded-lg p-2 bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 transition-colors`}
                aria-label="Open sidebar"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                fixed inset-y-0 left-0 z-50 w-64 bg-white text-black transition-transform duration-300 ease-in-out 
                md:relative md:translate-x-0 md:shadow-none
                ${isSidebarOpen ? 'shadow-2xl' : ''}`}
            >
                {/* Sidebar Header */}
                <div className="sticky top-0 flex h-16 items-center justify-between px-4 bg-black">
                    <span className="text-xl font-semibold truncate text-white">Theater Admin</span>
                    <button
                        onClick={toggleSidebar}
                        className={`${isSidebarOpen ? 'block' : 'hidden'} md:hidden rounded-lg p-2 hover:bg-gray-800 active:bg-gray-700 transition-colors text-white`}
                        aria-label="Close sidebar"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Content */}
                <nav className="mt-4 px-4 pb-6 flex flex-col h-[calc(100vh-4rem)]">
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/dashboard"
                                className={`flex items-center rounded-lg px-4 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors ${isActivePath('/dashboard') ? 'bg-gray-100' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="text-sm md:text-base">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/movies"
                                className={`flex items-center rounded-lg px-4 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors ${isActivePath('/movies') ? 'bg-gray-100' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="text-sm md:text-base">Movies</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/employees"
                                className={`flex items-center rounded-lg px-4 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors ${isActivePath('/employees') ? 'bg-gray-100' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="text-sm md:text-base">Employees</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/settings"
                                className={`flex items-center rounded-lg px-4 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors ${isActivePath('/settings') ? 'bg-gray-100' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="text-sm md:text-base">Settings</span>
                            </Link>
                        </li>
                    </ul>
                    <div className="mt-auto">
                        <div className="h-px bg-gray-200 -mx-4 mb-4"></div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm md:text-base hover:bg-red-50 active:bg-red-100 transition-colors text-red-600 hover:text-red-700"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-black bg-opacity-20 backdrop-blur-[2px] transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
                aria-hidden="true"
                style={{ zIndex: 25 }}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8" style={{ zIndex: 10 }}>
                {children}
            </div>
        </div>
    )
}

export default Layout