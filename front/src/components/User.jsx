import {
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
  useCallback,
  useRef,
  forwardRef,
  Fragment,
} from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@material-tailwind/react";
import { MdVerified } from "react-icons/md";
import { showUsername, defaultAvatar } from "../utils/utils";
import { NavLink } from "react-router-dom";
import { FollowButton } from "./FollowButton";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import { users } from "../constants/feedTest";
import { cn } from "../utils/style";
import useUserContext from "../hooks/useUserContext";
import useInstance from "../hooks/useInstance";
import instance from "../constants/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReactLoading from "react-loading";


/**
 * Custom Avatar component which takes variant and size props
 * Extends material-tailwind Avatar component
 */
export const ExtAvatar = ({ src, ...props }) => {
  if (src && !src.startsWith("http")) {
    src = null;
  }
  return (
    <Avatar
      src={src ? `${src}` : defaultAvatar}
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

export const UserBlock =  forwardRef(({
  user,
  children,
  withNavTo,
  avatarSize = "md",
  textSize = "sm",
  withCard,
}, ref) => {
  // TODO: add as variant ?
  const [test, setTest] = useState(textSizes[textSize] ?? textSizes.md);
  const [prevTest, setPrevTest] = useState("text-xs");
  // const finalTextSize = textSizes[textSize] ?? textSizes.md
  // console.log(user, "user in user block");
  // console.log('profile_pic', user.profile_pic)

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

        <div
          ref={ref}
         className="min-w-0 max-w-full">
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
}
)

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
                <b>{user.follower_count}</b> Followers
              </p>
              <p className="">
                <b>{user.following_count}</b> Following
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
  params,
  withCard,
  withNavTo,
  withFollow,
  FallbackComponent,
  isInfinite=true
}) => {
  const { user } = useUserContext();
  // const [userBlocks, setUserBlocks] = useState([]);

  const defaultParams = {
    // page: 0,
    limit: 10,
    ...params
  };

  const containerRef = useRef(null);

  const { error, data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading} = useInfiniteQuery({
    queryKey: ['users',api, defaultParams],
    enables: !!api,
    getNextPageParam: (lastPage, allPages) => {   
      if (lastPage.users.length < defaultParams.limit) {
        return undefined
      }
      return lastPage.prevPage + 1  
    },
    initialPageParam: 0,
    queryFn: async ({ queryKey, pageParam }) => {
      const res = await  instance.get(queryKey[1], { params: { page: pageParam, limit: queryKey[2]?.limit, q: queryKey[2]?.query  } })
      return {...res.data, prevPage: pageParam}
    }
  })


  // useEffect(() => {
  //   // use api to fetch certain users
  //   let w = users.filter((otherUser) => otherUser.id !== user.id);
  //   if (limit) {
  //     w = w.slice(0, limit);
  //   }
  //   setUserBlocks(w);
  // }, []);

  
  const observer = useRef()
  const lastUser = useCallback(userblock => {

    if (isLoading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage){
          fetchNextPage()
        }
    }, 
    {
        root: containerRef.current,
        threshold:0.8,
    }
    )
    if (userblock) observer.current.observe(userblock)
}, [isLoading, hasNextPage, fetchNextPage])

if (isLoading) {  
  return (
    <div className="flex justify-center items-center flex-col">
      <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
    </div>
  );
}

const users = data?.pages?.reduce((acc, page) => {
  return [...acc, ...page.users]
}, [])

if (users && users.length === 0  || error) {
  return FallbackComponent
}

return (
  <div className='flex flex-col gap-y-4 pb-4 relative'>
      <>
        {users &&  users.map((blockUser, index, arr) => (
          <UserBlock
            key={blockUser.id}
            user={blockUser}
            avatarSize="sm"
            textSize="lg"
            withNavTo={withNavTo}
            withCard={withCard}
            {...(index === arr.length - 1 && isInfinite && { ref: lastUser })}
          >
            {withFollow && blockUser.id !== user.id && (
              <div className="ml-auto">
                <FollowButton
                  followerid={blockUser.id}
                  userid={user.id}
                  followed={blockUser.is_followed}
                  size="sm"
                />
              </div>
            )}
          </UserBlock>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center">
            <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
          </div>
        )}
      </>
  </div>
);
    }  
