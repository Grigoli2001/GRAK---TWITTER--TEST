import React, { useContext, useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useParams, useNavigate, NavLink, useLocation, Outlet } from 'react-router-dom'
import { showUsername, quantityFormat, getJoinDate } from '../../utils/utils'
import useUserContext from '../../hooks/useUserContext'
import { ExtAvatar } from '../../components/User'
import { Button } from '../../components/Button'
import { FollowButton } from '../../components/FollowButton'
import  { Tab } from '../../components/Tabs';
import { Tabs, TabsList, TabPanel } from '@mui/base';
import Tweets from '../../components/tweet/Tweets'
import ReactLoading from 'react-loading'
import { requests } from '../../constants/requests'

// icons
import { FaRegBell, FaBellSlash, FaRegCalendarAlt } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { FaArrowLeftLong, FaLink, FaRegEnvelope} from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { UserDisplayer } from '../../components/User'
import {  tweetRequests } from '../../constants/requests'
import { ValidUserContext } from '../../components/RequireValidUser'
import { createToast } from '../../hooks/createToast'
import { CgUnblock } from "react-icons/cg";

import instance from '../../constants/axios'

const MediaFallBack = ({user, isUser}) => { 
  return (


    <div className="col-span-full flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4">
      <h4   className='text-3xl font-bold'>{ isUser ? "Lights, camera … attachments!" : `${showUsername(user)} hasn't posted media`}</h4>
      <p className='text-slate-500 '>{ isUser ? "When you post photos or videos, they will show up here" : "Once they do, those posts will show up here."}</p>
  </div>
  )
}


const LikesFallBack = ({user, isUser}) => {
  return (

    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4">
      <h4   className='text-3xl font-bold'>{ isUser ? "You don't have any likes yet" : `${showUsername(user)} hasn't liked any posts`}</h4>
      <p className='text-slate-500 '>{ isUser ? "Tap the heart on any post to show it some love. When you do, it'll show up here" : "When they do, those posts will show up here"}</p>
    </div>
  
  )
  }

const HighlightsFallBack = ({isUser}) => {
  return (
    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4">
      <h4 className='text-3xl font-bold'>Highlights</h4>
      <p className='text-slate-500 '>{ isUser ? "Pin your favorite Tweets to your profile.": "Once they do, those posts will show up here."} </p>
    </div>
  )
}

const SetupProfileCheck = ({ img, text, predicate, onClick}) => {
  return (
    <div onClick={onClick} className='relative flex flex-col items-center gap-y-2 cursor-pointer hover:scale-105 transition-transform ease-in-out duration-200'>
      <div className='h-24 w-auto overflow-clip rounded-lg flex items-center justify-center'>
        <img src={img} alt="profile" className="w-full h-full z-1" />
      </div>
      <p className='text-sm font-bold'>{text}</p>
      {
        predicate && <span className='text-white bg-green-300 capitalize p-1 text-sm font-bold rounded absolute bottom-8 left-2 z-2'>Done</span> 
      }
    </div>
  )
}

// user here is detailed proofile
const OtherPostRepliesFallBack = ({user, isUser, isSetUp, type}) => {

  const navigate = useNavigate()
  return (  
    isUser ?

    <>

      {
        !isSetUp && (

          <div className='overflow-x-scroll no-scrollbar border-b border-solid border-b-gray-200 py-4'>
            <h3 className='font-bold text-xl  px-4 py-2'>Let's get you set up</h3>
            <div className='flex justify-evenly'>

              <SetupProfileCheck 
              text={"Complete Your Profile"}
              img="https://ton.twimg.com/onboarding/persistent_nux/profile_2x.png" 
              predicate={isSetUp}
              onClick={() => navigate('/settings/profile')}
               />

              <SetupProfileCheck
              text={"Follow 5 Accounts"}
              img="https://ton.twimg.com/onboarding/persistent_nux/follow_2x.png"
              predicate={user?.following_count >= 5}
              onClick={user?.following_count >= 5 ? () => {} :  () => navigate('/i/connect-people')}
              />
              
              <SetupProfileCheck
              text={"Turn on Notifications"}
              img="https://ton.twimg.com/onboarding/persistent_nux/notifs_2x.png"
              predicate={true}
              onClick={() => createToast('This feature is not yet available', 'info')}
              />

              
            </div>
          </div>

     ) }
      
      <h3 className='font-bold text-xl  px-4 py-2'>Who To Follow</h3>
      <UserDisplayer api={requests.exploreUsers} 
      params={{limit:3}} withCard withFollow withNavTo="/" isInfinite={false}
      FallbackComponent={<div className='px-4'>Look out for more users!</div>}/>

    </>
    :

    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4">
      <h4 className='text-3xl font-bold'>{type}</h4>
      <p className='text-slate-500 '>{showUsername(user)} hasn't made any posts here. </p>
    </div>
   
  )
}




