import { io } from 'socket.io-client';
import { createContext} from 'react';
import { createToast } from '../hooks/createToast';

// TODO connect socket when logged in
const socket = io('http://backend:4000', {
  auth: {
    token: localStorage.getItem('user')  ? JSON.parse(localStorage.getItem('user')).token : null,
  },
  autoConnect: false
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
