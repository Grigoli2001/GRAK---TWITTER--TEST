import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import store from "./store/store";
import { UserProvider } from "./context/UserProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SocketProvider from "./context/socketContext";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <UserProvider>
          <SocketProvider>
            <GoogleOAuthProvider clientId="1092637215532-ktlj13jh7d5t1410n32pklpk6ubh9vo8.apps.googleusercontent.com">
              <QueryClientProvider client={queryClient}>
                {/* <ReactQueryDevtools initialIsOpen={true} /> */}
                <App />
              </QueryClientProvider>
            </GoogleOAuthProvider>
            {/* limit testing sockets */}
            <ToastContainer limit={1} />
          </SocketProvider>
        </UserProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