const Profile = () => {

  const { username } = useParams()
  const { user } = useUserContext()
  const { activeUser: userProfile, isLoading } = useContext(ValidUserContext)
  const [isUser, setIsUser] = useState(false) 
  
   
  const [followerCount, setFollowerCount] = useState(null)

  const [ isSetUp, setIsSetUp ] = useState(false)
  const likeIsPublic = true 
  // const [ likeIsPublic, setLikesIsPublic ] = useState(true)
  // const [ hasLoaded, setHasLoaded ] = useState(false)

  const profileContainer = useRef(null)
  const noUserProfile = useRef(null)

  useLayoutEffect(() => {
      const profileRect = profileContainer?.current?.getBoundingClientRect()

      if (profileRect){
      profileContainer.current.style.bottom = `-${(profileRect.height)/2}px`

      if (noUserProfile.current) {
        noUserProfile.current.style.marginTop = `${profileRect.height/4}px`
      }}

  }, [userProfile, noUserProfile, user?.id])


  useEffect(() => {
  if(userProfile) {
        // setLikesIsPublic(userProfile.likes_is_public) // not implemented
        setIsUser(userProfile.id === user?.id)
        setFollowerCount(userProfile.followers_count)
        setIsSetUp(userProfile.location || (userProfile.profile_pic && userProfile.profile_pic !== 'default_profile_pic.png') || userProfile.bio || userProfile.website || userProfile.dob || userProfile.cover)
  }
  }, [userProfile, user?.id])

  const location = useLocation()
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1)
  }
  
  if (isLoading) return (
    <div className="w-full h-full flex items-center justify-center">
        <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
    </div>
  )

  const handleBlock = async () => {
    try {
      const res = await instance.post(requests.blockUser, { otherUserId: userProfile.id })

      console.log(res)
      if (res.status === 200) {
        
        createToast(`You have blocked @${userProfile.username}`, 'info')
        // navigate('/home')
      }else{
        throw new Error('Could not block user')
      }

    }catch (err) {
      if (err.response && err.response.status === 403) {
        createToast(`@${username} has already been blocked`, 'info');
      } else {
        createToast("We couldn't process this request at the moment", 'error');
      }
    }
  }

  const handleUnblock = async() => {
    try {
      const res = await instance.post(requests.unblockUser, { otherUserId: userProfile.id })

      console.log(res)
      if (res.status === 200) {
        
        createToast(`You have unblocked @${userProfile.username}`, 'info')
      }else{
        throw new Error('Could not unblock user')
      }

    }catch (err) {
      if (err.response && err.response.status === 403) {
        createToast(`@${username} has already been blocked`, 'info');
      } else {
        createToast("We couldn't process this request at the moment", 'error');
      }
    }
  }

  const handleTurnOnPostNotifications = async() => {

    try {
      const res = await instance.post(requests.setPostNotifications, { otherUserId: userProfile.id })

      console.log(res)
      if (res.status === 200) {
        
        createToast(`You have turned on post notifications for @${userProfile.username}`, 'info')
      }else{
        throw new Error('Could not unblock user')
      }
    }catch (err) {
      if (err.response && err.response.status === 403) {
        createToast(`@${username} has already been blocked`, 'info');
      } else {
        createToast("We couldn't process this request at the moment", 'error');
      }
    }
  }

  const handleTurnOffPostNotifications = async() => {

    try {
      const res = await instance.post(requests.removePostNotifications, { otherUserId: userProfile.id })

        console.log(res)
        if (res.status === 200) {
          
          createToast(`You have turned off post notifications for @${userProfile.username}`, 'info')
        }else{
          throw new Error('Could not unblock user')
        }
      }catch (err) {
        if (err.response && err.response.status === 403) {
          createToast(`@${username} has already been blocked`, 'info');
        } else {
          createToast("We couldn't process this request at the moment", 'error');
        }
      }
  }

  

 
  return (

    <>
   
        <div className="sticky z-50 top-0 backdrop-blur-md w-full bg-white/75">
          <div className="px-2 py-3">

          <div className='flex items-center gap-x-4'>
            <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
            <FaArrowLeftLong className='text-black'/>
            </Button>
            
              <div className='overflow-hidden'>

              {
              userProfile ? 

                    <>
                      <h3 className="font-bold text-lg text-ellipsis overflow-hidden text-nowrap">{ userProfile.name }</h3>

                      <p id="user_post_count" className="text-slate-500">
                        { quantityFormat(userProfile.post_count) } post{ userProfile.post_count !== 1 && 's'}
                      </p>

                      </>
                      :

                      <h3 className="font-bold text-lg">Profile</h3>
                }
              </div>
          </div>

        </div>
      </div>
      
        <div className="grid gap-y-2" >

          {/* user profile photo with cover  */}

          <div className="h-52 w-full profile-bg relative mb-6 bg-slate-300">

            {
              userProfile && 
                <div  className="h-full w-full absolute z-10">
                    {
                      userProfile.cover &&
                        <NavLink to={`/${userProfile.username}/cover`} state={{ background: location}}>
                          <img src={ userProfile.cover } className="w-full h-full object-cover" alt={`${userProfile.username}'s cover`} />
                        </NavLink>
                    }
                </div>
            }

                <div ref={profileContainer} className="absolute left-5  z-20 rounded-full bg-white p-1">

                  {
                    userProfile ? 
                      <NavLink to={`/${userProfile.username}/photo`} state={{ background: location }}>
                        <ExtAvatar src={userProfile.profile_pic} size="xxl" alt={`${userProfile.username}'s profile`} />
                      </NavLink>

                      :

                      <div className='h-32 w-32'></div>
                  }

                </div>
          </div>
        

        {
          userProfile ?

          <div className="grid">

            <div className="ml-auto mr-4 self-end">
            {
              isUser ?
                <NavLink to={`/settings/profile`} state={{ background : location }}>
                  <Button variant="outlined">
                    { isSetUp ? 'Edit Profile' : 'Set Up Profile'}
                  </Button>
                </NavLink>
              :    
              <span className='space-x-2'>

                  <Button onClick={handleUnblock} variant="icon" size="icon-sm" className="text-black hover:bg-gray-300/50 border" tooltip={`Unblock @${username}`} >
                    <CgUnblock />
                  </Button>

                  <Button onClick={handleBlock} variant="icon" size="icon-sm" className="text-red-500 hover:bg-gray-300/50 border" tooltip={`Block @${username}`}>
                    <MdBlock />
                  </Button>

                  

                  <Button onClick={handleTurnOnPostNotifications} variant="icon" size="icon-sm" className="text-black hover:bg-gray-300/50 border" tooltip="Turn on post notifications">
                    <FaRegBell />
                  </Button>

                  <Button onClick={handleTurnOffPostNotifications} variant="icon" size="icon-sm" className="text-black hover:bg-gray-300/50 border" tooltip="Turn on post notifications">
                    <FaBellSlash />
                  </Button>

                  <NavLink to={`/messages/${username}`}>
                      <Button variant="icon" size="icon-sm" className="text-black hover:bg-gray-300/50 border" tooltip={`Message @${username}`}>
                        <FaRegEnvelope />
                      </Button>
                    </NavLink>
                  <FollowButton followed={userProfile.is_followed} userid={user.id} followerid={userProfile.id} setFollowerCount={setFollowerCount} size='md' />
              </span>
            }
            </div>

            <div className="grid ml-4 gap-y-1">
              <h3 className="font-bold text-xl text-wrap">
                {userProfile.name}
              </h3>
              <p className="text-slate-500 text-sm">{ showUsername(userProfile) }</p>

              <div className='flex items-center flex-wrap gap-x-4'>

                  { userProfile.location &&
                    <span className="flex items-center justify-start gap-x-1 text-slate-500 text-sm">
                      <IoLocationOutline />
                      { userProfile.location }
                      </span>
                  }
                  {/* TODO: Make this a link */}
                  { userProfile.website &&
                    <span className="flex items-center justify-start gap-x-1 text-twitter-blue underline text-sm">
                      <FaLink />
                      { userProfile.website }
                      </span>
                  }
  

                  <span className="flex items-center justify-start gap-x-1 text-slate-500 text-sm">
                    <FaRegCalendarAlt />
                    Joined { getJoinDate(userProfile.created_at) }
                  </span>
              </div>
              {
                userProfile.bio && <p>{ userProfile.bio }</p>
              }
              
              <div className="flex gap-x-4">
                <NavLink to={`/${userProfile.username}/followers`} className="hover:underline"><b>{ quantityFormat(followerCount) }</b> Follower{ followerCount !== 1 && 's'}</NavLink>
                <NavLink to={`/${userProfile.username}/following`} className="hover:underline"><b>{ quantityFormat(userProfile.following_count) }</b> Following</NavLink>
              </div>
            </div>
          </div>

              : 
              
              <div ref={noUserProfile} className='w-full'>
                  <span className="text-2xl font-bold px-8">@{ username }</span>
              </div>
              
              }

        </div>
        {
          userProfile ? 
      
          <Tabs value={location.pathname} className=''>
                <TabsList className='flex justify-around  items-center  bg-white/50 w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>

                  <Tab text="Posts" slots={{root: NavLink}} to={`/${username}`} value={`/${username}`}/>
                  <Tab text="Replies" slots={{root: NavLink}} to={`/${username}/replies`} value={`/${username}/replies`}/>
                  <Tab text="Highlights" slots={{root: NavLink}} to={`/${username}/highlights`} value={`/${username}/highlights`}/>
                  <Tab text="Media" slots={{root: NavLink}} to={`/${username}/media`} value={`/${username}/media`}/>
                  { ( isUser || likeIsPublic ) && <Tab text="Likes" slots={{root: NavLink}} to={`/${username}/likes`} value={`/${username}/likes`}/> }
                </TabsList>

                  <section>
                    <TabPanel value={`/${username}`}>
                      <Tweets api={tweetRequests.myTweets} params={{ userId: userProfile.id}} FallBackComponent={  <OtherPostRepliesFallBack isUser={isUser} user={userProfile} isSetUp={isSetUp} type={"Posts"} />  }/>
                    </TabPanel>

                    <TabPanel value={`/${username}/replies`}>
                      <Tweets api={tweetRequests.replies} params={{ userId: userProfile.id}} FallBackComponent={ <OtherPostRepliesFallBack isUser={isUser} user={userProfile} isSetUp={isSetUp} type={"Replies"}/> } />
                    </TabPanel>

                      <TabPanel value={`/${username}/highlights`}>
                        <Tweets api={tweetRequests.highlights} params={{ userId: userProfile.id}} FallBackComponent={<HighlightsFallBack isUser={isUser} user={userProfile} /> } />
                      </TabPanel>

                    <TabPanel value={`/${username}/media`}>
                        <Tweets api={tweetRequests.myMedia} params={{ userId: userProfile.id}} asMedia={true} FallBackComponent={<MediaFallBack isUser={isUser} user={userProfile} /> } />
                    </TabPanel>

                  {
                  
                  ( isUser || likeIsPublic ) &&
                      <TabPanel value={`/${username}/likes`}>
                        <Tweets api={tweetRequests.likes} params={{ userId: userProfile.id}} FallBackComponent={<LikesFallBack isUser={isUser} user={userProfile}/> } />
                      </TabPanel>
                    
                    }
                </section>

            </Tabs>
            : 
            <div className="flex flex-col  m-32 gap-y-2 px-12">
              <h4 className='text-3xl font-bold'>This account does not exist</h4>
              <p className='text-slate-500 '>Try Searching for another.</p>
            </div>
            
            
            }

            <Outlet />

            </>
  )
}
 

  export default Profile
