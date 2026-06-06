import { useContext, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { SettingsContext } from '../context/SettingsContext'
import Alert from '../components/Alert'
import { verifyOTP } from '../api/Auth'

const OTP_LENGTH = 6

const Otppage = () => {
    // const { theme } = useContext(SettingsContext)
    const navigate = useNavigate()
    const email = sessionStorage.getItem("pendingVerifyEmail")

    // Create an array: ['','','','','',''] with length of OTP_LENGTH
    const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))

    // const bgClass = theme === 'dark' ? 'bg-neutral-900' : ''

    /**
     * If sessionStorage return email = null
     * then !email = true and we will navigate to /auth page
     */
    if (!email) {
        return <Navigate to="/auth" replace />
    }

    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
    const onError = (message) => setNotification({ show: true, message, type: 'error' });

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const nextOtpDigits = [...otpDigits]
        nextOtpDigits[index] = digit
        setOtpDigits(nextOtpDigits)

        if (digit && index < OTP_LENGTH - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus()
        }
    }

    const handleOtpKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus()
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus()
        }

        if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus()
        }

        if (/^\d$/.test(event.key)) {
            const nextOtpDigits = [...otpDigits]
            nextOtpDigits[index] = event.key
            setOtpDigits(nextOtpDigits)

            if (index < OTP_LENGTH - 1) {
                document.getElementById(`otp-${index + 1}`)?.focus()
            }

            event.preventDefault()
        }
    }

    const handleVerifyClick = async (e) => {
        e.preventDefault();
        try {
            const otp = otpDigits.join('');
            console.log("otp: ", otp);
            if (otp.length !== OTP_LENGTH) {
                onError('Please enter the complete OTP');
                return;
            }
            const payload = { email, otp };
            await verifyOTP(payload);

            onSuccess('OTP verified successfully');
            sessionStorage.removeItem("pendingVerifyEmail");
            navigate("/auth", { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to verify OTP';
            onError(message);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8">
            <div
                style={{
                    boxShadow: '0 0 12px rgba(168,85,247,0.4), 0 0 24px rgba(6,182,212,0.3)'
                }}
                className={`w-full max-w-2xl rounded-3xl text-white`}
            >
                <form onSubmit={handleVerifyClick} className="flex flex-col gap-5 p-8 sm:p-10">
                    <div>
                        <p className="mb-2 text-3xl font-medium sm:text-4xl">Verify OTP</p>
                        <p className="text-sm leading-6 text-neutral-300 sm:text-base">
                            Enter the 6-digit verification code sent to your email.
                        </p>
                    </div>

                    <div className="flex items-center rounded-md border border-neutral-600 bg-neutral-800 px-3 py-3">
                        <Mail className="mr-2 h-5 w-5 text-neutral-400" />
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                                Verification Email
                            </p>
                            <p className="truncate text-sm text-white sm:text-base">{email}</p>
                        </div>
                    </div>

                    <div className="flex justify-between gap-2 sm:gap-3">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(event) => handleOtpChange(index, event.target.value)}
                                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                className="h-14 w-11 rounded-md border border-neutral-600 bg-neutral-800 text-center text-xl font-semibold text-white outline-none transition-colors focus:border-white sm:h-16 sm:w-14 sm:text-2xl"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="mt-2 cursor-pointer rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-base transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] sm:text-lg"
                    >
                        Verify code
                    </button>

                    <div className="flex items-center justify-between text-sm text-neutral-300">
                        <button
                            type="button"
                            onClick={() => navigate('/auth')}
                            className="cursor-pointer underline underline-offset-4 hover:text-white"
                        >
                            Back to auth
                        </button>
                        <button
                            type="button"
                            className="cursor-pointer text-blue-300 underline underline-offset-4 hover:text-blue-200"
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
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

export default Otppage
