import React, { useEffect } from "react";
import { useState } from "react";
import { Tab } from "../components/Tabs";
import { Tabs } from "@mui/base/Tabs";
import { TabsList } from "@mui/base/TabsList";
import { TabPanel } from "@mui/base/TabPanel";
import { NavLink, useLocation } from "react-router-dom";
import { NavbarNotif } from "../components/notificationsComponents/NavbarNotif";
import { NotificationComp } from "../components/notificationsComponents/NotificationComp";
const Notifications = () => {
  const location = useLocation();

  return (
    <div>
      <NavbarNotif />
      <Tabs value={location.pathname} className="">
        <TabsList className="flex justify-around  items-center  bg-white/50 w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md">
          <Tab
            text="All"
            slots={{ root: NavLink }}
            to={`/notifications`}
            value={`/notifications`}
          />
          <Tab
            text="Verified"
            slots={{ root: NavLink }}
            to={`/notifications/verified`}
            value={`/notifications/verified`}
          />
          <Tab
            text="Mentions"
            slots={{ root: NavLink }}
            to={`/notifications/mentions`}
            value={`/notifications/mentions`}
          />
        </TabsList>

        <section>
          <TabPanel value={`/notifications`}>
            <NotificationComp NotificationType={"all"} />
          </TabPanel>

          <TabPanel value={`/notifications/verified`}>
            <NotificationComp NotificationType={"verified"} />
          </TabPanel>

          <TabPanel value={`/notifications/mentions`}>
            <NotificationComp NotificationType={"mentions"} />
          </TabPanel>
        </section>
      </Tabs>
    </div>
  );
};

export default Notifications;
