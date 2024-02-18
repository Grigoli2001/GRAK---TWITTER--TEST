// import { Buffer } from 'buffer';

// import { useEffect, useState, useContext, createRef } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// // import TweetMedia, { TweetMiniMedia } from "./TweetMedia";
// import { ExtAvatar, UserCard } from "../User";
// import { Button } from "../Button";
// import {
//     Popover,
//     PopoverContent,
//     PopoverHandler,
// } from "@material-tailwind/react";
// import MiniDialog from "../MiniDialog";

// // axios
// import instance from '../../constants/axios';
// import { requests } from '../../constants/requests';

// // icons
// import { GoHeart, GoHeartFill, GoUpload } from "react-icons/go";
// import {
//     FaRegComment,
//     FaRetweet,
//     FaRegBookmark,
//     FaBookmark,
//     FaEllipsis,
// } from "react-icons/fa6";
// import { MdVerified } from "react-icons/md";
// import { CIQuote } from "../customIcons";
// import { RiDeleteBinLine } from "react-icons/ri";
// import ReactLoading from "react-loading";


// // utils
// import { showUsername, timeAgo, quantityFormat, TweetTime } from "../../utils/utils";
// import { cn } from "../../utils/style";
// import { BaseTweet } from './Tweet';
// import useUserContext from '../../hooks/useUserContext';



// const TweetAction = ({
//     Icon,
//     ActiveIcon,
//     actionCount,
//     title,
//     color,
//     onClick,
//     isActive,
//     tooltip,
// }) => {
//     if (!ActiveIcon) ActiveIcon = Icon;
//     // avoid tailwind purging
//     const styles = {
//         red: {
//             text: `group-hover:text-red-500 ${isActive ? "text-red-500" : ""}`,
//             bg: `group-hover:bg-red-100 `,
//         },
//         blue: {
//             text: `group-hover:text-twitter-blue ${isActive ? "text-twitter-blue" : ""
//                 }`,
//             bg: "group-hover:bg-twitter-blue/10",
//         },
//         green: {
//             text: `group-hover:text-green-500  ${isActive ? "text-green-500" : ""}`,
//             bg: "group-hover:bg-green-100",
//         },
//     };

//     let style = styles[color] ?? styles.blue;

//     return (
//         <div
//             onClick={onClick}
//             className={`group flex items-center justify-center cursor-pointer`}
//         >
//             {/* For some reason Icon padding is removing icon */}
//             <Button
//                 variant="icon"
//                 size="icon-sm"
//                 tooltip={tooltip}
//                 className={`text-black ${style.bg} ${style.text} transition-colors duration-100`}
//             >
//                 {/* style has to applied directly on the button to ovverrife variant defaults */}
//                 {isActive ? <ActiveIcon /> : <Icon />}
//             </Button>

//             {/* use ternary to eval 0 */}
//             {actionCount ? (
//                 <span className={`text-sm -ml-[6px] ${style.text}`}>
//                     {quantityFormat(actionCount)}
//                 </span>
//             ) : null}

//             <title>{title}</title>
//         </div>
//     );
// };

// const BaseTweetView = ({tweetUser, postState, setPostState, isLast, complete }) => {
//     const { user } = useUserContext()
//     const childTweetRef = createRef();

//     // TODO fix 
//     useEffect(() => {
//         const tweets = document.querySelectorAll('.tweet-full')
//         const lastTweet = tweets[tweets.length - 1];
//         if(lastTweet){
//             console.log('scrolling')
//             lastTweet.scrollIntoView({ block: 'start', inline: 'start' })
//         } else{
//             console.log('no tweet')
//         }
//         }, [postState]);

//     const handleLike = (e) => {
//         e.stopPropagation();
//         // console.log("liked");
//         setPostState((prev) => ({
//             ...postState,
//             liked: !postState.liked,
//             likes: postState.liked ? postState.likes - 1 : postState.likes + 1,
//         }));

//         instance.post(requests.likeTweet, {
//             tweetId: postState._id,
//             userId: user.id
//         })
//             .then((res) => {
//                 console.log(res)
//             })
//             .catch((error) => {
//                 console.log(error)
//             })
//     }

