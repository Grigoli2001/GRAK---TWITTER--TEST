import { Route, Routes, Navigate, useLocation } from "react-router-dom";

// pages
import LoginPage from "./pages/LoginPage";
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
import MainLayout from "./components/layouts/MainLayout";
import SettingsLayout from "./components/layouts/SettingsLayout";
import SideNav from "./components/SideNav";

// not found
import NotFound from "./pages/NotFound/NotFoundSearch";

// Messages
import {
  MessageWindow,
  DefaultMessageWindow,
} from "./components/messages/MessageWindow";
import MessageInfo from "./components/messages/MessageInfo";
import { HomeRoutes } from "./components/home/HomeRoutes";

// modals as fn
import { MessageModalRoutes } from "./components/messages/MessageModalRoutes";
import {
  ProfileModalRoutes,
  ProfileEditRoutes,
} from "./components/profile/ProfileRoutes";
import { UserProvider } from "./context/testUserContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

import SocketProvider from "./context/socketContext";
import ViewTweet from "./pages/ViewTweet";

import ForgotPassword from "./components/authComponents/ForgotPassword";
import AfterRegistrationPopup from "./components/authComponents/AfterRegistrationPopup";
function App() {
  const location = useLocation();
  const background = location.state?.background;
  const justRegistered = localStorage.getItem("justRegistered");
  return (
    <SocketProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
        </Route>
      </Routes>

      <UserProvider>
        <div className="main-container flex h-full w-full max-w-[1300px] mx-auto">
          <SideNav />

          <Routes location={background || location}>
            {/* <Route element={<PrivateRoute />}> */}
            <Route
              element={
                <MainLayout
                  includeRenderWidgets={[
                    "SearchBar",
                    "WhoToFollow",
                    "Trending",
                  ]}
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

              {/* NOTIFICATIONS */}
              <Route path="notifications" element={<Notifications />} />

              {/* PROFILE */}
              <Route path="/bookmarks" element={<Bookmarks />} />

              {/* PROFILE */}
              <Route path=":username">
                <Route index element={<Profile />} />

                <Route path="status/:tweetId" element={<ViewTweet />} />
                {["verified-followers", "followers", "following"].map(
                  (path) => (
                    <Route key={path} path={path} element={<UserFollow />} />
                  )
                )}
                {["replies", "highlights", "media", "likes"].map((path) => (
                  <Route key={path} path={path} element={<Profile />} />
                ))}
              </Route>

              {/* View Tweet */}

              {/* modal Routes  */}
              {ProfileModalRoutes()}
            </Route>

            {/* exclude render widgets changed to include to be more explicit */}
            <Route
              element={<MainLayout includeRenderWidgets={["WhoToFollow"]} />}
            >
              <Route path="/explore">
                <Route index element={<Explore />} />
              </Route>
            </Route>

            {/* messages */}
            <Route element={<MessageLayout />}>
              <Route path="/messages">
                <Route index element={<DefaultMessageWindow />} />
                <Route path=":username" element={<MessageWindow />} />
                <Route path=":username/info" element={<MessageInfo />} />
              </Route>
              <Route path="/messages" element={<DefaultMessageWindow />}>
                {MessageModalRoutes()}
              </Route>
            </Route>

            {/* TODO simplify */}
            <Route
              element={
                <MainLayout includeRenderWidgets={["SearchBar", "Trending"]} />
              }
            >
              <Route path="/i/connect-people" element={<Connect />} />
            </Route>

            {/* trends */}
            <Route
              element={
                <MainLayout
                  includeRenderWidgets={["SearchBar", "WhoToFollow"]}
                />
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
                <Route
                  path="notifications"
                  element={<NotificationSettings />}
                />
                <Route
                  path="accessibility"
                  element={<AccessibilitySettings />}
                />
                <Route path="monetization" element={<MonetizationSettings />} />
                <Route path="creator" element={<CreatorSettings />} />
              </Route>
            </Route>

            {/* catch all after profile */}
            <Route element={<MainLayout excludeRightNav />}>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* </Route> */}
          </Routes>

          {background && (
            <Routes>
              {/* <Route Route element={<PrivateRoute />}> */}
              {ProfileModalRoutes(background.pathname)}
              {ProfileEditRoutes(background.pathname)}
              {HomeRoutes(background.pathname)}
              {MessageModalRoutes(background.pathname)}
              {/* </Route> */}
            </Routes>
          )}
        </div>
      </UserProvider>
    </SocketProvider>
  );
}

export default App;
