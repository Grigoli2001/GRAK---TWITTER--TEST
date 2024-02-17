import ReactLoading from "react-loading";
import { IoMdClose } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { Checkbox } from "@material-tailwind/react";
import { IoMdArrowBack, IoMdCheckmark } from "react-icons/io";
import { FiBell } from "react-icons/fi";
import { TbCameraPlus } from "react-icons/tb";
import instance from "../../constants/axios";
import { requests } from "../../constants/requests";
import useAppStateContext from "../../hooks/useAppStateContext";
import { useNavigate } from "react-router-dom";
import { topics } from "../../constants/feedTest";
import { UserDisplayer } from "../User";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../../context/testUserContext";

const AfterRegistrationPopup = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(2);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [languages, setLanguages] = useState(["English", "French"]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState();
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).token
    : null;
  const { user, setUser } = useContext(UserContext);
  const [userName, setUserName] = useState(user.username);
  const [profilePic, setProfilePic] = useState(null);
  const [display, setDisplay] = useState("/uploads/default_profile_pic.jpg");
  const justRegistered = localStorage.getItem("justRegistered");
  const Navigate = useNavigate();
  useEffect(() => {
    if (!justRegistered) {
      Navigate("/home");
    }
  }, []);
  console.log(display);

  const handleNext = (page) => {
    switch (page) {
      case 1:
        setCurrentPage(2);
        break;
      case 2:
        setCurrentPage(3);
        break;
      case 3:
        setCurrentPage(4);
        break;
      case 4:
        setCurrentPage(5);
        break;
      case 5:
        setCurrentPage(6);
        break;
      case 6:
        setLoading(true);
        if (userName !== user.username) {
          instance
            .post(
              requests.changeUsername,
              {
                newUsername: userName,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => {
              if (res.status === 200) {
                setLoading(false);
                setCurrentPage(7);
                setUser({ ...user, username: userName });
              } else {
                setLoading(false);
                setIsUsernameAvailable(false);
                setMessage("Something went wrong, please try again");
              }
            })
            .catch((err) => {
              setIsUsernameAvailable(false);
              setMessage("Something went wrong, please try again");
              setLoading(false);
            });
          break;
        }
        setLoading(false);
        setCurrentPage(7);
        break;

      case 7:
        setLoading(true);
        console.log("profilePic", profilePic);
        const data = new FormData();
        data.append("userId", user.id);
        data.append("selectedTopics", selectedTopics);
        data.append("selectedCategories", selectedCategories);
        data.append("selectedLanguages", selectedLanguages);
        data.append("userName", userName);
        data.append("profile_pic", profilePic);

        instance
          .post(requests.userPreferences, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            if (res.status === 200) {
              setLoading(false);
              localStorage.removeItem("justRegistered");
              Navigate("/home");
            }
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
        setLoading(false);
      default:
        break;
    }
  };
  const renderTopicsGrid = () => {
    return topics.map(({ category, topic }) => (
      <div key={category} className="mb-6 border-b-2 border-gray-800">
        <h2 className="text-white text-lg font-bold">{category}</h2>
        <div className="my-2 w-[140%] overflow-x-auto">
          <div className="grid grid-cols-3 gap-2">
            {topic.map((topicItem) => (
              <div
                onClick={() => handleSelectedTopics(topicItem)}
                key={topicItem}
                className={`text-white font-medium text-sm border-2 border-gray-700 rounded-full p-3 cursor-pointer ${
                  selectedTopics.includes(topicItem)
                    ? "bg-twitter-blue"
                    : "bg-transparent"
                }`}
              >
                {topicItem}
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  };

  const renderCategoryNameGrid = () => {
    return topics.map(({ category }) => (
      <div
        key={category}
        className={`border-2 rounded-lg border-gray-700  flex flex-row justify-between p-3 h-[100px] ${
          selectedCategories.includes(category) && `bg-twitter-blue relative`
        }`}
        onClick={() => handleSelectedCategories(category)}
      >
        <h2 className="text-white text-sm font-bold flex flex-col h-full justify-end max-w-[90%]">
          {category}
        </h2>
        {selectedCategories.includes(category) && (
          <div>
            <div>
              <IoMdCheckmark className="bg-white text-twitter-blue rounded-full font-light text-sm size-4 absolute right-2 top-2" />
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderLanguages = () => {
    return languages.map((language, index) => (
      <div
        key={index}
        className="flex justify-between items-center border-b-2 border-gray-600"
      >
        <p className="text-white">{language}</p>
        <Checkbox
          value={language}
          onChange={() => handleSelectedlanguages(language)}
        />
      </div>
    ));
  };

  const handleSelectedlanguages = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(
        selectedLanguages.filter((item) => item !== language)
      );
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
    console.log(selectedLanguages);
  };
  const handleSelectedTopics = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((item) => item !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
    console.log(selectedTopics);
  };

  const handleSelectedCategories = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
    console.log(selectedCategories);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    if (Notification.permission === "granted") {
      console.log("Notification permission already granted");
      handleNext(5);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      handleNext(5);
    }
  };

  const checkUserNameAvailability = async () => {
    setIsUsernameFocused(false);
    if (userName === user.username) {
      setIsUsernameAvailable(true);
      return;
    }
    if (userName.length < 3) {
      setIsUsernameAvailable(false);
      setMessage("Username must be at least 3 characters");
      return;
    }
    instance
      .post(
        requests.check,
        { userInfo: userName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data.message === "User does not exist") {
          setIsUsernameAvailable(true);
        } else {
          setIsUsernameAvailable(false);
          setMessage("Username is not available");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="w-screen h-screen bg-gray-500/55 overflow-hidden z-[99999]">
      <div className=" w-[600px] min-h-[300px] h-[650px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black rounded-xl pb-6 z-50">
        {loading ? (
          <ReactLoading
            type={"spin"}
            color={"blue"}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <div>
            <div className="flex flex-row items-center justify-center">
              {/* <button
                onClick={
                  currentPage === 1
                    ? onClose
                    : () => setCurrentPage(currentPage - 1)
                }
                className="hover:bg-blue-gray-100 dark:hover:bg-blue-gray-900 rounded-full dark:text-white font-bold m-2 p-2"
              >
                {currentPage === 1 ? <IoMdClose /> : <IoMdArrowBack />}
              </button> */}
              <div className="mt-2">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-8 r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1nao33i r-rxcuwo r-1777fci r-m327ed r-494qqr fill-current dark:text-gray-50"
                >
                  <g>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </g>
                </svg>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col w-9/12 relative mt-6">
                {currentPage === 2 && (
                  <>
                    <h1 className="text-white text-[33px] font-medium leading-tight">
                      What do you want to see on X?
                    </h1>
                    <p className="text-gray-500 text-[16px] leading-none">
                      Interests are used to personalize your experience and will
                      be visible on your profile
                    </p>
                    <div className="m-5 w-[400px] max-h-[360px] overflow-y-scroll scrollbar-thin scrollbar-thumb-blue-gray-500 scrollbar-track-black overflow-x-scroll">
                      {renderTopicsGrid()}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => handleNext(2)}
                        className="font-medium bg-blue-gray-400 p-2 rounded-full w-full h-12"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 3 && (
                  <>
                    <h1 className="text-white text-[33px] font-medium leading-tight">
                      What do you want to see on X?
                    </h1>
                    <p className="text-gray-500 text-[17px] leading-tight">
                      Select at least 3 interests to personalize your X
                      experience. They will be visible on your profile.
                    </p>
                    <div className="min-h-[360px] max-h-[360px] overflow-x-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-blue-gray-500 scrollbar-track-black">
                      <div className="m-5 w-[400px] max-h-[200%] grid grid-cols-3 gap-3">
                        {renderCategoryNameGrid()}
                      </div>
                    </div>

                    <div className="flex justify-between ">
                      {/* counter minimum 3 selected */}
                      <div className="flex justify-center align-middle h-full">
                        <p className="text-gray-700 text-[17px] align-middle flex justify-center items-center">
                          {selectedCategories.length < 3
                            ? selectedCategories.length + " of 3 selected"
                            : "Good job"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleNext(3)}
                        className={`font-medium ${
                          selectedCategories.length < 3
                            ? "bg-blue-gray-400"
                            : "bg-twitter-blue"
                        } p-2 rounded-full w-36 h-12 transition-all`}
                        disabled={selectedCategories.length < 3}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {currentPage === 4 && (
                  <>
                    <h1 className="text-white text-[33px] font-medium leading-tight">
                      Which languages do you speak?
                    </h1>
                    <p className="text-gray-500 text-[16px] leading-none">
                      Interests are used to personalize your experience and will
                      be visible on your profile
                    </p>
                    <div className="flex flex-col h-[360px]">
                      {renderLanguages()}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleNext(4)}
                        className="font-medium bg-blue-gray-200 p-2 rounded-full w-full h-12"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
                {currentPage === 5 && (
                  <>
                    <div className="flex justify-center align-middle items-center mt-10 mb-10">
                      <FiBell className="text-twitter-blue size-12 " />
                    </div>
                    <h1 className="text-white text-[33px] font-medium leading-tight mb-4">
                      Turn on Notifications
                    </h1>
                    <p className="text-gray-500 text-[16px] leading-none">
                      Get the most out of X by staying up to date with what's
                      happening
                    </p>
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={() => requestNotificationPermission()}
                        className="font-medium bg-gray-200 p-2 rounded-full w-full h-12 hover:bg-gray-400"
                      >
                        Allow Notifications
                      </button>
                    </div>
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => handleNext(5)}
                        className="font-medium bg-none text-white border-2 border-gray-600 p-2 rounded-full w-full h-12 hover:bg-gray-800"
                      >
                        Skip for now
                      </button>
                    </div>
                  </>
                )}
                {currentPage === 6 && (
                  <>
                    <h1 className="text-white text-[33px] font-medium leading-tight">
                      What should we call you?{" "}
                    </h1>
                    <p className="text-gray-500 text-[16px] h-12 ">
                      Your @username is unique. You can always change it later.
                    </p>
                    <div className="mt-7 relative h-[360px]">
                      <input
                        onFocus={() => setIsUsernameFocused(true)}
                        onBlur={() => checkUserNameAvailability()}
                        type="text"
                        value={userName}
                        onChange={(e) =>
                          setUserName(e.target.value.toLowerCase().trim())
                        }
                        className={`dark:bg-black dark:text-white w-[300px] h-[60px] rounded-md p-4 pt-7 pl-7 border-gray-300 dark:border-gray-900 ${
                          isUsernameAvailable === false &&
                          "border-red-700 dark:border-red-700"
                        }  border-2 focus:outline-none focus:border-blue-600 transition-all `}
                      />
                      <label
                        htmlFor="email"
                        className={`absolute top-4 left-4  ${
                          isUsernameFocused ? "text-blue-600" : "text-gray-400"
                        } transition-all text-base ${"translate-y-[-12px] text-sm"}`}
                      >
                        Username
                      </label>
                      <span className="text-gray-400 absolute left-2 top-6">
                        @
                      </span>
                    </div>
                    {isUsernameAvailable === false && (
                      <p className="text-red-500 text-sm absolute left-0 top-[180px]">
                        {message}
                      </p>
                    )}
                    <div className="flex justify-center">
                      {userName === user.username ? (
                        <button
                          onClick={() => handleNext(6)}
                          className="font-medium text-white p-2 border-2 border-gray-500 hover:bg-gray-800 rounded-full w-full h-12"
                        >
                          Skip for now
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNext(6)}
                          className="font-medium bg-white disabled:bg-blue-gray-200 p-2 rounded-full w-full h-12 hover:bg-gray-300 transition-all"
                          disabled={!isUsernameAvailable}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </>
                )}
                {currentPage === 7 && (
                  <>
                    <h1 className="text-white text-[33px] font-medium leading-tight">
                      Pick a profile picture
                    </h1>
                    <p className="text-gray-500 text-[16px] h-12 ">
                      Have a favorite selfie? Upload it now.
                    </p>
                    <div className="group mt-12">
                      <label className="text-white rounded-full cursor-pointer flex align-middle justify-center items-center">
                        <div className="h-52 w-52  rounded-full border-2 flex align-middle items-center justify-center relative">
                          <img
                            src={display}
                            alt="profile"
                            className="h-[200px] w-[200px] rounded-full object-cover"
                          />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            id="profilePic"
                            onChange={(e) => {
                              setDisplay(
                                URL.createObjectURL(e.target.files[0])
                              );
                              setProfilePic(e.target.files[0]);
                            }}
                          />
                          <div className="bg-gray-500/60 h-[200px] w-[200px] rounded-full absolute top-0 right-0 align-middle justify-center items-center hidden group-hover:flex">
                            <div className="size-12 bg-gray-800/55 flex align-middle justify-center items-center rounded-full">
                              <TbCameraPlus className="text-white size-6" />
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex justify-center mt-40">
                      {profilePic ? (
                        <button
                          onClick={() => handleNext(7)}
                          className="font-medium bg-twitter-blue p-2 rounded-full w-full h-12"
                        >
                          finish
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleNext(7)}
                          className="font-medium text-white p-2 border-2 border-gray-500 hover:bg-gray-800 rounded-full w-full h-12"
                        >
                          skip for now
                        </button>
                      )}
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
export default AfterRegistrationPopup;
