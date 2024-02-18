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
import AccountInfo from "./pages/Settings/AccountInfo";
import AccountChangePassword from "./pages/Settings/AccountChangePassword";
import ArchiveInfo from "./pages/Settings/ArchiveInfo";
import SecurityInfo from "./pages/Settings/SecurityInfo";
import DeactivateAccount from "./pages/Settings/DeactivateAccount";
import TwoFactorAuth from "./pages/Settings/TwoFactorAuth";
import ConnectedAccounts from "./pages/Settings/ConnectedAccounts";
import DelegateInfo from "./pages/Settings/DelegateInfo";
import FilterInformation from "./pages/Settings/FilterInformation";
import Preferences from "./pages/Settings/Preferences";

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
import { UserProvider } from "./context/UserContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

import SocketProvider from "./context/socketContext";
import ViewTweet from "./pages/ViewTweet";

import ForgotPassword from "./components/authComponents/ForgotPassword";
import AfterRegistrationPopup from "./components/authComponents/AfterRegistrationPopup";
import ParentLayout from "./components/layouts/ParentLayout";
function App() {
  const location = useLocation();
  const background = location.state?.background;
  const justRegistered = localStorage.getItem("justRegistered");
  return (
      <SocketProvider>
        <UserProvider>
        <Routes location={ background || location } >

            <Route element={<PublicRoute />}>
              <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            </Route>


            {/* <Route element={<PrivateRoute />}> */}

                {justRegistered && (
                <Route
                  path="after-registration"
                  element={<AfterRegistrationPopup />}
                />
              )}
              <Route element={<ParentLayout />}>
                <Route element={<MainLayout includeRenderWidgets={['SearchBar', 'WhoToFollow', 'Trending']}/>}>
                    <Route path="/home" element={<Feed />} />
                    
                    {/* settings modal route that defaults to feed if routing directly */}
                    <Route path="/settings/profile" element={<Feed />}>
                      { ProfileEditRoutes()}
                    </Route>

                    <Route path="/compose/tweet" element={<Feed />}>
                      { HomeRoutes() }
                    </Route>

                  
                    {/* NOTIFICATIONS */}
                    <Route path="notifications" element={<Notifications />} />

                    {/* PROFILE */}
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    
                    {/* PROFILE */}
                    <Route path=":username">
                      <Route index element={<Profile />} />

                      {/* View Tweets */}
                      <Route path="status/:tweetId" element={<ViewTweet />} />
                    
                      {['verified-followers', 'followers', 'following'].map((path)=> 
                          <Route key={path} path={path} element={<UserFollow />}  />
                      )}
                      {['replies', 'highlights', 'media', 'likes'].map((path)=> 
                          <Route key={path} path={path} element={<Profile />}  />
                      )}

                      <Route path="status/:tweetId" element={<ViewTweet />} />
                    </Route>

                    {/* modal Routes  */}
                    { ProfileModalRoutes() }

                </Route>

                {/* exclude render widgets changed to include to be more explicit */}
                <Route element={<MainLayout includeRenderWidgets={['WhoToFollow']}/>}>
                    <Route path="/explore" >
                          <Route index element={<Explore />} />
                      </Route>
                </Route>

              {/* messages */}
              <Route element={<MessageLayout />}>
                <Route path="/messages">
                    <Route index element={<DefaultMessageWindow />} />
                    <Route path=":username" element={<MessageWindow/>} />
                    <Route path=":username/info" element={<MessageInfo />} />
                </Route>
                <Route path="/messages" element={<DefaultMessageWindow/>} >
                    { MessageModalRoutes() }
                </Route>
              </Route>

                {/* TODO simplify */}
                <Route element={<MainLayout includeRenderWidgets={['SearchBar', 'Trending']}/>}>
                  <Route path="/i/connect-people" element={<Connect />} />
                </Route>

                {/* trends */}
                <Route element={<MainLayout includeRenderWidgets={['SearchBar', 'WhoToFollow']}/>}>
                  <Route path="/i/trends" element={<Trends />} />
                </Route>

                {/* settings */}
              <Route element={<SettingsLayout/>}>
                  <Route path="/settings" >
                    <Route index element={<Navigate to="account" replace />} />
                    <Route path="account" element={<AccountSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    <Route path="privacy" element={<PrivacySettings />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="accessibility" element={<AccessibilitySettings />} />
                    <Route path="monetization" element={<MonetizationSettings />} />
                    <Route path="creator" element={<CreatorSettings />} />
                    <Route path="account/info" element={<AccountInfo />} />
                    <Route path="account/change" element={<AccountChangePassword />} />
                    <Route path="account/archive" element={<ArchiveInfo />} />
                    <Route path="account/deactivate" element={<DeactivateAccount />} />
                    <Route path="security/security" element={<SecurityInfo />} />
                    <Route path="security/2fa" element={<TwoFactorAuth />} />
                    <Route path="security/connected" element={<ConnectedAccounts />} />
                    <Route path="security/delegate" element={<DelegateInfo />} />
                    <Route path="notifications/filters" element={<FilterInformation />} />
                    <Route path="notifications/preferences" element={<Preferences />} />
                  </Route>
              </Route>


              {/* catch all after profile */}
              <Route element={<MainLayout excludeRightNav />}>
                <Route path="/404" element={<NotFound/>}  />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          {/* </Route> */}
        </Routes>

        { 
          background && 
          
            <Routes>
              {/* <Route Route element={<PrivateRoute />}> */}
                    { ProfileModalRoutes(background.pathname) }
                    { ProfileEditRoutes(background.pathname)}
                    { HomeRoutes(background.pathname)}
                    { MessageModalRoutes(background.pathname) }
              {/* </Route> */}
            </Routes>
          
        }
        </UserProvider>
        </SocketProvider>   
  );
}

export default App;
