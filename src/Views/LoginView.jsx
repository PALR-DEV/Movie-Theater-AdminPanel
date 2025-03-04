import { useState } from 'react'

const LoginView = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle login logic here
        console.log('Login attempt:', formData)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 bg-cover bg-center h-64 md:h-screen relative"
                style={{
                    backgroundImage: `url('https://images.pexels.com/photos/7991182/pexels-photo-7991182.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
                }}>
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="h-full w-full flex items-center justify-center relative z-10">
                    <h1 className="text-4xl font-bold text-white text-center px-4">
                        EL CINE MAYAGUEZ TOWN CENTER
                    </h1>
                </div>
            </div>

            {/* Form Section */}
            <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
                    <div>
                        <h2 className="text-3xl font-extrabold text-black tracking-tight">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your credentials to access the admin panel
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none transition-all"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-3 -top-2.5 text-sm text-gray-600 transition-all
                                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                             peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                >
                                    Email address
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="peer w-full px-3 py-3 border-0 border-b-2 border-gray-300 bg-transparent placeholder-transparent focus:border-black focus:outline-none transition-all"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 -top-2.5 text-sm text-gray-600 transition-all
                                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                                             peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-black"
                                >
                                    Password
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-gray-600 hover:text-black transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 border-2 border-black text-sm font-medium rounded-lg text-white bg-black hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginView