import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaRegEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@material-tailwind/react";
import ReactLoading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requests } from "../../constants/requests";
import instance from "../../constants/axios";
import useAppStateContext from "../../hooks/useAppStateContext";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ onClose, openSignUpFromLogin, Google }) => {
  const [user, setuser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);

  const { dispatch } = useAppStateContext();

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const handleNext = () => {
    if (user.email === "") {
      return;
    }
    instance
      .post(requests.check, { userInfo: user.email })
      .then((response) => {
        if (response.data.message === "User exists") {
          return setCurrentPage(2);
        }
        return handleEmailNotExists();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogin = () => {
    if (user.password === "") {
      return;
    }
    setLoading(true);
    instance
      .post(requests.login, { userInfo: user.email, password: user.password })
      .then((response) => {
        if (response.data.token) {
          dispatch({ type: "Login", payload: response.data });
          setLoading(false);
          navigate("/home");
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        if (error.response.status === 404) {
          return handleWrongPassword();
        }
      });
  };
  const handleEmailNotExists = () => {
    toast.warn("Email or username does not exists", {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { backgroundColor: "#1268fc", color: "#fff" },
    });
  };

  const handleWrongPassword = () => {
    toast.warn("Wrong Password", {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { backgroundColor: "#1268fc", color: "#fff" },
    });
  };

  return (
    <div>
      <div
        className={`w-[600px] min-h-[300px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black rounded-xl ${
          currentPage === 1 ? "pb-20" : "pb-5"
        }`}
      >
        {loading ? (
          <ReactLoading
            type={"spin"}
            color={"blue"}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <div>
            <div className="flex flex-row items-center justify-left">
              <button
                onClick={onClose}
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
                    <div className="mt-4">
                      <h2 className="dark:text-white text-3xl font-bold">
                        Sign in to X
                      </h2>
                    </div>
                    <div className="mt-8 mb-2">
                      {/* <Button
                        color="white"
                        className="normal-case flex justify-center items-center gap-3 h-[35px] w-[300px] rounded-full self-start border-gray-300 border-2 shadow-none dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-300"
                      >
                        <FcGoogle className="text-2xl" />
                        <span>Sign in with Google</span>
                      </Button> */}
                      {Google}
                    </div>
                    <div className="">
                      <Button
                        color="white"
                        className="normal-case flex justify-center items-center gap-3 h-[43px] w-[300px] rounded-full self-start border-gray-300 border-2 shadow-none dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-300"
                      >
                        <FaApple className="text-2xl" />
                        <span>Sign in with Apple</span>
                      </Button>
                    </div>

                    {/* or with 2 lines */}
                    <div className="flex flex-row items-center justify-center w-[300px] mt-5">
                      <div className="w-2/4 h-px bg-gray-800"></div>
                      <div className="mx-4 dark:text-gray-200">or</div>
                      <div className="w-2/4 h-px bg-gray-800"></div>
                    </div>

                    {/* Here we check if email exists */}
                    <div className="mt-5 relative">
                      <input
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        type="email"
                        value={user.email}
                        onChange={(e) =>
                          setuser({ ...user, email: e.target.value })
                        }
                        className={`dark:bg-black dark:text-white w-[300px] h-[60px] rounded-md p-4 pt-7 border-gray-300 dark:border-gray-900 border-2 focus:outline-none focus:border-blue-600 transition-all `}
                      />
                      <label
                        htmlFor="email"
                        className={`absolute top-4 left-4  ${
                          isEmailFocused ? "text-blue-600" : "text-gray-400"
                        } transition-all text-base ${
                          isEmailFocused || user.email
                            ? "translate-y-[-12px] text-sm"
                            : ""
                        }`}
                      >
                        Email or username
                      </label>
                    </div>
                    <div className="mt-7 relative">
                      <Button
                        color="white"
                        className="normal-case flex justify-center items-center gap-3 h-[35px] w-[300px] rounded-full self-start bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-300"
                        onClick={handleNext}
                      >
                        <span className="text-base text-white dark:text-black">
                          Next
                        </span>
                      </Button>
                    </div>

                    <div className="mt-5 relative">
                      <Button
                        variant="outlined"
                        className="normal-case flex justify-center items-center gap-3 h-[35px] w-[300px] rounded-full self-start dark:hover:bg-gray-900 hover:bg-gray-200 border-gray-300 border-2 dark:border-gray-700"
                        onClick={() => navigate("/forgot-password")}
                      >
                        <span className="dark:text-white text-base">
                          Forgot password?
                        </span>
                      </Button>
                    </div>

                    <div className="mt-14 relative text-gray-700 text-sm">
                      Don't have an account?&nbsp;
                      <span
                        className="text-blue-600 cursor-pointer"
                        onClick={openSignUpFromLogin}
                      >
                        Sign up
                      </span>
                    </div>
                  </>
                )}
                {currentPage === 2 && (
                  <>
                    <div>
                      <h2 className="dark:text-white text-3xl font-bold mt-5">
                        Enter your password
                      </h2>
                      <div className="relative mt-6">
                        {/* This should be username we need to fetch it from the db */}
                        <input
                          type="text"
                          value={user.email}
                          disabled
                          className=" dark:text-gray-800 w-full h-[60px] bg-gray-300 text-gray-600 dark:bg-black rounded-md p-4 pt-7 border-gray-500 dark:border-gray-900 border-2 focus:outline-none focus:border-blue-600 transition-all "
                        />
                        <label
                          htmlFor="email"
                          className="absolute top-4 left-4  text-gray-800 transition-all  translate-y-[-12px] text-xs"
                        >
                          Username or Email
                        </label>
                      </div>
                      {/* password box */}
                      <div className="mt-5 relative">
                        <input
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          type={togglePassword ? "text" : "password"}
                          value={user.password}
                          onChange={(e) =>
                            setuser({ ...user, password: e.target.value })
                          }
                          className="dark:bg-black dark:text-white w-full h-[60px] rounded-md p-4 pt-7 pr-14 border-gray-500 dark:border-gray-900 border-2 focus:outline-none focus:border-blue-600 transition-all "
                        />
                        <label
                          htmlFor="email"
                          className={`absolute top-4 left-4  ${
                            isPasswordFocused
                              ? "text-blue-600"
                              : "text-gray-800"
                          } transition-all ${
                            (isPasswordFocused || user.password) &&
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
                      <a href="/" className="text-blue-600 text-xs mt-2 ml-2">
                        Forgot password?
                      </a>

                      <div className="mt-48 relative">
                        <Button
                          color="white"
                          className="normal-case flex justify-center items-center gap-3 h-[50px] w-full rounded-full self-start bg-black dark:bg-white text-white dark:text-black"
                          onClick={handleLogin}
                        >
                          <span className="text-base">Log in</span>
                        </Button>
                      </div>
                      <span className="text-gray-600 text-sm">
                        Don't have an account?&nbsp;
                        <a href="#" className="text-blue-600">
                          Sign up
                        </a>
                      </span>
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

export default LoginPopup;
