import LoginPage from "./pages/LoginPage";
import { Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Bookmarks from './pages/Bookmarks';
import NotFound from './pages/NotFound/NotFoundSearch';
import AccountSettings from "./pages/Settings/AccountSettings";
import SecuritySettings from "./pages/Settings/SecuritySettings";
import MessageLayout from "./components/layouts/MessageLayout";
import PrivacySettings from "./pages/Settings/PrivacySettings";
import NotificationSettings from "./pages/Settings/NotificationSettings";
import AccessibilitySettings from "./pages/Settings/AccessibilitySettings";
import MonetizationSettings from "./pages/Settings/MonetizationSettings";
import CreatorSettings from "./pages/Settings/CreatorSettings";
import TestLayout from './components/layouts/TestLayout';
import SettingsLayout from './components/layouts/SettingsLayout';

// test 

function App() {
  return (
          <Routes>
              <Route path="/" element={<LoginPage />} />

                <Route element={<TestLayout/>}>
                    <Route path="/home" element={<Feed />} />

                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path=":username" element={<Profile />}>
                      {/* photo */}
                      {/* cover */}
                      {/* bio */}
                      { /* followers */}
                      { /* following */}
                    </Route>
                </Route>

                <Route element={<TestLayout excludeRenderWidgets={['SearchBar', 'Trending']}/>}>
                    <Route path="/explore" >
                          <Route index element={<Explore />} />
                          {/* any search features */}
                        </Route>
                </Route>

      <Route element={<TestLayout />}>
        <Route path="/messages" element={<Messages />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
