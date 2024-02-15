import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { requests } from "../../constants/requests";
import instance from "../../constants/axios";
import useAppStateContext from "../../hooks/useAppStateContext";
import AdditionalInfo from "./AdditionalInfo";
import { useState } from "react";
// TODO - Add Google OAuth
// TODO - Responsive design
const Google = ({ user, setUser }) => {
  const { dispatch } = useAppStateContext();
  const [isAddtionalInfoOpen, setIsAddtionalInfoOpen] = useState(false);
  const handleLogin = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    const decodedToken = jwtDecode(token);
    const responseCheck = await instance.post(requests.check, {
      userInfo: decodedToken.email,
    });
    if (responseCheck.data.message === "User exists") {
      console.log("User exists");
      const responseLogin = await instance.post(requests.login, {
        userInfo: decodedToken.email,
        usingGoogle: true,
      });
      dispatch({
        type: "Login",
        payload: responseLogin.data,
      });
    } else {
      console.log(decodedToken);
      setUser({
        ...user,
        email: decodedToken.email,
        name: decodedToken.name,
        dob: `${1950}-${String(1).padStart(2, "0")}-${1}`,
        profile_pic: decodedToken.picture,
      });
      setIsAddtionalInfoOpen(true);
    }
  };
  const handleClose = () => {
    setIsAddtionalInfoOpen(false);
    setUser({ ...user, email: "", name: "" });
  };
  return (
    <>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          handleLogin(credentialResponse);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        shape="circle"
        text="Sign up with Google"
        width={300}
      />
      {isAddtionalInfoOpen && (
        <AdditionalInfo onClose={handleClose} user={user} setUser={setUser} />
      )}
    </>
  );
};
export default Google;
