import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserContext from "../../hooks/useUserContext";

import NavModal from "../NavModal";
import CustomInput from "../CustomInput";
import { ExtAvatar } from "../User";
import { Route } from "react-router-dom";
import { Button } from "../Button";
import { FaXmark } from "react-icons/fa6";
import { CICameraPlus } from "../customIcons";

import { cn } from "../../utils/style";
import OptionSelector from "../OptionSelector";
import { months, getDaysInMonth, getYears, defaultAvatar } from "../../utils/utils";
import instance from "../../constants/axios";
import { requests } from "../../constants/requests";

import { storage } from "../../utils/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { createToast } from "../../hooks/createToast";
import { QueryClient } from "@tanstack/react-query";

const PhotoModal = ({ type, backTo }) => {
  // code to get a user since it is routable & reject if user does not exist

  // demo
  const { username } = useParams();
  const [user , setUser] = useState({})
  
  useEffect(() => {
    instance.get(requests.getUser, {params:{username: username}}).then(res => {
      setUser(res.data.user)
    }).catch(err => {
      console.error(err)
    })
  },[username])
  const navigate = useNavigate();

  return (
    <NavModal backTo={backTo}>
      <Button
        onClick={() => {
          navigate(backTo || -1);
        }}
        variant="icon"
        size="icon-sm"
        tooltip="Close"
        className="z-[1000] absolute top-4 left-4 text-white hover:bg-black/30 bg-black/50 transition-colors duration-300"
      >
        <FaXmark />
      </Button>

      <div
        className={cn("flex items-center justify-center", {
          "w-full h-[75%]": type === "cover",
        })}
      >
        {type === "cover" ? (
          <img
            src={user?.cover}
            alt="cover"
            className="w-full max-h-full object-cover"
          />
        ) : (
          <ExtAvatar src={user?.profile_pic} className="w-48 h-48" />
        )}
      </div>
    </NavModal>
  );
};

