import LoginPage from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";

import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound/NotFoundSearch";
import AccountSettings from "./pages/Settings/AccountSettings";
import SecuritySettings from "./pages/Settings/SecuritySettings";
import MessageLayout from "./components/layouts/MessageLayout";
import PrivacySettings from "./pages/Settings/PrivacySettings";
import NotificationSettings from "./pages/Settings/NotificationSettings";
import AccessibilitySettings from "./pages/Settings/AccessibilitySettings";
import MonetizationSettings from "./pages/Settings/MonetizationSettings";
import CreatorSettings from "./pages/Settings/CreatorSettings";
import TestLayout from "./components/layouts/TestLayout";
import SettingsLayout from "./components/layouts/SettingsLayout";
import MessageWindow from "./components/MessageWindow";
import MessageInfo from "./components/MessageInfo";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// test

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LoginPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<TestLayout />}>
          <Route path="/home" element={<Feed />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path=":username" element={<Profile />}>
            {/* photo */}
            {/* cover */}
            {/* bio */}
            {/* followers */}
            {/* following */}
          </Route>
        </Route>

        <Route
          element={
            <TestLayout excludeRenderWidgets={["SearchBar", "Trending"]} />
          }
        >
          <Route path="/explore">
            <Route index element={<Explore />} />
            {/* any search features */}
          </Route>
        </Route>

        <Route element={<MessageLayout />}>
          <Route path="/messages" element={<MessageWindow />} />
          <Route path="/messages/:id" element={<MessageWindow />} />
          <Route path="/messages/:id/info" element={<MessageInfo />} />
        </Route>
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
