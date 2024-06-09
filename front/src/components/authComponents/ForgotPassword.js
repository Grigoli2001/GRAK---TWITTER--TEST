import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@material-tailwind/react";
import ReactLoading from "react-loading";
import { requests } from "../../constants/requests";
import instance from "../../constants/axios";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../hooks/createToast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [verificationInput, setverificationInput] = useState("");
  const [VerificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();


  const handleNext = (page) => {
    switch (page) {
      case 1:
        console.log("heree" + email);
        if (email) {
          instance
            .post(requests.check, { userInfo: email })
            .then((res) => {
              console.log(res.data.message);
              if (res.data.message === "User exists") {
                setCurrentPage(2);
                sendOTP();
              } else {
                createToast("Email or username does not exists", "warn", "email-not-exists", {limit: 1});
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
        break;
      case 2:
        if (verificationInput === VerificationCode) {
          setCurrentPage(3);
        } else {
          createToast("Invalid verification code", "warn", "invalid-verification-code", {limit: 1});
        }
        break;
      case 3:
        if (newPassword.length < 8) {
          createToast("Password must be at least 8 characters", "warn", "password-length", {limit: 1});
         
        } else {
          instance
            .post(requests.change_password, {
              email: email,
              newPassword: newPassword,
            })
            .then((res) => {
              console.log(res);
              if (res.data.message === "Password changed") {
                createToast("Password changed successfully", "success", "password-changed", {limit: 1});
                navigate("/");
              } else {
                createToast("Error changing password", "error", "error-changing-password", {limit: 1});
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
        break;
      default:
        break;
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await instance.post(requests.sendOTP, {
        email: email,
      });
      setVerificationCode(response.data.otp);
      console.log(response.data.otp);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/95 w-full h-screen">
      <div
        className={`w-[600px] min-h-[300px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black rounded-xl ${
          currentPage === 1 ? "pb-20" : "pb-5"
        }`}
      >
        {loading ? (
          <ReactLoading
            type={"spin"}
            color={"#1da1f2"}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <div>
            <div className="flex flex-row items-center justify-left">
              <button
                onClick={() => navigate("/")}
                className=" hover:bg-blue-gray-100 dark:hover:bg-blue-gray-900 rounded-full dark:text-white font-bold m-2 p-2"
              >
                <IoMdClose />
              </button>
              <div className="absolute top-2 left-[46%]">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-10 r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1nao33i r-rxcuwo r-1777fci r-m327ed r-494qqr fill-current dark:text-gray-50 "
                >
                  <g>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </g>
                </svg>
              </div>
            </div>
            <div className="flex justify-center">
              <div
                className={`flex flex-col ${
                  currentPage === 1 ? "w-7/12" : "w-9/12"
                }`}
              >
                {/* Here we check if email exists */}
                {currentPage === 1 && (
                  <>
                    <h2 className="dark:text-white font-bold text-2xl mt-8">
                      Find your account
                    </h2>
                    <p className="text-gray-600 text-sm mt-2">
                      Verification code will be sent to your email
                    </p>
                    <div className="mt-5 relative">
                      <input
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value.toLowerCase().trim())
                        }
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gray-300 dark:border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all `}
                      />
                      <label
                        htmlFor="email"
                        className={`absolute top-4 left-4 pointer-events-none ${
                          isEmailFocused ? "text-blue-600" : "text-gray-400"
                        } transition-all text-base ${
                          isEmailFocused || email
                            ? "translate-y-[-12px] text-sm"
                            : ""
                        }`}
                      >
                        Email or username
                      </label>
                    </div>

                    <div className="mt-[340px] relative">
                      <Button
                        color="white"
                        className="bg-black dark:bg-white dark:hover:bg-gray-200 hover:bg-gray-800 text-white dark:text-black text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all"
                        onClick={handleNext.bind(this, 1)}
                      >
                        <span className="text-base text-white dark:text-black">
                          Next
                        </span>
                      </Button>
                    </div>
                  </>
                )}

                {currentPage === 2 && (
                  <>
                    <h2 className="dark:text-white font-bold mt-6 text-2xl">
                      We sent you a code
                    </h2>
                    <p className="text-gray-600 text-sm mt-2">
                      Enter it below to verify <br /> {email}
                    </p>
                    <div className="relative h-14 mt-10">
                      <input
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gray-300 dark:border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={verificationInput}
                        onChange={(e) =>
                          setverificationInput(e.target.value.slice(0, 6))
                        }
                        onKeyPress={(e) => {
                          const isValidKey = /^\d$/.test(e.key);
                          // Allow only numbers (0-9) and prevent any other characters
                          if (!isValidKey) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isNameFocused ? "text-blue-600" : "text-gray-600"
                        } transition-all ${
                          isNameFocused || VerificationCode
                            ? "translate-y-[-12px] text-xs"
                            : "text-sm"
                        }`}
                      >
                        Verification Code
                      </label>
                    </div>
                    <span
                      onClick={sendOTP.bind(this)}
                      className="text-blue-600 text-xs ml-3 hover:pointer hover:underline mt-2 cursor-pointer w-32"
                    >
                      Didn't receive email?
                    </span>

                    {/* Next Button */}

                    <div className="w-full mt-[320px]">
                      <button
                        onClick={handleNext.bind(this, 2)}
                        className={`bg-black dark:bg-white dark:hover:bg-gray-200 hover:bg-gray-800 text-white dark:text-black text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={VerificationCode.length < 6}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 3 && (
                  <>
                    <h2 className="dark:text-white font-bold mt-6 text-2xl">
                      You'll need a password
                    </h2>
                    <p className="text-gray-600 text-sm mt-2">
                      Make sure it's 8 characters or more.
                    </p>
                    <div className="mt-5 relative">
                      <input
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        type={togglePassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="dark:bg-black dark:text-white w-full h-[60px] rounded-md p-4 pt-7 pr-14 border-gray-300 dark:border-gray-900 border-2 focus:outline-none focus:border-blue-600 transition-all "
                      />
                      <label
                        htmlFor="email"
                        className={`absolute top-4 left-4  ${
                          isPasswordFocused ? "text-blue-600" : "text-gray-800"
                        } transition-all ${
                          (isPasswordFocused || newPassword) &&
                          " translate-y-[-12px] text-xs"
                        }`}
                      >
                        Password
                      </label>

                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => setTogglePassword(!togglePassword)}
                        >
                          {togglePassword ? (
                            <FaEyeSlash className="dark:text-gray-100 text-2xl" />
                          ) : (
                            <FaRegEye className="dark:text-gray-100 text-2xl" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Next Button */}
                    <div className="w-full mt-[370px]">
                      <button
                        onClick={handleNext.bind(this, 3)}
                        className={`dark:bg-white dark:hover:bg-gray-200 bg-black text-white hover:bg-gray-800 dark:text-black text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={newPassword < 8}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
