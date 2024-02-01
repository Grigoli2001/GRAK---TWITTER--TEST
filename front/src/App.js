import LoginPage from "./pages/LoginPage";
import { Route, Routes } from "react-router-dom";

import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound/NotFoundSearch";
import TestLayout from "./components/layouts/TestLayout";
import MessageLayout from "./components/layouts/MessageLayout";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// test

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/messages" element={<Messages />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
)}

export default App;
