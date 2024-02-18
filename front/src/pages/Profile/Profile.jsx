import React, { useContext, useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useParams, useNavigate, NavLink, useLocation, Outlet } from 'react-router-dom'
import { showUsername, quantityFormat, getJoinDate } from '../../utils/utils'
import { users } from '../../constants/feedTest'
import { ExtAvatar } from '../../components/User'
import { Button } from '../../components/Button'
import { FollowButton } from '../../components/FollowButton'
import  { Tab } from '../../components/Tabs';
import {Tabs} from '@mui/base/Tabs';
import { TabsList  } from '@mui/base/TabsList';
import { TabPanel  } from '@mui/base/TabPanel';
import Tweets from '../../components/tweet/Tweets'

// icons
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaArrowLeftLong} from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { UserDisplayer } from '../../components/User'

import instance from '../../constants/axios'
import { followRequests, requests } from '../../constants/requests'
import { joinDate } from '../../utils/utils'
import useUserContext from '../../hooks/useUserContext'


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

const OtherPostRepliesFallBack = ({user, isUser, isSetUp}) => {

  return (

    isUser ?
    <>

      {
        !isSetUp &&
// TODO add states to check which steps are completed
          <div className='overflow-x-scroll no-scrollbar border-b border-solid border-b-gray-200 py-4'>
            <h3 className='font-bold text-xl  px-4 py-2'>Let's get you set up</h3>
            <div className='flex justify-evenly'>

              <div className='flex flex-col items-center gap-y-2 cursor-pointer hover:scale-105 transition-transform ease-in-out duration-200'>
                <div className='h-24 w-auto overflow-clip rounded-lg flex items-center justify-center'>
                  <img src="https://ton.twimg.com/onboarding/persistent_nux/profile_2x.png" alt="profile" className="w-full h-full" />
                </div>
                <p className='text-sm font-bold'>Complete Your Profile</p>
              </div>

              <div className='flex flex-col items-center gap-y-2 cursor-pointer hover:scale-105 transition-transform ease-in-out duration-200'>
                <div className='h-24 w-auto overflow-clip rounded-lg flex items-center justify-center'>
                    <img src="https://ton.twimg.com/onboarding/persistent_nux/follow_2x.png" alt="profile" className="w-full h-full" />
                  </div>
                <p  className='text-sm font-bold'>Follow 5 Accounts</p>
              </div>

              <div className='flex flex-col items-center gap-y-2 cursor-pointer hover:scale-105 transition-transform ease-in-out duration-200'>
                <div className='h-24 w-auto overflow-clip rounded-lg flex items-center justify-center'>
                    <img src="https://ton.twimg.com/onboarding/persistent_nux/notifs_2x.png" alt="profile" className="w-full h-full" />
                  </div>
                  <p  className='text-sm font-bold'>Turn on Notifications</p>
              </div>
            </div>
          </div>

      }

    
      <h3 className='font-bold text-xl  px-4 py-2'>Who To Follow</h3>
      <UserDisplayer  limit={3} withCard withFollow withNavTo={'/'} />
    </>
    :
    <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4">
      <h4 className='text-3xl font-bold'>{  `${showUsername(user)} hasn't posted yet`}</h4>
      <p className='text-slate-500 '>{  "When they do, their posts will show up here."}</p>
    </div>
  )
}




