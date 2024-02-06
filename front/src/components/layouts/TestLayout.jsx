import React from "react";
import RightNav from "../RightNav";
import SideNav from "../../components/SideNav";
import { UserProvider } from "../../context/testUserContext";
import { Outlet } from "react-router-dom";

const TestLayout = (props) => {
  return (
    <UserProvider>
      <div className="main-container flex h-full w-full max-w-[1300px] mx-auto">

        <SideNav />

        <main className={!props.excludeRightNav ? 'max-w-[650px]' : 'w-full'}>
          <Outlet />
        </main>

        {
          !props.excludeRightNav && 
            <RightNav {...props} />

        }
      </div>
    </UserProvider>
  );
};

export default TestLayout;