//     const handleRetweet = () => {
//         console.log('retweeted')
//         setPostState({
//             ...postState,
//             retweeted: !postState.retweeted,
//             retweets: postState.retweeted
//                 ? postState.retweets - 1
//                 : postState.retweets + 1,
//         });

//         instance.post(requests.retweetTweet, {
//             tweetId: postState._id,
//             userId: user.id
//         })
//             .then((res) => {
//                 console.log(res)
//             })
//             .catch((error) => {
//                 console.log(error)
//             })
//     };

//     const handleReply = (e) => {
//         e.stopPropagation();
//     };

//     const handleBookmark = (e) => {
//         console.log("bookmarked");
//         e.stopPropagation();
//         setPostState({
//             ...postState,
//             bookmarked: !postState.bookmarked,
//         });
//         instance.post(requests.bookmarkTweet, {
//             tweetId: postState._id,
//             userId: user.id
//         })
//             .then((res) => {
//                 console.log(res)
//             })
//             .catch((error) => {
//                 console.log(error)
//             })
//     };

//     const handleShare = (e) => {
//         e.stopPropagation();
//         console.log("shared");
//     };

//     const navigate = useNavigate();

//     const isValidMediaType = (contentType) => {
//         if (contentType.startsWith('image/')) {
//             return 'image';
//         } else if (contentType.startsWith('video/')) {
//             return 'video';
//         } else {
//             return 'gif'; // Invalid media type
//         }
//     };

//     let base64String = '';
//     if (postState.tweetMedia) {
//         base64String = Buffer.from(postState?.tweetMedia?.data).toString('base64');
//     }

//     return (
//         // tweets for feed page, post is diff for single post view
//         <div ref={childTweetRef}>
//         <div
//             onClick={() => navigate(`/${tweetUser.username}/status/${postState._id}`)}
//             className={cn(
//                 "tweet tweet-full w-full h-fit p-4 pb-0 grid hover:bg-gray-100 cursor-pointer",
//                 {
//                     "border-b border-b-solid border-gray-200": !isLast,
//                 }
//             )}
//         >


//             <div className="flex flex-col m-1 gap-3 w-full">
//                 <div
//                     onClick={(e) => {
//                         e.stopPropagation();
//                     }}
//                     className="flex items-center gap-x-2 text-slate-400 relative"
//                 >
//                     <UserCard user={tweetUser}>

//                         <NavLink
//                             to={`/${tweetUser.username}`}
//                             className="flex items-center w-fit gap-x-1 text-black !outline-none"
//                             href="/"
//                         >
//                             <>

//                                 <div
//                                     className={cn(
//                                         "flex items-center   font-bold hover:underline text-ellipsis text-nowrap max-w-[300px] overflow-hidden",
//                                         {
//                                             // "underline": showUserCard
//                                         }
//                                     )}
//                                 >
//                                     <NavLink
//                                         onClick={(e) => e.stopPropagation()}
//                                         to={`/${tweetUser.username}`}
//                                         className="mr-3 mt-1 self-start"
//                                     >
//                                         <ExtAvatar src={tweetUser?.profile_pic} size="sm" />
//                                     </NavLink>
//                                     <div>
//                                         <div className='flex items-center gap-x-2  font-bold hover:underline text-ellipsis text-nowrap max-w-[300px] overflow-hidden'>
//                                             <p>{tweetUser.name}</p>
//                                             {!tweetUser.verified && (
//                                                 <MdVerified className="text-twitter-blue" />
//                                             )}
//                                         </div>
//                                         <p className="text-slate-400 text-sm">
//                                             {showUsername(tweetUser)}
//                                         </p>
//                                     </div>

//                                 </div>
//                             </>

//                         </NavLink>
//                     </UserCard>



