import React, { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { users } from '../constants/feedTest'
import { UserContext } from '../context/testUserContext'

const Profile = () => {

    const { user } = useContext(UserContext)
    const { username } = useParams()
    const userProfile = users.find(user => user.username === username)
    const isUser = userProfile?.username === user.username
      
  return (

    userProfile ? 
    <div>Profile</div>
    :
    <div>Not User</div>
  )
}

export default Profile