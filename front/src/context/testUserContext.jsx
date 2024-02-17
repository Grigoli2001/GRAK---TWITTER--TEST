import { createContext, useState } from "react";
import { users } from "../constants/feedTest";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();
const token = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")).token
  : null;
const decodedToken = token ? jwtDecode(token) : null;


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(decodedToken ? decodedToken.user : users[0]);
  return (
    <UserContext.Provider value={{ user : user, setUser : setUser }}>{children}</UserContext.Provider>
  );
};
