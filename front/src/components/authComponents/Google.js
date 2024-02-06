import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import instance from "../../constants/axios";

// TODO - Add Google OAuth
// TODO - Responsive design
const Google = () => {
  return (
    <>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
          const token = credentialResponse?.credential;
          const decodedToken = jwtDecode(token);
          console.log(decodedToken);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        shape="circle"
        text="Sign up with Google"
        width={300}
      />
      ;
    </>
  );
};
export default Google;
