import React, { useState, useEffect, useRef } from "react";
import { IoMdClose, IoMdArrowBack, IoMdCheckmark } from "react-icons/io";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import ReactLoading from "react-loading";
import { Checkbox } from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requests } from "../../constants/requests";
import instance from "../../constants/axios";
import useAppStateContext from "../../hooks/useAppStateContext";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../hooks/createToast";

const RegisterPopup = ({ onClose, user, setUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isMonthFocused, setIsMonthFocused] = useState(false);
  const [isDayFocused, setIsDayFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  // Temporary variables
  const [VerificationCode, setVerificationCode] = useState(123456);
  const [verificationInput, setverificationInput] = useState("");
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  const { dispatch } = useAppStateContext();
  const navigate = useNavigate();

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const monthInputRef = useRef(null);

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Auguest",
    "September",
    "October",
    "November",
    "December",
  ];
  // this is for the 3rd page
  const formattedDOB = `${month.slice(0, 3)} ${day}, ${year}`.trim();

  //   Year from 1900 to 2023
  const years = Array.from(Array(123).keys())
    .map((year) => year + 1900)
    .reverse();

  //   This is for the loading animation
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  // this is what twitters 3rd page does when you click on the input
  const handle3rdPageInputClick = (input) => {
    setCurrentPage(1);
    switch (input) {
      case "name":
        setTimeout(() => {
          nameInputRef.current.focus();
        }, 100); // I added this because component was not being rendered when I clicked on the input
        break;
      case "email":
        setTimeout(() => {
          emailInputRef.current.focus();
        }, 100);
        break;
      case "DOB":
        setTimeout(() => {
          monthInputRef.current.focus();
        }, 100);
        break;
      default:
        break;
    }
  };

  const isEmailValid = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email)) {
      setInvalidEmail(false);
      setError(false);
      return true;
    }

    setError(true);
    setInvalidEmail(true);
    return false;
  };

  // This handles next button clicks
  const handleNextClick = (page) => {
    switch (page) {
      case 1:
        if (emailAlreadyExists) {
          setError(true);
        } else if (user.email.length > 0) {
          setUser({
            ...user,
            dob: `${year}-${String(months.indexOf(month) + 1).padStart(
              2,
              "0"
            )}-${day}`,
          });

          setCurrentPage(currentPage + 1);
        }
        break;
      case 2:
        setCurrentPage(currentPage + 1);
        break;
      case 3:
        setCurrentPage(currentPage + 1);
        break;
      case 4:
        if (verificationInput === VerificationCode.toString()) {
          setCurrentPage(currentPage + 1);
        } else {
          createToast("Verification code is not correct", "warn");
          // toast.warn("Verification code is not correct", {
            // position: "bottom-center",
            // autoClose: 2000,
            // hideProgressBar: true,
            // closeOnClick: true,
            // pauseOnHover: false,
            // draggable: false,
            // progress: undefined,
            // style: {
            //   backgroundColor: "#1da1f2",
            //   color: "white",
            // },
            // I tried to change toastify entreance animation but it does not work
            // transition: "spin",
          // });
        }
        break;
      case 5:
        finishRegistration();
        break;
      default:
        break;
    }
  };
  // This checks if email already exists after user types in the email

  useEffect(() => {
    if (user.email.length > 0 && !isEmailFocused && !invalidEmail) {
      instance
        .post(requests.check, { userInfo: user.email })
        .then((response) => {
          if (response.data.message === "User exists") {
            setEmailAlreadyExists(true);
            setError(true);
          } else {
            setEmailAlreadyExists(false);
            setError(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [isEmailFocused, invalidEmail, user.email]);

  useEffect(() => {
    if (currentPage === 4) {
      console.log("Sending OTP");
      sendOTP();
    }
  }, [currentPage]);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await instance.post(requests.sendOTP, {
        email: user.email,
      });
      setVerificationCode(response.data.otp);
      console.log(response.data.otp);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const finishRegistration = () => {
    instance
      .post(requests.signup, user)
      .then((response) => {
        dispatch({
          type: "Login",
          payload: {
            token: response.data.token,
            email: user.email,
            username: user.username,
          },
        });
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <div className=" w-[600px] min-h-[300px] h-[650px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black rounded-xl pb-6 ">
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
                onClick={
                  currentPage === 1
                    ? onClose
                    : () => setCurrentPage(currentPage - 1)
                }
                className="hover:bg-blue-gray-100 dark:hover:bg-blue-gray-900 rounded-full dark:text-white font-bold m-2 p-2"
              >
                {currentPage === 1 ? <IoMdClose /> : <IoMdArrowBack />}
              </button>
              <h3 className="dark:text-white font-bold m-2">
                Step {currentPage} of 5
              </h3>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col w-9/12 relative">
                {/* start of the content by page */}
                {currentPage === 1 && (
                  <>
                    <h2 className="dark:text-white font-bold my-6 text-2xl">
                      Create your account
                    </h2>
                    {/* name input container */}
                    {/* Change possible */}
                    <div className="relative h-14">
                      <input
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gray-300 dark:border-gray-600 border-2 rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.name}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            name: e.target.value.slice(0, 50),
                          })
                        }
                        ref={nameInputRef}
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isNameFocused ? "text-blue-600" : "text-gray-600"
                        } transition-all ${
                          isNameFocused || user.name
                            ? "translate-y-[-12px] text-sm"
                            : "text-lg"
                        }`}
                      >
                        Name
                      </label>
                      {/* counter */}
                      {isNameFocused && (
                        <div>
                          <p className="text-gray-700 text-xs !absolute right-1 top-1">
                            {user.name.length} / 50
                          </p>
                        </div>
                      )}
                    </div>
                    {/* email input container */}
                    <div className="relative mt-6 h-20">
                      <input
                        onFocus={() => {
                          setIsEmailFocused(true);
                          setError(false);
                          setInvalidEmail(false);
                        }}
                        onBlur={() => {
                          setIsEmailFocused(false);
                          isEmailValid(user.email);
                        }}
                        type="email"
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black ${
                          error
                            ? "border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        } border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.email}
                        onChange={(e) =>
                          setUser({ ...user, email: e.target.value })
                        }
                        ref={emailInputRef}
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isEmailFocused
                            ? "text-blue-600"
                            : error
                            ? "text-red-600"
                            : "text-gray-600"
                        }  transition-all ${
                          isEmailFocused || user.email
                            ? "translate-y-[-12px] text-sm"
                            : "text-lg"
                        }`}
                      >
                        Email
                      </label>
                      {error & invalidEmail ? (
                        <>
                          <p className="text-red-600 text-xs !absolute left-3 bottom-2">
                            Invalid email
                          </p>
                        </>
                      ) : error & emailAlreadyExists ? (
                        <>
                          <p className="text-red-600 text-xs !absolute left-3 bottom-2">
                            Email already exists
                          </p>
                        </>
                      ) : null}
                    </div>

                    <div>
                      <h4 className="dark:text-white font-semibold text-sm mb-2">
                        Date of Birth
                      </h4>
                      <p className="text-gray-700 text-xs">
                        This will not be shown publicly. Confirm your own age,
                        even if this account is for a business, a pet, or
                        something else.
                      </p>
                    </div>
                    {/* date of birth container */}
                    <div className="flex flex-row justify-between mb-16">
                      {/* Month */}
                      <div className="relative w-1/2 mt-6 mr-2 h-20">
                        <select
                          onFocus={() => setIsMonthFocused(true)}
                          onBlur={() => setIsMonthFocused(false)}
                          className={`dark:text-white h-16 dark:bg-black  ${
                            isMonthFocused
                              ? "border-blue-600"
                              : "border-gray-300 dark:border-gray-600"
                          } border-2 rounded-md w-full text-bottom pt-4 pl-1`}
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          ref={monthInputRef}
                        >
                          <option value="" disabled></option>
                          {months.map((month, index) => (
                            <option key={index} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <label
                          className={`absolute top-0 left-0 p-2 ${
                            isMonthFocused ? "text-blue-600" : "text-gray-600"
                          } text-xs`}
                        >
                          Month
                        </label>
                      </div>
                      {/* Day */}
                      <div className="relative w-1/4 mt-6 mr-2 h-20 ">
                        <select
                          onFocus={() => setIsDayFocused(true)}
                          onBlur={() => setIsDayFocused(false)}
                          className={`dark:text-white h-16 dark:bg-black ${
                            isDayFocused
                              ? "border-blue-600"
                              : "border-gray-300 dark:border-gray-600"
                          } border-2 rounded-md w-full pt-4 pl-1`}
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                        >
                          <option value="" disabled></option>
                          {Array.from(Array(31).keys()).map((day, index) => (
                            <option key={index} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <label
                          className={`absolute top-0 left-0 p-2 ${
                            isDayFocused ? "text-blue-600" : "text-gray-600"
                          } text-xs`}
                        >
                          Day
                        </label>
                      </div>
                      {/* Year */}
                      <div className="relative w-1/4 mt-6 h-20  ">
                        <select
                          onFocus={() => setIsYearFocused(true)}
                          onBlur={() => setIsYearFocused(false)}
                          className={`dark:text-white h-16 dark:bg-black ${
                            isYearFocused
                              ? "border-blue-600"
                              : "border-gray-300 dark:border-gray-600"
                          } border-2 rounded-md w-full text-bottom pt-4`}
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                        >
                          <option value="" disabled></option>
                          {years.map((year, index) => (
                            <option key={index} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        <label
                          className={`absolute top-0 left-0 p-2 ${
                            isYearFocused ? "text-blue-600" : "text-gray-600"
                          } text-xs`}
                        >
                          Year
                        </label>
                      </div>
                    </div>
                    {/* Next Button */}
                    <div className="w-full mt-[68px]">
                      <button
                        onClick={() => handleNextClick.bind(this, 1)()}
                        className={`bg-gray-900 text-white dark:text-black dark:bg-white dark:hover:bg-gray-200  font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={
                          user.name.length < 4 ||
                          user.email.length < 4 ||
                          month.length < 1 ||
                          day.length < 1 ||
                          year.length < 1 ||
                          invalidEmail ||
                          error
                        }
                      >
                        Next
                      </button>
                    </div>
                    {/* end of the content by page */}
                  </>
                )}

                {currentPage === 2 && (
                  <>
                    <h2 className="dark:text-white font-extrabold my-6 text-[29px]">
                      Customize your experience
                    </h2>
                    <div className="overflow-scroll overflow-x-hidden h-[420px]">
                      {/* Blokc */}
                      <div className="relative h-20 mb-5">
                        <h3 className="dark:text-white text-lg font-bold mb-3">
                          Get more out of X
                        </h3>
                        <p className="dark:text-gray-300 text-sm pr-12 font-thin">
                          Receive email about your X activity and
                          recommendations.
                        </p>
                        <div className="absolute right-0 top-7">
                          <Checkbox
                            color="blue"
                            className="h-5 w-5 rounded"
                            value={user.isGetmoreMarked}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                isGetmoreMarked: e.target.checked,
                              })
                            }
                            checked={user.isGetmoreMarked}
                          />
                        </div>
                      </div>
                      {/* Blokc */}
                      <div className="relative h-20 mb-5">
                        <h3 className="dark:text-white text-lg font-bold mb-3">
                          Connect with people you know
                        </h3>
                        <p className="dark:text-gray-300 text-sm pr-12 font-thin">
                          Let others find your X account by your email address.
                        </p>
                        <div className="absolute right-0 top-7">
                          <Checkbox
                            color="blue"
                            className="h-5 w-5 rounded"
                            value={user.isConnectMarked}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                isConnectMarked: e.target.checked,
                              })
                            }
                            checked={user.isConnectMarked}
                          />
                        </div>
                      </div>
                      {/* Blokc */}
                      <div className="relative h-30 mb-5">
                        <h3 className="dark:text-white text-lg font-bold mb-3">
                          Personalized ads
                        </h3>
                        <p className="dark:text-gray-300 text-sm pr-12 font-thin">
                          You will always see ads on X based on your X activity.
                          When this setting is enabled, X may further
                          personalize ads from X advertisers, on and off X, by
                          combining your X activity with other online activity
                          and information from our partners.
                        </p>
                        <div className="absolute right-0 top-7">
                          <Checkbox
                            color="blue"
                            className="h-5 w-5 rounded"
                            value={user.isPersonalizedMarked}
                            onChange={(e) =>
                              setUser({
                                ...user,
                                isPersonalizedMarked: e.target.checked,
                              })
                            }
                            checked={user.isPersonalizedMarked}
                          />
                        </div>
                      </div>
                      {/* Blokc */}

                      <div className="relative h-20 mb-5">
                        <p className="text-gray-700 text-sm pr-12 font-thin">
                          By signing up, you agree to our Terms, Privacy Policy,
                          and Cookie Use. X may use your contact information,
                          including your email address and phone number for
                          purposes outlined in our Privacy Policy. Learn more
                        </p>
                      </div>
                    </div>
                    {/* Next Button */}
                    <div className="w-full mt-6">
                      <button
                        onClick={() => handleNextClick.bind(this, 2)()}
                        className={`bg-black text-white hover:bg-gray-800 dark:text-black dark:bg-white dark:hover:bg-gray-200  font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 3 && (
                  <>
                    <h2 className="dark:text-white font-bold my-6 text-2xl">
                      Create your account
                    </h2>
                    <div className="relative h-14">
                      <input
                        onFocus={handle3rdPageInputClick.bind(this, "name")}
                        onBlur={() => setIsNameFocused(false)}
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gtay-300 dark:border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.name}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            name: e.target.value.slice(0, 50),
                          })
                        }
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isNameFocused ? "text-blue-600" : "text-gray-600"
                        } text-sm transition-all ${
                          isNameFocused || user.name
                            ? "translate-y-[-12px] text-base"
                            : "text-lg"
                        }`}
                      >
                        Name
                      </label>

                      <div className="absolute right-2 top-7 flex justify-center items-center bg-customGreen h-4 w-4 rounded-full">
                        <IoMdCheckmark className="text-black text-xs" />
                      </div>
                    </div>
                    <div className="relative mt-6 h-14">
                      <input
                        onFocus={handle3rdPageInputClick.bind(this, "email")}
                        onBlur={() => setIsEmailFocused(false)}
                        type="email"
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gray-300 dark:border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.email}
                        onChange={(e) =>
                          setUser({ ...user, email: e.target.value })
                        }
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isEmailFocused ? "text-blue-600" : "text-gray-600"
                        }  transition-all ${
                          isEmailFocused || user.email
                            ? "translate-y-[-12px] text-sm"
                            : "text-lg"
                        }`}
                      >
                        Email
                      </label>
                      <div className="absolute right-2 top-7 flex justify-center items-center bg-customGreen h-4 w-4 rounded-full">
                        <IoMdCheckmark className="text-black text-xs" />
                      </div>
                    </div>
                    <div className="relative mt-6 h-36">
                      <input
                        onFocus={handle3rdPageInputClick.bind(this, "DOB")}
                        type="text"
                        className={`dark:text-white h-14 w-full flex items-center dark:bg-black border-gray-300 dark:border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={formattedDOB}
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 dark:bg-black ${
                          isEmailFocused ? "text-blue-600" : "text-gray-600"
                        }  transition-all ${
                          isEmailFocused || user.email
                            ? "translate-y-[-12px] text-sm"
                            : "text-lg"
                        }`}
                      >
                        Email
                      </label>
                      <div className="absolute right-2 top-7 flex justify-center items-center bg-customGreen h-4 w-4 rounded-full">
                        <IoMdCheckmark className="text-black text-xs" />
                      </div>
                    </div>
                    <span className="text-gray-600 text-xs mt-20">
                      By signing up, you agree to our Terms, Privacy Policy, and
                      Cookie Use. X may use your contact information, including
                      your email address and phone number for purposes outlined
                      in our Privacy Policy. Learn more
                    </span>

                    {/* Sign Up Button */}
                    <div className="w-full mt-6">
                      <button
                        onClick={() => handleNextClick.bind(this, 3)()}
                        className={`bg-blue-500 hover:bg-blue-500 text-white text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 4 && (
                  <>
                    <h2 className="dark:text-white font-bold mt-6 text-2xl">
                      We sent you a code
                    </h2>
                    <p className="text-gray-600 text-sm mt-2">
                      Enter it below to verify <br /> {user.email}
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
                        onClick={handleNextClick.bind(this, 4)}
                        className={`bg-black dark:bg-white dark:hover:bg-gray-200 hover:bg-gray-800 text-white dark:text-black text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={VerificationCode.length < 6}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 5 && (
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
                        value={user.password}
                        onChange={(e) =>
                          setUser({ ...user, password: e.target.value })
                        }
                        className="dark:bg-black dark:text-white w-full h-[60px] rounded-md p-4 pt-7 pr-14 border-gray-300 dark:border-gray-900 border-2 focus:outline-none focus:border-blue-600 transition-all "
                      />
                      <label
                        htmlFor="email"
                        className={`absolute top-4 left-4  ${
                          isPasswordFocused ? "text-blue-600" : "text-gray-800"
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

                    {/* Next Button */}
                    <div className="w-full mt-[370px]">
                      <button
                        onClick={handleNextClick.bind(this, 5)}
                        className={`dark:bg-white dark:hover:bg-gray-200 bg-black text-white hover:bg-gray-800 dark:text-black text-base font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={user.password.length < 8}
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

export default RegisterPopup;
