import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
export const NavbarNotif = ({ page }) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between p-3">
        <h1 className="text-xl font-bold">Notifications</h1>
        <div
          onClick={() => navigate("/settings/notifications")}
          className="rounded-full hover:bg-gray-300 p-1 cursor-pointer"
        >
          <IoSettingsOutline className="text-xl" />
        </div>
      </div>
    </div>
  );
};
