import React from "react";
import RightNav from "../RightNav";
import SideNav from "../../components/SideNav";
import { UserProvider } from "../../context/testUserContext";
import { Outlet } from "react-router-dom";

const TestLayout = (props) => {
  return (
    <UserProvider>
      <div className="flex h-full w-full max-w-[1300px] mx-auto">
        <SideNav />
        <main className="min-w-fit flex-[2]">
          <Outlet />
        </main>
        <RightNav {...props} />
      </div>
    </UserProvider>
  );
};

export default TestLayout;
