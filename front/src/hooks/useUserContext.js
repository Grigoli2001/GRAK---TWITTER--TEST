import { useContext } from "react";
import { UserContext } from "../context/UserProvider";

const useUserContext = () => {
  return useContext(UserContext);
};

export default useUserContext;
