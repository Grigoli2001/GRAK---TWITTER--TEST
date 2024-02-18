import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserContext from "../hooks/useUserContext";

const PrivateRoute = () => {
  const { isAuthenticated, user } = useUserContext();

  return isAuthenticated && user ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
