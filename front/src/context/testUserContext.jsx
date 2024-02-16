import { createContext } from "react";
import { users } from "../constants/feedTest";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext(null);
const token = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")).token
  : null;
const decodedToken = token ? jwtDecode(token) : null;
const user = decodedToken.user || users[0];
console.log("user", user);

export const UserProvider = ({ children }) => {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};
