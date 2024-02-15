import LoginPage from "./pages/LoginPage";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

// pages
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile/Profile";
import Notifications from "./pages/Notifications";
import Bookmarks from "./pages/Bookmarks";
import Connect from "./pages/Connect";
import Trends from "./pages/Trends";
import UserFollow from "./pages/Profile/UserFollow";

// settings
import AccountSettings from "./pages/Settings/AccountSettings";
import SecuritySettings from "./pages/Settings/SecuritySettings";
import MessageLayout from "./components/layouts/MessageLayout";
import PrivacySettings from "./pages/Settings/PrivacySettings";
import NotificationSettings from "./pages/Settings/NotificationSettings";
import AccessibilitySettings from "./pages/Settings/AccessibilitySettings";
import MonetizationSettings from "./pages/Settings/MonetizationSettings";
import CreatorSettings from "./pages/Settings/CreatorSettings";

// layouts
import TestLayout from "./components/layouts/TestLayout";
import SettingsLayout from "./components/layouts/SettingsLayout";

// notfounf
import NotFound from "./pages/NotFound/NotFoundSearch";

import MessageWindow from "./components/MessageWindow";
import MessageInfo from "./components/MessageInfo";
import { HomeRoutes } from "./components/home/HomeRoutes";
// modals as fn
import {
  ProfileModalRoutes,
  ProfileEditRoutes,
} from "./components/profile/ProfileRoutes";
import { UserProvider } from "./context/testUserContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// test

function App() {
  const location = useLocation();
  const background = location.state?.background;
  return (
    <>
      <Routes location={background || location}>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        {/* home/base */}
        {/* <Route element={<PrivateRoute />}> */}
        <Route
          element={
            <TestLayout
              includeRenderWidgets={["SearchBar", "WhoToFollow", "Trending"]}
            />
          }
        >
          <Route path="/home" element={<Feed />} />

          {/* settings modal route that defaults to feed if routing directly */}
          <Route path="/settings/profile" element={<Feed />}>
            {ProfileEditRoutes()}
          </Route>
          <Route path="/compose/tweet" element={<Feed />}>
            {HomeRoutes()}
          </Route>

          <Route path="notifications" element={<Notifications />} />
          <Route path="/bookmarks" element={<Bookmarks />} />

          {/* PROFILE */}
          <Route path=":username">
            <Route index element={<Profile />} />

            {["verified-followers", "followers", "following"].map((path) => (
              <Route key={path} path={path} element={<UserFollow />} />
            ))}
            {["replies", "highlights", "media", "likes"].map((path) => (
              <Route key={path} path={path} element={<Profile />} />
            ))}
          </Route>

          {/* modal Routes  */}
          {ProfileModalRoutes()}
        </Route>

        {/* exclude render widgets changed to include to be more explicit */}
        <Route element={<TestLayout includeRenderWidgets={["WhoToFollow"]} />}>
          <Route path="/explore">
            <Route index element={<Explore />} />
            {/* any search features */}
          </Route>
        </Route>

        {/* messages */}
        <Route element={<MessageLayout />}>
          <Route path="/messages" element={<MessageWindow />} />
          <Route path="/messages/:id" element={<MessageWindow />} />
          <Route path="/messages/:id/info" element={<MessageInfo />} />
        </Route>

        {/* TODO simplify */}
        <Route
          element={
            <TestLayout includeRenderWidgets={["SearchBar", "Trending"]} />
          }
        >
          <Route path="/i/connect-people" element={<Connect />} />
        </Route>

        {/* trends */}
        <Route
          element={
            <TestLayout includeRenderWidgets={["SearchBar", "WhoToFollow"]} />
          }
        >
          <Route path="/i/trends" element={<Trends />} />
        </Route>

        {/* settings */}
        <Route element={<SettingsLayout />}>
          <Route path="/settings">
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="accessibility" element={<AccessibilitySettings />} />
            <Route path="monetization" element={<MonetizationSettings />} />
            <Route path="creator" element={<CreatorSettings />} />
          </Route>
        </Route>

        {/* catch all after profile */}
        <Route element={<TestLayout excludeRightNav />}>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* </Route> */}
      </Routes>

      {background && (
        <UserProvider>
          <Routes>
            {/* <Route Route element={<PrivateRoute />}> */}
            {ProfileModalRoutes(background.pathname)}
            {ProfileEditRoutes(background.pathname)}
            {HomeRoutes(background.pathname)}
            {/* </Route> */}
          </Routes>
        </UserProvider>
      )}
    </>
  );
}

export default App;
