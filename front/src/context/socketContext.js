import { io } from 'socket.io-client';
import { createContext} from 'react';
import { toast } from 'react-toastify';
// TODO connect socket when logged in
const socket = io('http://localhost:4000', {
  auth: {
    token: localStorage.getItem('user')  ? JSON.parse(localStorage.getItem('user')).token : null,
  }
});

socket.on("connect_error", (err) => {
});

export const SocketContext = createContext({ socket })
const SocketProvider = ({ children }) => { 
    return (
        <SocketContext.Provider value={{ socket }}>
          {children}
        </SocketContext.Provider>
    )
    }

export default SocketProvider;
