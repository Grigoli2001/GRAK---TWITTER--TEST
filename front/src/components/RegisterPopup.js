import React, { useState, useEffect } from "react";
import { IoMdClose, IoMdArrowBack } from "react-icons/io";
import ReactLoading from "react-loading";
import { Checkbox } from "@material-tailwind/react";

const RegisterPopup = ({ onClose }) => {
  const [user, setuser] = useState({
    name: "",
    password: "",
    email: "",
    phone: "",
    month: "",
    day: "",
    year: "",
    isGetmoreMarked: false,
    isConnectMarked: false,
    isPersonalizedMarked: false,
  });
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isMonthFocused, setIsMonthFocused] = useState(false);
  const [isDayFocused, setIsDayFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
  //   Year from 1900 to 2023
  const years = Array.from(Array(123).keys())
    .map((year) => year + 1900)
    .reverse();
  //   I just added this for fun and to see if it works and maybe we can use it when we check whether email already exists or not
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  return (
    <div>
      <div className=" w-[600px] min-h-[300px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black rounded-xl pb-6 ">
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
                className=" hover:bg-blue-gray-900 rounded-full text-white font-bold m-2 p-2"
              >
                {currentPage === 1 ? <IoMdClose /> : <IoMdArrowBack />}
              </button>
              <h3 className="text-white font-bold m-2">
                Step {currentPage} of 5
              </h3>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col w-9/12">
                {/* start of the content by page */}
                {currentPage === 1 && (
                  <>
                    <h2 className="text-white font-bold my-6 text-2xl">
                      Create your account
                    </h2>
                    {/* single input container */}
                    {/* Change possible */}
                    <div className="relative h-14">
                      <input
                        // color={user.name.length >= 4 ? "blue" : "blueGray"}
                        // label="Name"
                        // size="lg"
                        // prettier-ignore
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        className={`text-white h-14 w-full flex items-center bg-black border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.name}
                        onChange={(e) =>
                          setuser({
                            ...user,
                            name: e.target.value.slice(0, 50),
                          })
                        }
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 bg-black ${
                          isNameFocused ? "text-blue-600" : "text-gray-600"
                        } text-sm transition-all ${
                          isNameFocused || user.name
                            ? "translate-y-[-12px] text-base"
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
                    {/* single input container */}
                    <div className="relative mt-6 h-20">
                      <input
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        type="email"
                        className={`text-white h-14 w-full flex items-center bg-black border-gray-600 border-2  rounded-md p-3 pt-8 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                        value={user.email}
                        onChange={(e) =>
                          setuser({ ...user, email: e.target.value })
                        }
                      />
                      <label
                        className={`absolute left-3 top-4 m-0 p-0 bg-black ${
                          isEmailFocused ? "text-blue-600" : "text-gray-600"
                        } text-sm transition-all ${
                          isEmailFocused || user.email
                            ? "translate-y-[-12px] text-base"
                            : "text-lg"
                        }`}
                      >
                        Email
                      </label>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold text-sm mb-2">
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
                          className={`text-white h-16 bg-black  ${
                            isMonthFocused
                              ? "border-blue-600"
                              : "border-gray-600"
                          } border-2 rounded-md w-full text-bottom pt-4 pl-1`}
                          value={user.month}
                          onChange={(e) =>
                            setuser({ ...user, month: e.target.value })
                          }
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
                          className={`text-white h-16 bg-black ${
                            isDayFocused ? "border-blue-600" : "border-gray-600"
                          } border-2 rounded-md w-full pt-4 pl-1`}
                          value={user.day}
                          onChange={(e) =>
                            setuser({ ...user, day: e.target.value })
                          }
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
                          className={`text-white h-16 bg-black ${
                            isYearFocused
                              ? "border-blue-600"
                              : "border-gray-600"
                          } border-2 rounded-md w-full text-bottom pt-4`}
                          value={user.year}
                          onChange={(e) =>
                            setuser({ ...user, year: e.target.value })
                          }
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
                    <div className="w-full mt-6">
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`bg-white hover:bg-gray-200  font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                        disabled={
                          user.name.length < 4 ||
                          user.email.length < 4 ||
                          user.month.length < 1 ||
                          user.day.length < 1 ||
                          user.year.length < 1
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
                    <h2 className="text-white font-extrabold my-6 text-[29px]">
                      Customize your experience
                    </h2>
                    <div className="overflow-scroll overflow-x-hidden h-[420px]">
                      {/* Blokc */}
                      <div className="relative h-20 mb-5">
                        <h3 className="text-white text-lg font-bold mb-3">
                          Get more out of X
                        </h3>
                        <p className="text-gray-300 text-sm pr-12 font-thin">
                          Receive email about your X activity and
                          recommendations.
                        </p>
                        <div className="absolute right-0 top-7">
                          <Checkbox
                            color="blue"
                            className="h-5 w-5 rounded"
                            value={user.isGetmoreMarked}
                            onChange={(e) =>
                              setuser({
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
                        <h3 className="text-white text-lg font-bold mb-3">
                          Connect with people you know
                        </h3>
                        <p className="text-gray-300 text-sm pr-12 font-thin">
                          Let others find your X account by your email address.
                        </p>
                        <div className="absolute right-0 top-7">
                          <Checkbox
                            color="blue"
                            className="h-5 w-5 rounded"
                            value={user.isConnectMarked}
                            onChange={(e) =>
                              setuser({
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
                        <h3 className="text-white text-lg font-bold mb-3">
                          Personalized ads
                        </h3>
                        <p className="text-gray-300 text-sm pr-12 font-thin">
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
                              setuser({
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
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`bg-white hover:bg-gray-200  font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 3 && <></>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPopup;
