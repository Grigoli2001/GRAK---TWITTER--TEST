import ReactLoading from "react-loading";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { Checkbox } from "@material-tailwind/react";
import { IoMdArrowBack } from "react-icons/io";
import { FaEyeSlash, FaRegEye } from "react-icons/fa";
import instance from "../../constants/axios";
import { requests } from "../../constants/requests";
import { useNavigate } from "react-router-dom";
import useUserContext from "../../hooks/useUserContext";

const AdditionalInfo = ({ onClose, user, setUser }) => {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { dispatch } = useUserContext();
  const navigate = useNavigate();
  const handleNextClick = (page) => {
    switch (page) {
      case 1:
        setCurrentPage(2);
        break;
      case 2:
        setLoading(true);
        instance
          .post(requests.signup, {
            ...user,
          })
          .then((response) => {
            console.log(response);
            dispatch({
              type: "Login",
              payload: response.data,
            });
            localStorage.setItem("justRegistered", "true");
            navigate("/after-registration");
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });

        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className=" w-[600px] min-h-[300px] h-[650px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black rounded-xl pb-6 z-50">
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
                Step {currentPage} of 2
              </h3>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col w-9/12 relative">
                {/* start of the content by page */}

                {currentPage === 1 && (
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
                        onClick={() => handleNextClick.bind(this, 1)()}
                        className={`bg-black text-white hover:bg-gray-800 dark:text-black dark:bg-white dark:hover:bg-gray-200  font-semibold py-2 px-4 rounded-full w-full h-12 disabled:opacity-50 transition-all`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 2 && (
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
                        onClick={handleNextClick.bind(this, 2)}
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
export default AdditionalInfo;
