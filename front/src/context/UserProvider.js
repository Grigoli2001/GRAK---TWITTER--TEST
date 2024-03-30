import { createContext, useEffect, useReducer, useState } from "react";
import UserReducer from "./userReducer";
import { jwtDecode } from "jwt-decode";
import instance from "../constants/axios";

const token = JSON.parse(localStorage.getItem("user"))?.token;
const INITIAL_STATE = {
  isAuthenticated: localStorage.getItem("user") ? true : false,
  token: token ? token : null,
  refresh: localStorage.getItem("refreshToken") ? localStorage.getItem("refreshToken") : null,
  user: token ? jwtDecode(token).user || jwtDecode(token) : null,
};

export const UserContext = createContext(INITIAL_STATE);

export const UserProvider = ({ children }) => {
  const [userState, dispatch] = useReducer(UserReducer, INITIAL_STATE);
  // const [user, setUser] = useState(userState.user)

  // useEffect(() => {
  //   instance.get('/user/user').then((res) => {
  //     setUser(res.data.user)
  //   }
  //   ).catch((err) => {
  //     console.log(err)
  //   })
  // }, [userState.token])

  return (
    <UserContext.Provider value={{ user: userState.user,token: userState.token, isAuthenticated: userState.isAuthenticated , dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