//                     {user.id === tweetUser.id && (
//                         <Popover placement="top-end" offset={{ mainAxis: -20 }}>
//                             <PopoverHandler>
//                                 <Button
//                                     variant="icon"
//                                     size="icon-sm"
//                                     className="text-slate-400 text-xs ml-auto"
//                                 >
//                                     <FaEllipsis />
//                                 </Button>
//                             </PopoverHandler>
//                             <PopoverContent className="!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10 overflow-hidden">
//                                 <ul className="list-none text-sm">
//                                     <span className="text-red-500 flex items-center gap-x-2 p-2 hover:bg-gray-100 cursor-pointer">
//                                         <RiDeleteBinLine /> Delete{" "}
//                                     </span>
//                                 </ul>
//                             </PopoverContent>
//                         </Popover>
//                     )}
//                 </div>

//                 <div className="text-justify break-words">
//                     {postState?.tweetText}
//                 </div>

//                 {
//                     postState?.tweetMedia &&
//                     <TweetMedia mediaType={isValidMediaType(postState?.tweetMedia?.contentType)} src={`data:${postState?.tweetMedia?.contentType};base64,${base64String}`} alt="" />
//                 }
//                     <div className="flex items-center justify-between p-1 text-slate-500 text-md">
//                         {TweetTime(postState?.createdAt)}
//                         {postState?.updatedAt && (
//                             <span className="text-sm font-medium italic">edited</span>
//                         )}

//                     </div>

//                 <div className="flex items-center justify-between p-4">
//                     <TweetAction Icon={FaRegComment} actionCount={postState?.tweet_comments} title="Reply" color="blue" onClick={handleReply} />

//                     <MiniDialog>
//                         <MiniDialog.Wrapper>
//                             <MiniDialog.Dialog className='absolute -left-2 right-0 w-fit bg-white rounded-xl shadow-all-round font-bold !outline-none z-10'>
//                                 <ul className='list-none text-sm'>
//                                     <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap' onClick={handleRetweet}><FaRetweet /> {postState.retweeted ? 'Undo Repost' : 'Repost'} </li>
//                                     <li className='hover:bg-slate-200/50 p-3 cursor-pointer flex items-center gap-2 whitespace-nowrap'><CIQuote /> Quote</li>
//                                 </ul>
//                             </MiniDialog.Dialog>
//                             <TweetAction Icon={FaRetweet} actionCount={postState?.retweets} title="Retweet" color="green" isActive={postState.retweeted} />
//                         </MiniDialog.Wrapper>
//                     </MiniDialog>


//                     <TweetAction
//                         Icon={GoHeart}
//                         ActiveIcon={GoHeartFill}
//                         actionCount={postState.likes}
//                         title="Like"
//                         color="red"
//                         onClick={handleLike}
//                         isActive={postState.liked}
//                     />

//                     <div className="flex">
//                         <TweetAction
//                             Icon={FaRegBookmark}
//                             ActiveIcon={FaBookmark}
//                             title="Save"
//                             onClick={handleBookmark}
//                             isActive={postState.bookmarked}
//                         />
//                         <TweetAction Icon={GoUpload} title="Share" onClick={handleShare} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//         </div>
//     );
// };

// // todo change naming to currentUser to avoid confusion
// const FullTweet = ({ tweetId, isLast, asMedia, complete, parent }) => {
//     const [tweetPost, setTweetPost] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         instance.get(requests.getTweetById + tweetId).then(res => {
//             setTweetPost(res.data.data.tweet)
//             setLoading(false)
//         }).catch(err => {
//           console.log(err)
//         })

        
//     }, [tweetId])
    


//       if(tweetPost.user === undefined) {
//             return null
//         }

//     return loading ? (
//         <div className='flex justify-center items-start h-[80vh] mt-4'>
//           <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
//         </div>
//       ) : asMedia ? (
//         tweetPost?.user && <TweetMiniMedia user={tweetPost.user} postState={tweetPost} setPostState={setTweetPost} complete={complete} />
//     ) : (
//         tweetPost?.user && 
//         <>
//         {tweetPost.reference_id ? <FullTweet tweetId={tweetPost.reference_id} parent={true} /> : null }
//         {parent ? 
//         <BaseTweet tweetUser={tweetPost.user} post={tweetPost} reply={true}/>
//         :
//         <BaseTweetView  tweetUser={tweetPost.user} postState={tweetPost} setPostState={setTweetPost} isLast={isLast} complete={complete} />
// }
//         </>
//     );
// };

// export default FullTweet;
