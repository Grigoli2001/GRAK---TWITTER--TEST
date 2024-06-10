import { createContext,  useEffect, useRef, useState, useContext } from 'react'
import { MentionsInput, Mention } from "react-mentions";
import "../../styles/mentions.css";
//  components
import { PollCreate } from "./Poll";
import { Button } from "../Button";
import TextCounter from "./TextCounter";
import { ExtAvatar } from "../User";
import MiniDialog from "../MiniDialog";
import TweetMedia from "./TweetMedia";
import ReactLoading from "react-loading";

// axios
import instance from "../../constants/axios";
import { tweetRequests } from "../../constants/requests";

// icons
import { GrImage } from "react-icons/gr";
import { MdOutlineGifBox } from "react-icons/md";
import { CIPoll, CIAccountYouFollow } from "../customIcons";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarClock } from "react-icons/lu";
import { FaGlobeAfrica, FaGlobeAmericas } from "react-icons/fa";
import { FiAtSign } from "react-icons/fi";

import { SocketContext } from '../../context/socketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { createToast } from '../../hooks/createToast';

import useUserContext from '../../hooks/useUserContext';
import { useMutation } from '@tanstack/react-query';

import { v4 } from 'uuid';

import { TWEET_ACTIONS, Tweet } from './Tweet';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Form for creating a tweet
 */
// done

export const TweetContext = createContext(null);