const Profile = () => {

  const { user } = useUserContext()
  const { username } = useParams()

  // checks if the user is the current user 
  const isUser = username === user.username
      

  const [ postCount, setPostCount ] = useState(null)
  const [followerCount, setFollowerCount] = useState(null)
  const [followingCount, setFollowingCount] = useState(null)
  const [ following, setFollowing ] = useState([])
  const [ userProfile, setUserProfile ] = useState(null)

  const [ isSetUp, setIsSetUp ] = useState(false)
  // get from user settings
  const [ likeIsPublic, setLikesIsPublic ] = useState(false)

  const profileContainer = useRef(null)
  const noUserProfile = useRef(null)

  //  checks if a profile is found
  useEffect(() => {
    instance.post(requests.getUser, {username: username}).then(res => {
      console.log('user', res.data)
      setUserProfile(res.data.user)
    }).catch(err => {
      console.error(err)
    })
  },[username])

  useLayoutEffect(() => {
    document.title = `${showUsername(user)} / Twitter`
    if (profileContainer.current) {
      const profileRect = profileContainer.current.getBoundingClientRect()
      profileContainer.current.style.bottom = `-${(profileRect.height)/2}px`

      if (noUserProfile.current) {
        console.log(noUserProfile.current)
        noUserProfile.current.style.marginTop = `${profileRect.height/4}px`
      }
    }

   
  }, [user])


  useEffect(() => {
    // api.getTweets().then((tweets) => {
    //   setTweets(tweets)
    // })
  // test

  if(userProfile) {
    if (user.location || user.profile_pic || user.bio || user.website || user.birthday || user.cover) {
      setIsSetUp(true)
    }
    
    instance
    .get(followRequests.followers, {params: {followerId: userProfile.id}})
    .then(res => {
      setFollowerCount(res.data.length)
    })
    .catch(err => console.error(err))

    instance
    .get(followRequests.following, {params: {userId: userProfile.id}})
    .then(res => {
      setFollowingCount(res.data.length)
      setFollowing(res.data ? res.data.map(following => following.following) : [])
    })
    .catch(err => console.error(err))

    setPostCount(10)
  }
  }, [userProfile])

  const location = useLocation() // used to pass previous location to the router for the cover and profile
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(-1)
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
                        { quantityFormat(postCount) } post{ postCount !== 1 && 's'}
                      </p>

                      </>
                      :

                      <h3 className="font-bold text-lg"> Profile</h3>
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
        

        {userProfile ?

          <div className="grid">

            <div className="ml-auto mr-4 self-end">

            {
              isUser ? (
                <NavLink to="/settings/profile" state={{ background : location}}>
                  <Button variant="outlined">
                    { isSetUp ? 'Edit Profile' : 'Set Up Profile'}
                  </Button>
                </NavLink>
              ) : (
                following.includes(userProfile.id) ? (
                  <FollowButton followed={true} userid={user.id} followerid={userProfile.id} size='md' />
                ) : (
                  <FollowButton followed={false} userid={user.id} followerid={userProfile.id} size='md' />
                )
              )
            }
            </div>

            <div className="grid ml-4 gap-y-1">
              <h3 className="font-bold text-xl text-wrap">
                {userProfile.name}
              </h3>
              <p className="text-slate-500 text-sm">{ showUsername(userProfile) }</p>

              <div className='flex items-center gap-x-4'>

                  { userProfile.location &&
                    <span className="flex items-center justify-start gap-x-1 text-slate-500 text-sm">
                      <IoLocationOutline />
                      { userProfile.location }
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
                <NavLink to={`/${userProfile.username}/following`} className="hover:underline"><b>{ quantityFormat(followingCount) }</b> Following</NavLink>
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
                      <Tweets api={'mytweets'}  FallBackComponent={  <OtherPostRepliesFallBack isUser={isUser} user={userProfile} isSetUp={isSetUp} />  }/>
                    </TabPanel>

                    <TabPanel value={`/${username}/replies`}>
                      <Tweets api={'replies'} FallBackComponent={  <OtherPostRepliesFallBack isUser={isUser} user={userProfile} isSetUp={isSetUp} /> } />
                    </TabPanel>

                      <TabPanel value={`/${username}/highlights`}>
                        <Tweets api={'highlights'} FallBackComponent={<HighlightsFallBack isUser={isUser} user={userProfile} /> } />
                      </TabPanel>

                    <TabPanel value={`/${username}/media`}>
                        <Tweets api={'media'} asMedia={true} FallBackComponent={<MediaFallBack isUser={isUser} user={userProfile} /> } />
                    </TabPanel>

                  {
                  
                  ( isUser || likeIsPublic ) &&
                      <TabPanel value={`/${username}/likes`}>
                        <Tweets api={'likes'} FallBackComponent={<LikesFallBack isUser={isUser} user={userProfile}/> } />
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
          

  )}

  export default Profile
