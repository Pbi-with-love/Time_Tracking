import { useContext } from 'react'
import { SettingsContext } from '../context/SettingsContext'
const Login = () => {
    const { theme } = useContext(SettingsContext);

    const bgClass = theme === 'dark'
        ? 'bg-neutral-900'
        : '';

    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div
                style={{
                    boxShadow: `0 2px 6px rgba(168,85,247,0.3), 0 4px 12px rgba(6,182,212,0.4)`
                }}
                className={`${bgClass} w-2/3 h-3/4 text-white p-6 xs:p-8 rounded-lg`}
            >
                {/* ----- Left Side - Login ----- */}
                <div className="bg-blue-500 flex w-1/2 h-full">


                </div>


                {/* ----- Right Side - Register ----- */}

            </div>
        </div>
    )
}

export default Login;