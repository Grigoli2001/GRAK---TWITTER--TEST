import { createContext } from 'react';
import { users } from '../constants/feedTest'

export const UserContext = createContext(null);
const user = users[0];

export const UserProvider = ({ children }) => {
    return (
        <UserContext.Provider value={{user}}>
            {children}
        </UserContext.Provider>
    )
}