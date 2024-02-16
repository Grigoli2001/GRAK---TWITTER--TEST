import React from "react";
import RightNav from "../RightNav";
import { Outlet } from "react-router-dom";

const MainLayout = (props) => {
  return (
    <>
      <main className={!props.excludeRightNav ? "max-w-[650px]" : "w-full"}>
        <Outlet />
      </main>

      {!props.excludeRightNav && <RightNav {...props} />}
    </>
  );
};

export default MainLayout;
