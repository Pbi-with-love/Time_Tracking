import { useContext, useState } from 'react'
import { SettingsContext } from '../context/SettingsContext'
import { User, Lock, Eye, EyeOff, Mail } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import Alert from '../components/Alert'
import * as authApi from "../api/Auth"
const Authpage = () => {
    const { theme } = useContext(SettingsContext);

    const navigate = useNavigate();
    const bgClass = theme === 'dark'
        ? 'bg-neutral-900'
        : '';

    const [loginId, setLoginId] = useState("");
    const [passwordLogin, setPasswordLogin] = useState("")
    const [seePasswordLogin, setSeePasswordLogin] = useState(false);

    const [usernameRegister, setUsernameRegister] = useState("");
    const [emailRegister, setEmailRegister] = useState("");
    const [passwordRegister, setPasswordRegister] = useState("");
    const [seePasswordRegister, setSeePasswordRegister] = useState(false);

    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
    const onError = (message) => setNotification({ show: true, message, type: 'error' });

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        try {
            await authApi.login({
                loginId,
                password: passwordLogin
            });
            onSuccess("Login successfully!");
            navigate("/", { replace: true });
        } catch (err) {
            const message =
                // axios error structure
                err.response?.data?.message ||
                "Login failed";
            onError(message);
        }
    }



    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div
                style={{
                    boxShadow: `0 0 12px rgba(168,85,247,0.4), 0 0 24px rgba(6,182,212,0.3)`
                }}
                className={`relative ${bgClass} lg:w-2/3 h-3/4 text-white rounded-full flex`}
            >
                {/* ----- Left Side - Login ----- */}
                <div className="absolute top-0 left-0 w-1/2 h-full p-6 xs:p-8 rounded-lg flex items-center justify-center">
                    <form onSubmit={handleSubmitLogin} className="flex w-[80%] flex-col gap-3">
                        <p className="text-4xl font-medium mb-2">Login</p>
                        <p className="text-white text-sm mb-4">Don't have an account?<span onClick={() => setShowRegisterForm(!showRegisterForm)} className="underline ml-1 cursor-pointer text-blue-300">Sign up</span></p>
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-md px-3 focus-within:border-white transition-colors">
                                <User className="text-neutral-400 mr-2 w-5 h-5" />

                                <input
                                    type="text"
                                    id="login_Id"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="Username or Email"
                                    className="outline-none text-sm text-white w-full py-2"
                                />

                            </div>
                            <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-md px-3 focus-within:border-white transition-colors">
                                <Lock className="text-neutral-400 mr-2 w-5 h-5" />
                                <input
                                    type={seePasswordLogin ? "text" : "password"}
                                    id="password"
                                    value={passwordLogin}
                                    onChange={(e) => setPasswordLogin(e.target.value)}
                                    placeholder="Password"
                                    className="outline-none text-sm text-white w-full py-2"
                                />
                                <button type="button" onClick={(e) => { setSeePasswordLogin(!seePasswordLogin) }}>
                                    {(seePasswordLogin) ?
                                        <Eye className="w-5 h-5 text-neutral-400" /> : <EyeOff className="w-5 h-5 text-neutral-400" />
                                    }
                                </button>
                            </div>
                            <button type="submit" className="mt-4 text-lg cursor-pointer bg-gradient-to-r rounded-lg from-purple-500 to-blue-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] px-2 py-2 animate-gradient-x transition-all">Log in</button>
                        </div>
                    </form>
                </div>


                {/* ----- Right Side - Register ----- */}
                <div className="absolute top-0 right-0 w-1/2 h-full p-6 xs:p-8 rounded-lg flex items-center justify-center">
                    <form className="flex w-[80%] flex-col gap-3">
                        <p className="text-4xl font-medium mb-2">Register</p>
                        <p className="text-white text-sm mb-4">Already have an account?<span onClick={() => setShowRegisterForm(!showRegisterForm)} className="underline ml-1 cursor-pointer text-blue-300">Login</span></p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-md px-3 focus-within:border-white transition-colors">
                                <User className="text-neutral-400 mr-2 w-5 h-5" />

                                <input
                                    type="text"
                                    id="usernameRegister"
                                    value={usernameRegister}
                                    onChange={(e) => setUsernameRegister(e.target.value)}
                                    placeholder="Username"
                                    className="outline-none text-sm text-white w-full py-2"
                                />

                            </div>
                            <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-md px-3 focus-within:border-white transition-colors">
                                <Mail className="text-neutral-400 mr-2 w-5 h-5" />

                                <input
                                    type="text"
                                    id="login_Id"
                                    value={emailRegister}
                                    onChange={(e) => setEmailRegister(e.target.value)}
                                    placeholder="Email"
                                    className="outline-none text-sm text-white w-full py-2"
                                />

                            </div>
                            <div className="flex items-center bg-neutral-800 border border-neutral-600 rounded-md px-3 focus-within:border-white transition-colors">
                                <Lock className="text-neutral-400 mr-2 w-5 h-5" />
                                <input
                                    type={seePasswordRegister ? "text" : "password"}
                                    id="login_Id"
                                    value={passwordRegister}
                                    onChange={(e) => setPasswordRegister(e.target.value)}
                                    placeholder="Password"
                                    className="outline-none text-sm text-white w-full py-2"
                                />
                                <button type="button" onClick={(e) => { setSeePasswordRegister(!seePasswordRegister) }}>
                                    {(seePasswordRegister) ?
                                        <Eye className="w-5 h-5 text-neutral-400" /> : <EyeOff className="w-5 h-5 text-neutral-400" />
                                    }
                                </button>
                            </div>
                            <button className="mt-4 text-lg cursor-pointer bg-gradient-to-r rounded-lg from-purple-500 to-blue-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] px-2 py-2 animate-gradient-x transition-all">Sign up</button>
                        </div>
                    </form>
                </div>

                {/* ----- Panel ----- */}
                <div className={`w-1/2 h-full top-0 left-0 bg-gradient-to-r flex items-center justify-center from-purple-500 to-blue-500 rounded-xl z-10 absolute overflow-hidden ${showRegisterForm ? 'translate-x-0' : 'translate-x-full'} transition-all duration-700`}>

                    {/* Glow effect */}
                    <div className="absolute w-[300px] h-[300px] bg-white/20 blur-3xl rounded-full top-10 left-10"></div>
                    <div className="absolute w-[250px] h-[250px] bg-blue-300/20 blur-3xl rounded-full bottom-10 right-10"></div>

                    {/* Content */}
                    <div className="relative text-white text-center px-10">

                        <h1 className="text-4xl font-bold mb-4">
                            Time Tracking System
                        </h1>

                        <p className="text-white text-md font-medium mb-6">
                            Track your time. Analyze your productivity. Improve efficiency.
                        </p>

                        <div className="flex flex-col gap-2 text-white text-sm">
                            <p>⏱ Task & time tracking</p>
                            <p>📊 Productivity dashboard</p>
                            <p>📅 Timestamp history</p>
                            <p>📈 Analytics & insights</p>
                        </div>

                    </div>
                </div>

            </div>
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
        </div>
    )
}

export default Authpage;