const TweetCreate = ({type = 'Post', reference_id = null, quote, editTweet, editMode, setEditMode, dispatch}) => {
  const { user }= useUserContext()
  const tweetMaxLength = 300;
  const defaultTweetText = (type === 'Post' || type === "Quote") ? 'What is happening?!' : 'Post your reply';
  const { socket } = useContext(SocketContext)
  const location = useLocation();
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  // media refs
  const mediaRef = useRef();
  const gifRef = useRef();

  // states for each button
  const [buttonStates, setButtonStates] = useState({
    media: false,
    gif: false,
    poll: false,
    schedule: true,
    location: true,
  });

  const [textAreaPlaceholder, setTextAreaPlaceholder] =
    useState(defaultTweetText);
  const [isInteracted, setIsInteracted] = useState(false); // show can reply dialog opener
  const [canReply, setCanReply] = useState("everyone");
  const [loading, setLoading] = useState(false);
  const [canInput, setCanInput] = useState(true);
  const [canPost, setCanPost] = useState(false); // post button state
    // form tweet text
    const [tweetForm, setTweetForm] = useState({
      tweetType: type === 'Post' ? 'tweet' : type === 'Quote' ? 'quote' : type === 'Reply' ? 'reply' : 'retweet',
      tweetText: editTweet?.tweetText ?? '',
      tweetMedia: null,
      tweetPoll: null,
      tweetSchedule: null,
      tweetLocation: null,
      tags: [],
      reference_id: reference_id ? reference_id : quote ?  quote?._id : null,
      tweetCanReply: canReply
    });

  const updateCanReply = (value) => {
    setCanReply(value);
    setTweetForm({
      ...tweetForm,
      tweetCanReply: value,
    });
  };

  // polls
  const [openPoll, setOpenPoll] = useState(false); // open poll options
  const createPoll = () => {
    setTextAreaPlaceholder("Ask a question");

    setOpenPoll(true);

    setButtonStates({
      ...buttonStates,
      poll: true,
      media: true,
      gif: true,
    });
  };

  const removePoll = () => {
    setTextAreaPlaceholder(defaultTweetText);

    setOpenPoll(false);

    setButtonStates({
      ...buttonStates,
      poll: false,
      media: false,
      gif: false,
    });

    setTweetForm({
      ...tweetForm,
      tweetPoll: null,
    });
  };

  const [formMedia, setFormMedia] = useState(null);

  const removeMedia = () => {
    if (mediaRef.current) mediaRef.current.value = null;
    if (gifRef.current) gifRef.current.value = null;


      setTweetForm({
        ...tweetForm,
        tweetMedia: null
      })
      setFormMedia(null)
      setButtonStates({
        ...buttonStates,
        media: false,
        gif: false,
        poll: false
      })
    }

  const resetComponent = () => {
    removeMedia();
    removePoll();

    setTextAreaPlaceholder(defaultTweetText);
    setButtonStates({
      media: false,
      gif: false,
      poll: false,
      schedule: true,
      location: true,
    });
    setTweetForm({
      ...tweetForm,
      tweetText: "",
        tags:[],
      tweetMedia: null,
      tweetPoll: null,
      tweetSchedule: null,
      tweetLocation: null,
      tweetCanReply: canReply,
    });
    setFormMedia(null);

      setCanInput(true);
      setCanPost(false);
      setLoading(false);
    }

    // const parseTags = (text) => {
    //     const tags = text.match(/#\w+/g);
    //     if (tags) {
    //       // get the starting index of the tag
    //       const tagwithIndices = tags.map(tag => ({
    //         tag: tag,
    //         start: text.indexOf(tag)
    //       }));
    //       return tagwithIndices;
    //     }
        
    //   }
  // update tweetText
  const handleUpdateTweetText = (e) => {
    if (!canInput) return;
    if (e.target.value.length > tweetMaxLength) {
      e.target.value = e.target.value.slice(0, tweetMaxLength);
      return
    } 
  // const parsedTags = parseTags(e.target.value);
  // console.log(parsedTags)
  
  // if (parsedTags) {
  //   console.log('parsedTags',parsedTags )
  //   setTweetForm({
  //     ...tweetForm,
  //     tags: parsedTags
  //   })
  //   console.log('tweetForm in parsetags', tweetForm)
    // let content = e.target.value;
    // parsedTags.forEach(tag => {
      // console.log(tag.tag)
      // let r = new RegExp(tag.tag, 'g');
      // content = content.replace(r, '<span style="font:bold;color:blue"}}>' + tag.tag + '</span>');
      // console.log(content)
      // console.log(content,e.target.parentElement.querySelector('p'))
      // e.target.parentElement.querySelector('.faux').innerHTML = content;
    // })
  // }
    setTweetForm(
      {
        ...tweetForm,
        tweetText: e.target.value
      }
    );
  }

  // const handleTweetImage = (image, mime) => {
  //   if (!image || !mime) return;
  //   setTweetForm({ ...tweetForm, tweetMedia: {src: URL.createObjectURL(image), mimeType: mime} });
  //   // const prevButtonStates = buttonStates
  //   // disableAllInteractions()
  //   setTimeout(() => {

  // //   const storageRef = ref(storage, `tweet_media/${image.name}/${v4()}`);
  // //   uploadBytesResumable(storageRef, image)
  // //     .then((snapshot) => {
  // //       console.log("Uploaded a blob or file!");
  // //       getDownloadURL(snapshot.ref)
  // //         .then((downloadURL) => {
  // //           // console.log("File available at", downloadURL);
  // //           setTweetForm({ ...tweetForm, tweetMedia: {src: downloadURL, mimeType: mime} });
  // //         })
  // //         .catch((error) => {
  // //           console.error("Error getting download URL", error);
  // //         });
  // //     })
  // //     .catch((error) => {
  // //       console.error("Error uploading file", error);
  // //     })
  // //     .finally(() => {
  //       // setButtonStates(prevButtonStates)
  //       // setCanInput(true)
  //       // setLoading(false)
  //     }, 1000)

  // //     )
  // };

  const handleMediaChange = async (evt) => {
    if (evt.target.files && evt.target.files[0]) {
      const file = evt.target.files[0];
      const mime = file.type;
      // simple mimetype check because file-type is giving issues even with browserify
      if (!mime.startsWith("image") && !mime.startsWith("video")) {
        createToast("Only Images and videos allowed", "warn", { limit: 1 });
        return;
      }

      removePoll();
      console.log(file, mime)
      // handleTweetImage(file, mime)
      setTweetForm({ ...tweetForm, tweetMedia: {src: URL.createObjectURL(file), mimeType: mime} });
      setFormMedia(file);
      setButtonStates({
        ...buttonStates,
        poll: true
      })

      // setTweetForm({...tweetForm, tweetMedia: file});
      // handleTweetImage(file);
    }
  }

  useEffect(() => {
  // if the form has text and and choices for poll
      // if the form has media only 
      // if the form has text only
    // more readable approach
    const { tweetText, tweetPoll, tweetMedia } = tweetForm;
    const isTextNotEmpty = tweetText?.trim().length > 0;
    const isPollValid = tweetPoll?.valid;
    const isMediaPresent = !!tweetMedia;
    const enablePostButton =
      (isTextNotEmpty && isPollValid) ||
      isMediaPresent ||
      (isTextNotEmpty && !tweetPoll);
    setCanPost(enablePostButton);
  }, [tweetForm]);

  const disableAllInteractions = () => {
    setLoading(true);
    setCanPost(false);
    setButtonStates({
      media: true,
      gif: true,
      poll: true,
      schedule: true,
      location: true,
    });
    setCanInput(false);
  }

  

  const queryClient = useQueryClient();
  
  const invalidateQueries = (data) => {
    if (data?.tweet?.tags?.length > 0) {
      console.log('invalidating tags', data?.tweet?.tags)
      queryClient.invalidateQueries({queryKey: ['trending']});
    }
    if (data?.tweet?.tweetMedia) {
      console.log('invalidating media')
      queryClient.invalidateQueries({queryKey: ['tweets', tweetRequests.myMedia, { userId: user.id }]})
    }
    if (data.tweet?.tweetType === 'reply' || data.tweetType === 'retweet'){
      console.log('invalidating replies')
      Promise.all([
      queryClient.invalidateQueries({queryKey: ['tweets', tweetRequests.replies, { userId: user.id }]}),        
      queryClient.invalidateQueries({queryKey: ['replies', data?.tweet?._id]})
      ])
    }
    }

  const createTweetMutation = useMutation({
    mutationFn: async ({ tweetForm }) =>{ 
      const sendForm = new FormData();
      for (const key in tweetForm) {
        if (key === 'tweetMedia' && formMedia)  {
          sendForm.append(key, formMedia)
        }else if (key === 'tags' && tweetForm[key].length > 0) {
          sendForm.append(key, JSON.stringify(tweetForm[key]))
        }
        else if (key === 'tweetPoll' && tweetForm[key]) {
          sendForm.append(key, JSON.stringify(tweetForm[key]))
        }else{
          if (tweetForm[key]) sendForm.append(key, tweetForm[key])
        }
      }
      for (var pair of sendForm.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }
      const response = await instance.post(tweetRequests.createTweets, sendForm, 
        { headers: { 'Content-Type': 'multipart/form-data' }})
      // const response = await instance.post(tweetRequests.createTweets, tweetForm) 
      return response.data
    },
    onMutate: (variables) => {
      const prebuttonStates = buttonStates;
      disableAllInteractions();
      return prebuttonStates
    },
    onSuccess: (data) => {
      // queryClient.setQueryData([tweetRequests.forYou, { userId: user.id }], (oldData) => {
      //   console.log('oldData', oldData)
      //   console.log('data', data)
      //   return [

      //   ]
        // return oldData.pages?.slice(0)?.unshift(data)
      // })
      queryClient.invalidateQueries([tweetRequests.forYou, { userId: user.id }]);

      if(location.pathname === '/home') queryClient.invalidateQueries({queryKey: [tweetRequests.forYou, { userId: user.id }]});
      if(location.pathname === `/${user.username}`) queryClient.invalidateQueries({queryKey: [tweetRequests.myTweets]})

      invalidateQueries(data)

        
      
      // resetComponent()
      createToast(`Nice ${type}🥳`, 'success', 'success-create-post', {limit: 1})
      socket.emit('feed:notify-create-post', { user })
      if ((location.pathname) === '/compose/tweet' || location.pathname === '/compose/post'){
        if (location.state?.background){
          return navigate(-1)
        }else{
         return  navigate(`/home`)
        }
      }
    },
    onError: (error, variables, context) => {
      console.log('create',error)
      createToast('An error occured while posting', 'error', 'error-create-post', {limit: 1});
      setButtonStates(context)
    },
    onSettled: (error, variables, context) => {
      resetComponent()
      setButtonStates(context)
      setCanInput(true)
    }
  })

  const handleCreateTweet = () => {
    if (!canPost) return
    // recheck tags
    
    createTweetMutation.mutate({tweetForm})
  }

  // only allow to change tweettext and tags due to time constraints
  const EditTweetMutation = useMutation({
    mutationFn: async ({ tweetText, tags, tweetId }) =>{
      const response = await instance.patch(tweetRequests.editTweet, {tweetText, tags, tweetId}) 
      return response.data
    },
    onError: (error) => {
      createToast('An error occured while editing', 'error', 'error-edit-post', {limit: 1});

    },
    onSuccess: (data) => {
      resetComponent()
      dispatch({type:TWEET_ACTIONS.EDIT, payload: data?.tweet})
      createToast(`Your post has been edited🥳`, 'success', 'success-edit-post', {limit: 1})
      invalidateQueries(data)
      setEditMode(false)
    }
  })

  const handleEditTweet = () => {
    if (!canPost) return
    const { tweetText, tags } = tweetForm;
    const tweetId = editTweet?._id;
    EditTweetMutation.mutate({
      tweetText,
      tags,
      tweetId
    })
  }


  const addTag = (tag) => {
    // make sure the tags is  in the tweetext and not in the tags array
    if (!tweetForm.tags.includes(tag)) {
      if (tweetForm.tags.length >= 5) {
        createToast('You can only add 5 tags', 'warn', {limit: 1});
        return
      }

      setTweetForm({
        ...tweetForm,
        tags: [...tweetForm.tags, tag]
      })
    }
  }



  //   disableAllInteractions(); 

//     try {
//       reduxDispatch(addToForYouAsync(tweetForm))
//       resetComponent()

//     }catch(err) {

//       console.log('create',err)
//         createToast('An error occured while posting', 'error', 'error-create-post', {limit: 1});
//       }
//       finally {
//         setCanInput(true)
//         setLoading(false);
//       }

    // }
    // instance
    //   .post(tweetRequests.createTweets, tweetForm)
    //   .then((response) => {
        // update redux 
        // console.log('create', response.data.tweet)
        // let categories = ['forYou', 'myTweets'];
        // queryClient.invalidateQueries(tweetRequests.getForYou);
        // if (response.data.tweet.tweetType === 'reply') categories.push('replies');
        // if (response.data.tweet.tweetMedia) categories.push('media');
        // dispatch(addToTweets({tweet: response.data.tweet, categories: categories}))
        
        // handleTweetImage(tweetForm.tweetMedia)
        // reduxDisptach(addToForYouAsync())

        // reset form
      //   resetComponent()
      //   createToast(`Nice ${type}🥳`, 'success', 'success-create-post', {limit: 1})

      //   // notify users
      //   socket.emit('feed:notify-create-post', { user })
      // if ((location.pathname) === '/compose/tweet' || location.pathname === '/compose/post'){
      //     if (location.state?.background){
      //       return navigate(-1)
      //     }else{
      //      return  navigate(`/home`)
      //     }
      //   }
      // })
//       .catch((error) => {
//         console.log('create',error)
//         createToast('An error occured while posting', 'error', 'error-create-post', {limit: 1});
//       }).finally(() => {
//         setCanInput(true)
//         setLoading(false);
//       })
  // }

    const searchTags = async (query, callback) => {
      if (query.length < 2) return [];
      try {
        const response = await instance.get(tweetRequests.searchTags, {params: {q: query }});
        const tags = response.data?.tags?.tags?.map((tag, index) => ({id: index, display: tag}));
        // return tags ?? [{id: 1, 'display': `${query}`}]; // add new hashtag
        callback(tags ?? [{id: 1, 'display': `${query}`}])
      }catch(err) {
        console.log(err)
      }
  //  return  [ {id: 1, display: 'tag1'}, {id: 2, display: 'tag2'}, {id: 3, display: 'tag3'}]
    }


    // const searchUsers = async (query) => {   
    //   if (query.length < 2) return [];
    //   const response = await instance.get(requests.getUsers, {params: {q: query }});
    //   const users = response.data?.users?.map((user, index) => ({id: index, display: user.username}));
    //   return users ?? [];
    // }


  const inputRef = useRef();
  return (
    <TweetContext.Provider value={{ tweetForm, setTweetForm }}>
      <section
        className="w-full relative h-fit p-4 pb-0 grid grid-cols-[75px_auto] border-b border-b-solid border-gray-200"
        onClick={() => (!loading ? setIsInteracted(true) : {})}
      >

    { (createTweetMutation.isLoading || loading) && 
      <div className="absolute top-0 left-0 w-full h-full bg-white/75 z-50 flex items-center justify-center">
            <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
      </div>

    }
    <div className="mr-4">
    <ExtAvatar src = {user?.profile_pic} size="sm" />
    </div>

    <div className="flex flex-col">
      {/* <TextareaAutosize
      ref={inputRef} 
      maxLength={tweetMaxLength}
      minRows={2}
      placeholder={textAreaPlaceholder}
      name="tweetText"
      value={tweetForm.tweetText}
      className="resize-none overflow-hidden w-full pt-0 pb-2 pr-3 ml-4 border-none outline-none break-words placeholder:text-slate-600 placeholder:text-xl"
      onChange={handleUpdateTweetText}
      /> */}


        <MentionsInput
            className="mentionWrapper text-wrap break-all max-h-20 overflow-auto no-scrollbar pt-0 pb-2 pr-3 ml-4"
            inputRef={inputRef}
            spellCheck="false"
            placeholder={textAreaPlaceholder}
            value={tweetForm.tweetText}
            onChange={handleUpdateTweetText}
          >
        
            <Mention
              trigger="#"
              data={searchTags}
              markup="$$____display__$$"
              className='text-twitter-blue underline'
              onAdd={(id, display) => {
                addTag(display)
              } }
              displayTransform={(id, display) => `#${display}`}
                // setTagNames((twe) => [...tagNames, display])
                // setTweetForm({
                //   ...tweetForm,
                //   tags: [...tweetForm.tags, display]
                // })
              
              appendSpaceOnAdd={true}
            />
          </MentionsInput>

     



    <div className="post-media ml-4">
        {
          openPoll ? 
            <PollCreate removePoll={removePoll}/>
            : tweetForm?.tweetMedia ?
             <TweetMedia mediaType={tweetForm.tweetMedia.mimeType} src={tweetForm.tweetMedia.src} as_form={true} removeMedia={removeMedia}/>
            : null
        }

    {
        quote &&
        <Tweet user={quote.user} post={quote} asQuote={true} />
      }
    </div>

   
      { 
            isInteracted && type !== "Reply" &&!editMode && (
            <MiniDialog>
              <MiniDialog.Wrapper className="flex items-center font-semibold text-twitter-blue ml-2 px-2 hover:bg-twitter-blue/10 cursor-pointer w-fit py-1 rounded-full relative">
                {canReply === "everyone" ? (
                  <>
                    <FaGlobeAfrica className="mr-2" />
                    <span className="text-sm"> Everyone can reply</span>
                  </>
                ) : canReply === "follow" ? (
                  <>
                    <CIAccountYouFollow className="mr-2" />
                    <span className="text-sm">
                      Accounts you follow can reply
                    </span>
                  </>
                ) : canReply === "mention" ? (
                  <>
                    <FiAtSign className="mr-2" />
                    <span className="text-sm">
                      {" "}
                      Only accounts you mention can reply
                    </span>
                  </>
                ) : null}
                <MiniDialog.Dialog className="absolute top-[100%] z-10 bg-white rounded-lg text-sm text-black min-w-[250px] shadow-all-round overflow-hidden">
                  <div className="p-2">
                    <h4 className="font-bold">Who can reply?</h4>
                    <p className="text-xs text-slate-400">
                      Choose who can reply to this post. Anyone mentioned can
                      always reply.
                    </p>
                  </div>
                  <ul className={`list-none`}>
                    <li
                      className="flex items-center hover:bg-slate-200 p-2 cursor-pointer font-semibold"
                      onClick={() => updateCanReply("everyone")}
                    >
                      <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                        <FaGlobeAmericas />
                      </div>
                      Everyone
                    </li>

                    <li
                      className="flex items-center hover:bg-slate-200  p-2 cursor-pointer"
                      onClick={() => updateCanReply("follow")}
                    >
                      <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                        <CIAccountYouFollow />
                      </div>
                      Accounts you follow
                    </li>

                    <li
                      className="flex items-center hover:bg-slate-200 p-2 cursor-pointer"
                      onClick={() => updateCanReply("mention")}
                    >
                      <div className="rounded-full p-2 bg-twitter-blue text-white mr-2">
                        <FiAtSign />
                      </div>
                      Only accounts you mention
                    </li>
                  </ul>
                </MiniDialog.Dialog>
              </MiniDialog.Wrapper>
            </MiniDialog>
          )}

          <div
            className={`flex mt-4 w-full gap-x-1 py-3 items-center justify-between ${
              isInteracted && "border-t border-solid border-slate-200"
            }`}
          >
          { !editMode && 
            <div className="flex items-center gap-x-4 text-twitter-blue">
              <Button
                variant="icon"
                size="icon-sm"
                disabled={buttonStates.media}
                className="pointer-events-auto"
              >
                <label htmlFor="post_media">
                  <GrImage title="Media" />
                  <input
                    id="post_media"
                    name="post_media"
                    onChange={handleMediaChange}
                    ref={mediaRef}
                    className="hidden"
                    type="file"
                    accept="image/x-png,image/png,image/gif,image/jpeg,image/jpg, video/*"
                  />
                </label>
              </Button>

              <Button variant="icon" size="icon-sm" disabled={buttonStates.gif}>
                <label htmlFor="post_gif">
                  <MdOutlineGifBox title="GIF" />
                </label>
                <input
                  id="post_gif"
                  name="post_gif"
                  onChange={handleMediaChange}
                  ref={gifRef}
                  className="hidden"
                  type="file"
                  accept="image/gif"
                />
              </Button>

              <Button
                onClick={createPoll}
                variant="icon"
                size="icon-sm"
                disabled={buttonStates.poll}
              >
                <CIPoll />
              </Button>

              <Button
                variant="icon"
                size="icon-sm"
                disabled={buttonStates.schedule}
              >
                <LuCalendarClock />
              </Button>

              <Button
                variant="icon"
                size="icon-sm"
                disabled={buttonStates.location}
              >
                <IoLocationOutline />
              </Button>
            </div>
          }

            <div className="flex gap-x-4 items-center ml-auto">
              <TextCounter
                textCount={tweetForm.tweetText?.length}
                maxLength={tweetMaxLength}
              />

              
              {
              editMode ?

                  <>
                    <Button onClick={() => setEditMode(false)} variant="filled" color="gray" className='text-black rounded-full'>Cancel</Button>
                    <Button onClick={handleEditTweet} variant="outline" className='rounded-full bg-twitter-blue'>Edit</Button>
                  </>
              
                  :
                  <Button onClick={handleCreateTweet} disabled={!canPost}>{type}</Button>

              }


            </div>
          </div>
        </div>
      </section>
    </TweetContext.Provider>
  );
};

export default TweetCreate;
