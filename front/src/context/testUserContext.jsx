import { createContext } from "react";
import { users } from "../constants/feedTest";

export const UserContext = createContext(null);
const user = users[6];

export const UserProvider = ({ children }) => {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};
