import {
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  useRef,
  Fragment,
} from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@material-tailwind/react";
import { MdVerified } from "react-icons/md";
import { showUsername, defaultAvatar } from "../utils/utils";
import { NavLink } from "react-router-dom";
import { FollowButton } from "./FollowButton";
import { UserContext } from "../context/UserContext";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import { users } from "../constants/feedTest";
import { cn } from "../utils/style";

/**
 * Custom Avatar component which takes variant and size props
 * Extends material-tailwind Avatar component
 */
export const ExtAvatar = ({ src, ...props }) => {
  return (
    <Avatar
      src={src ? `/uploads/${src}` : defaultAvatar}
      {...props}
      className={`hover:brightness-90 transition-opacity ${
        props.className ?? ""
      }`}
    />
  );
};

const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const UserBlock = ({
  user,
  children,
  withNavTo,
  avatarSize = "md",
  textSize = "sm",
  withCard,
}) => {
  // TODO: add as variant ?
  const [test, setTest] = useState(textSizes[textSize] ?? textSizes.md);
  const [prevTest, setPrevTest] = useState("text-xs");
  // const finalTextSize = textSizes[textSize] ?? textSizes.md

  useLayoutEffect(() => {
    let keys = Object.keys(textSizes);
    const index = keys.findIndex((size) => size === textSize);
    setPrevTest(textSizes[keys[index - 1]] ?? "text-xs");
  }, [textSize]);

  const BaseBlock = withNavTo ? NavLink : "div";
  const navProps = withNavTo ? { to: `${withNavTo}${user.username}` } : {};
  const CardBlock = withCard ? UserCard : Fragment;

  return (
    // sol'n for now to allow long names with overflow as ellipsis
    <CardBlock {...(withCard && { user: user })}>
      <BaseBlock
        {...navProps}
        className={cn(
          "flex items-center gap-x-2 hover:bg-slate-200/50 cursor-pointer transition-colors duration-200 line-clamp-1 p-2",
          {
            "p-1": test === "xs" || test === "sm",
          }
        )}
      >
        <ExtAvatar src={user.profile_pic} size={avatarSize} />

        <div className="min-w-0 max-w-full">
          <span className="flex items-center">
            <p className={`font-bold flex-shrink-1 truncate ${test}`}>
              {user.name}
            </p>
            {user.verified && (
              <MdVerified className="min-w-4 text-twitter-blue" />
            )}
          </span>
          <p className={`text-slate-400 ${prevTest}`}>{showUsername(user)}</p>
        </div>

        {children}
      </BaseBlock>
    </CardBlock>
  );
};

export const UserCard = ({ user, children }) => {
  const navigate = useNavigate();
  const [showUserCard, setShowUserCard] = useState(false);

  // user card handlers
  const ucTimeout = useRef(null);
  const handleShowUserCard = () => {
    clearTimeout(ucTimeout.current);
    ucTimeout.current = setTimeout(() => {
      setShowUserCard(true);
    }, 700);
  };

  const handleHideUserCard = () => {
    clearTimeout(ucTimeout.current);
    ucTimeout.current = setTimeout(() => {
      setShowUserCard(false);
    }, 300);
  };
  const userCardTriggers = {
    onMouseEnter: handleShowUserCard,
    onMouseLeave: handleHideUserCard,
  };
  return (
    <Popover
      open={showUserCard}
      placement="bottom-start"
      handler={setShowUserCard}
    >
      <PopoverHandler {...userCardTriggers}>{children}</PopoverHandler>
      <PopoverContent
        {...userCardTriggers}
        className="!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden"
      >
        <div
          onClick={() => navigate(`/${user.username}`)}
          className=" font-normal text-black bg-white shadow-all-round p-3 rounded-lg z-10 cursor-pointer"
        >
          <div className="flex flex-col items-start">
            <ExtAvatar src={user.profile_pic} size="md" />
            <h2 className="font-bold">{user.name}</h2>
            <p className="text-xs text-slate-400">{showUsername(user)}</p>
            <p className="">{user.bio}</p>
            <div className="flex items-center gap-2">
              <p className="">
                <b>10</b> Followers
              </p>
              <p className="">
                <b>10</b> Following
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const UserDisplayer = ({
  api,
  limit,
  withCard,
  withNavTo,
  withFollow,
  FallbackComponent,
}) => {
  const { user } = useContext(UserContext);
  const [userBlocks, setUserBlocks] = useState([]);

  useEffect(() => {
    // use api to fetch certain users
    let w = users.filter((otherUser) => otherUser.id !== user.id);
    if (limit) {
      w = w.slice(0, limit);
    }
    setUserBlocks(w);
  }, []);

  return (
    <div className="flex flex-col gap-y-4 pb-4">
      {userBlocks.length
        ? userBlocks.map((blockUser) => {
            return (
              <UserBlock
                key={blockUser.id}
                user={blockUser}
                avatarSize="sm"
                textSize="lg"
                withNavTo={withNavTo}
                withCard={withCard}
              >
                {withFollow && (
                  <div className="ml-auto">
                    <FollowButton followerid={blockUser.id} userid={user.id} followed={false} size="sm" />
                  </div>
                )}
              </UserBlock>
            );
          })
        : FallbackComponent ?? <div>Nothing to show here</div>}
    </div>
  );
};