const EditProfileModal = ({ backTo }) => {
  const { user, dispatch } = useUserContext();
  const navigate = useNavigate();

  const formConstant = {
    name: {
      placeholder: "Name",
      maxLength: 50,
    },
    username: {
      placeholder: "Username",
      maxLength: 15,
    },
    bio: {
      placeholder: "Bio",
      maxLength: 150,
    },
    location: {
      placeholder: "Location",
      maxLength: 50,
    },
    website: {
      placeholder: "Website",
      maxLength: 50,
    },
  };

  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();
  const [dayOptions, setDayOptions] = useState();
  const years = getYears(16, 100);
  const queryClient = new QueryClient();

  const [formState, setFormState] = useState({})
    // id: user?.id,
    // name: user?.name || "",
    // username: user?.username || "",
    // bio: user?.bio || "",
    // location: user?.location || "",
    // profile_pic: user?.profile_pic || "",
    // website: user?.website || "",
    // cover: user?.cover || "",
    // dob: user.dob,
  // });

  useEffect(() => {
    instance.get(requests.getUser, {params: {id: user.id}}).then(res => {

      // remove unneeded fields
      const { email, dob,profile_pic,cover,created_at,  ...formData } = res.data.user;
      console.log(res.data.user, 'user')
      setFormState(formData)          

      // set dob for option selector
      const date = new Date(res.data.user.dob);  
      setDay(date.getDate());
      setMonth(getMonthCounterpart(date.getMonth()));
      setYear(date.getFullYear());
      setDayOptions(getDaysInMonth(date.getFullYear(), months.indexOf(getMonthCounterpart(date.getMonth()))))
      setLoading(false)
    }).catch(err => {
      console.error(err)
    })
  },[user.id])

  function getMonthCounterpart(month) {
    const monthMap = {
        '0': 'January',
        '1': 'February',
        '2': 'March',
        '3': 'April',
        '4': 'May',
        '5': 'June',
        '6': 'July',
        '7': 'August',
        '8': 'September',
        '9': 'October',
        '10': 'November',
        '11': 'December',
        'January': '1',
        'February': '2',
        'March': '3',
        'April': '4',
        'May': '5',
        'June': '6',
        'July': '7',
        'August': '8',
        'September': '9',
        'October': '10',
        'November': '11',
        'December': '12'
    };

    // If the month is a number, convert it to string and return its counterpart
    if (!isNaN(month)) {
        month = month.toString();
    }

    return monthMap[month];
  }

  const handleUpdateForm = (e) => {
    const fieldMaxLength = formConstant[e.target.name].maxLength;
    if (e.target.value.length > fieldMaxLength) {
      e.target.value = e.target.value.slice(0, fieldMaxLength);
      return;
    }
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfilePic = ( image ) => {
    if (!image) return;
    
    const storageRef = ref(storage, `profile_pics/${formState.id}/profile_image`);
    uploadBytesResumable(storageRef, image).then((snapshot) => {
      console.log("Uploaded a blob or file!", snapshot);
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
        setFormState({ ...formState, profile_pic: downloadURL });
      }).catch((error) => {
        // console.error("Error getting download URL:", error);
      });
    }).catch((error) => {
      console.error("Error uploading file:", error);
    });
  };

  const handleUpdateCoverPic = ( image ) => {
    console.log('cover', formState.cover)
    if (!image) return;

    const storageRef = ref(storage, `cover_pics/${formState.id}/cover_image`);
    uploadBytesResumable(storageRef, image).then((snapshot) => {
      console.log("Uploaded a blob or file!", snapshot);
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
        setFormState({ ...formState, cover: downloadURL });
        console.log('cover2', formState.cover)
      }).catch((error) => {
        console.error("Error getting download URL:", error);
      });
    }).catch((error) => {
      console.error("Error uploading file:", error);
    });
  };

  const updateProfile = () => {
    console.log(year, month, day, 'date')
    const dob = new Date(`${year}-${months.indexOf(month) + 1}-${day}`).toISOString();
    instance.post(requests.updateUser, {...formState, dob})
    .then(res => {
      createToast('Profile updated', 'success', 'profile-updated', {limit: 1})
      queryClient.invalidateQueries(['user', user.username])
      dispatch({type: 'UPDATE', payload: formState})
      navigate(`/${formState.username}`)
      
    }).catch(err => {
      createToast('Error updating profile', 'error', 'errorr-updating-profile', {limit: 1})
    })
  };

  // if (loading) {
  //   return <p>Loading...</p>; // Render loading indicator until data is fetched
  // }

  return (
    <NavModal backTo={backTo}>
      <div className="block w-fit h-[80%] min-w-[40%] overflow-y-auto bg-white rounded-2xl">
        <div className="flex items-center p-4">
          <Button
            onClick={() => navigate(backTo || -1)}
            variant="icon"
            tooltip={"Close"}
            size="icon-sm"
            className="text-black bg-transparent hover:bg-gray-200/75 transition-colors duration-300"
          >
            <FaXmark />
          </Button>
          <h4 className="text-xl font-bold text-black ml-6">Edit Proifle</h4>
          <Button
            variant="dark"
            size="sm"
            className="ml-auto"
            onClick={updateProfile}
          >
            Save
          </Button>
        </div>

        <div className="h-48 w-full relative mb-6 bg-slate-300 col-span-full flex items-center justify-center gap-x-4 bm-8">
          <div id="cover_photo" className="h-full w-full absolute z-10">
              {
                formState.cover && 
                  <img
                  src={formState.cover}
                  alt="cover"
                  className="w-full h-full object-cover"
                />

              }
              
             
          </div>

          <div className="z-20 flex items-center justify-center gap-x-4">
            <Button
              variant={"icon"}
              size={"icon-sm"}
              tooltip={"Change cover photo"}
              className="bg-black/50 hover:bg-black/30"
            >
              <label htmlFor="profile-cover">
                <CICameraPlus />
                <input
                  id="profile-cover"
                  name="profile-cover"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpdateCoverPic(e.target.files[0])}
                />
              </label>
            </Button>

            {formState?.cover && (

              <Button
              onClick={() => {setFormState({...formState, cover: ''})}}
                variant="icon"
                size="icon-sm"
                tooltip="Remove cover photo"
                className="bg-black/50 hover:bg-black/30 text-white"
              >
                <FaXmark />
              </Button>
            )}
          </div>

          <div className="absolute left-5 z-20 bottom-[-25%]">
            <div className="top-0 z-[1000] rounded-full absolute p-1 flex items-center justify-center bg-slate-700 bg-opacity-25 h-28 w-28">
              <Button
                variant={"icon"}
                size={"icon-sm"}
                tooltip={"Change profile photo"}
                className="bg-black/50 hover:bg-black/30"
              >
                <label htmlFor="profile-photo">
                  <CICameraPlus />
                  <input
                    id="profile-photo"
                    name="profile-photo"
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpdateProfilePic(e.target.files[0])}
                  />
                </label>
              </Button>
            </div>
            <ExtAvatar
              user={user?.profile_pic}
              src={formState?.profile_pic || null}
              size="lg"
              className={
                "rounded-[50%] bg-white p-1 h-28 w-28 object-cover shadow-inner"
              }
            />
          </div>
        </div>

        {/* place all fields here */}
        <div className="p-4 mt-10 grid gap-y-3">
          {Object.keys(formState).filter(key => !['profile_pic', 'cover', 'id', 'dob'].includes(key)).map((field, index) => {
            return (
              <CustomInput
                key={index}
                name={field}
                maxLength={formConstant[field]?.maxLength}
                value={formState[field]}
                placeholder={formConstant[field]?.placeholder}
                handleUpdate={handleUpdateForm}
                withTextCount={true}
                asTextArea={field === "bio"}
              />
            );
          })}

          <div>
            <span className="text-sm">Birth date</span>
            <div className="flex gap-x-2">
              <OptionSelector
                title="Day"
                options={dayOptions}
                name={"day"}
                defaultValue={day}
                onChange={(e, newVal) => {
                  setDay(newVal)
                  // setDob()
                }}
              />

              <OptionSelector
                title="Month"
                options={months}
                defaultValue={month}
                onChange={(e, newVal) => {
                  setMonth(newVal);
                  setDayOptions(getDaysInMonth(year, months.indexOf(newVal)))
                  // setDob()
                }}
              />

              <OptionSelector
                title="Year"
                options={years}
                defaultValue={year}
                onChange={(e, newVal) => {
                  setYear(newVal);
                  setDayOptions(getDaysInMonth(newVal, months.indexOf(month)))
                  // setDob()
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </NavModal>
  );
};

export const ProfileModalRoutes = (backTo) => {
  return (
    <Route path=":username">
      <Route
        path="cover"
        element={<PhotoModal type={"cover"} backTo={backTo} />}
      />
      <Route
        path="photo"
        element={<PhotoModal type={"photo"} backTo={backTo} />}
      />
    </Route>
  );
};

export const ProfileEditRoutes = (backTo) => {
  return (
    <Route
      path="/settings/profile"
    element={<EditProfileModal backTo={backTo} />}
    />
  );
};
