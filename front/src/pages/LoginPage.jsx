import React, { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Button } from "@material-tailwind/react";
import RegisterPopup from "../components/authComponents/RegisterPopup";
import LoginPopup from "../components/authComponents/LoginPopup";
import LoginFooter from "../components/authComponents/LoginFooter";
import Google from "../components/authComponents/Google";
const LoginPage = () => {
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [blur, setBlur] = useState(false);
  const [user, setUser] = useState({
    email: "",
    name: "",
    password: "",
    // formatted for postgre
    dob: "",
    isGetmoreMarked: false,
    isConnectMarked: false,
    isPersonalizedMarked: false,
    profile_pic: "",
  });
  // register popup
  const closeRegisterPopup = () => {
    setIsRegisterPopupOpen(false);
    setBlur(false);
  };
  const handleRegisterClick = () => {
    setIsRegisterPopupOpen(true);
    setBlur(true);
  };

  // login popup
  const closeLoginPopup = () => {
    setIsLoginPopupOpen(false);
    setBlur(false);
  };

  const handleLoginClick = () => {
    setIsLoginPopupOpen(true);
    setBlur(true);
  };
  const containerRef = useRef(null);

  const openSignUpFromLogin = () => {
    setIsLoginPopupOpen(false);
    setIsRegisterPopupOpen(true);
  };
  return (
    <div className="relative">
      <div
        className={`login_page_container w-full min-h-screen ${
          blur ? "bg-gray-300 dark:bg-blue-gray-900" : "bg-white dark:bg-black"
        } flex flex-col ${
          (isRegisterPopupOpen || isLoginPopupOpen) && "pointer-events-none"
        }`}
      >
        <div
          className={`flex_container_login flex-col flex-1 p-5 sm:flex md:flex md:flex-row md:h-[94vh] md:min-h-[600px] md:p-0`}
        >
          <div className="flex md:basis-9/12 sm:justify-center sm:items-center ">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-10 sm:h-14 r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1nao33i r-rxcuwo r-1777fci r-m327ed r-494qqr md:h-1/2 fill-current dark:text-gray-50 max-h-80"
            >
              <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </div>
          <div className="flex mt-10 md:basis-7/12 md:min-h-full content-center sm:justify-center lg:justify-normal">
            <div className="flex flex-col justify-center">
              <h1 className="text-black dark:text-gray-50 text-4xl sm:text-6xl font-bold pb-12 sm:self-center md:self-start">
                Happening Now
              </h1>
              <h2 className="text-black dark:text-gray-50 text-2xl sm:text-2xl font-bold mb-8 sm:self-center md:self-start">
                Join today.
              </h2>
              {/* <Button
                color="white"
                className="flex justify-center normal-case text-sm items-center gap-3 sm:h-[40px] sm:w-[300px] rounded-full mb-2 sm:self-center md:self-start border-2 shadow-none border-gray-300"
              >
                <FcGoogle className="text-2xl" />
                <span>Sign Up with Google</span>
              </Button> */}
              <div className="flex justify-center items-center sm:w-[300px] content-center sm:self-center md:self-start mb-4">
                <Google user={user} setUser={setUser} />
              </div>

              <Button
                color="white"
                className="flex justify-center normal-case text-sm items-center gap-3 sm:h-[40px] sm:w-[300px] rounded-full sm:self-center md:self-start shadow-none border-2 border-gray-300"
              >
                <FaApple className="text-2xl" />
                <span>Sign Up with Apple</span>
              </Button>
              <div className="flex flex-row  content-center items-center justify-center sm:justify-normal lg:items-center sm:self-center md:self-start">
                <div className="w-1/4 md:min-w-[130px] h-px bg-gray-700"></div>
                <span className="text-gray-50 m-2">or</span>
                <div className="w-1/4 h-px md:min-w-[130px] bg-gray-700"></div>
              </div>
              <Button
                color="blue"
                className="sm:h-[40px] sm:w-[300px] rounded-full normal-case mb-1 sm:self-center md:self-start"
                onClick={handleRegisterClick}
              >
                <span className="text-[15px]">Create account</span>
              </Button>
              <span className="text-gray-700 text-5px mb-6 sm:mb-10 sm:text-[10px] sm:w-[300px] sm:self-center md:self-start">
                By signing up, you agree to the Terms of Service and Privacy
                Policy, including Cookie Use.
              </span>

              <h3 className="text-black dark:text-white font-bold sm:self-center md:self-start">
                Already have an account?
              </h3>
              <Button
                variant="outlined"
                color="blue-gray"
                className="sm:h-[40px] sm:w-[300px] rounded-full normal-case mt-3 mb-[-30px] sm:self-center md:self-start"
                onClick={handleLoginClick}
              >
                <span className="text-[15px] text-blue-600">Sign in</span>
              </Button>
            </div>
          </div>
        </div>
        <LoginFooter />
      </div>
      <div ref={containerRef}>
        {isRegisterPopupOpen && (
          <RegisterPopup
            onClose={closeRegisterPopup}
            user={user}
            setUser={setUser}
          />
        )}
        {isLoginPopupOpen && (
          <LoginPopup
            onClose={closeLoginPopup}
            openSignUpFromLogin={openSignUpFromLogin}
            Google={<Google user={user} setUser={setUser} />}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
