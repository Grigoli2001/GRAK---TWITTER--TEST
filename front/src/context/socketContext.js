import { io } from 'socket.io-client';
import { createContext} from 'react';
// TODO connect socket when logged in
const socket = io('http://localhost:4000', 
                // { autoConnect: false }
                )
  // register token 
  // socket.on('connect', () => {
  //   console.log('connected')
  //   socket.emit('authenticate', { token: '123' })
  // })

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  }
  )

export const SocketContext = createContext({ socket })
const SocketProvider = ({ children }) => { 
    return (
        <SocketContext.Provider value={{ socket }}>
          {children}
        </SocketContext.Provider>
    )
    }

export default SocketProvider;
