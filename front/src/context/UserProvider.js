import { createContext, useReducer, useEffect} from "react";
import UserReducer from "./userReducer";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import {SocketContext} from "./socketContext";
import { createToast } from "../hooks/createToast";

const token = JSON.parse(localStorage.getItem("user"))?.token;
const INITIAL_STATE = {
  isAuthenticated: localStorage.getItem("user") ? true : false,
  token: token ?? null,
  refresh: localStorage.getItem("refreshToken") ? localStorage.getItem("refreshToken") : null,
  user: token ? jwtDecode(token).user || jwtDecode(token) : null,
};

export const UserContext = createContext(INITIAL_STATE);

export const UserProvider = ({ children }) => {
  const [userState, dispatch] = useReducer(UserReducer, INITIAL_STATE);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (userState.token) {
      socket.auth = { token: userState.token };
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("Connected to socket");
    });
    return () => {
      socket.disconnect();
    };
  }, [userState.token]);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      createToast("error", "Socket connection failed");
      dispatch({ type: "LOGOUT" });
    });

    return () => {
      socket.off("connect_error"); 
    }
  }, [socket]);
    
socket.on("connect_error", (err) => {
  createToast("error", "Socket connection failed");
});

  

  return (
    <UserContext.Provider value={{ user: userState.user,token: userState.token, isAuthenticated: userState.isAuthenticated , dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
