import React, { useState, useEffect } from "react";
import { VscRefresh } from "react-icons/vsc";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { requestNewVerificationCodeThunk, verifyCodeThunk } from "../../Redux/Slices/authSlice";

function VerifyCode() {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown timer
    const [isTimerActive, setIsTimerActive] = useState(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const identifier = queryParams.get("identifier");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      let timer;
      if (isTimerActive && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsTimerActive(false);
      }

      return () => clearInterval(timer); // Cleanup the interval on unmount
    }, [isTimerActive, timeLeft]);

    const handleChange = (element, index) => {
      if (isNaN(element.value)) return;

      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      // Automatically focus on the next input
      if (element.nextSibling && element.value !== "") {
        element.nextSibling.focus();
      }
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    };

    const handleResendCode = async() => {
      const response = await dispatch(requestNewVerificationCodeThunk({ email : identifier }));
      if(response?.payload?.statusCode == 200){
        setTimeLeft(60); // Reset timer to 60 seconds
        setIsTimerActive(true);
        setOtp(new Array(6).fill("")); // Clear existing OTP inputs  
      }
      
    };

    const handleOtpSubmission = async() => {
        const verifyCode = parseInt(otp.join(""));
        const response = await dispatch(verifyCodeThunk({ email : identifier, verifyCode }));
        // console.log("response : ", response);
        if(response?.payload?.statusCode == 200){
            navigate("/");
            // console.log("Navigation done");
        }
        setOtp(new Array(6).fill(""));
    }

    return (
        <section className="flex flex-col justify-center items-center h-[100vh] bg-gray-100 dark:bg-gray-900 transition-colors">
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-10 space-y-6 w-full max-w-md">
                <h1 className="text-3xl font-bold tracking-wider text-gray-800 dark:text-gray-100">
                    Verify OTP
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Enter the OTP sent to your email
                </p>
                <div className="flex justify-center space-x-2">
                    {otp.map((value, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={value}
                          onChange={(e) => handleChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-12 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xl"
                        />
                    ))}
                </div>
                <button
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    onClick={handleOtpSubmission}
                >
                    Verify OTP
                </button>
                <div className="text-gray-600 dark:text-gray-300 text-sm flex items-center justify-center space-x-2 mt-4">
                    <span>
                        You can request a new code in {timeLeft > 0 ? `${timeLeft}s` : "now"}.
                    </span>
                    <button
                        onClick={handleResendCode}
                        disabled={isTimerActive}
                        className={`flex items-center space-x-1 text-blue-500 dark:text-blue-400 ${
                        isTimerActive ? "cursor-not-allowed opacity-50" : "hover:underline"
                        }`}
                    >
                        <VscRefresh />
                        <span>Resend</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default VerifyCode;
