import { useEffect, createContext, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
// import useInstance from "../hooks/useInstance";
import ReactLoading from 'react-loading'
import useUserContext from "../hooks/useUserContext";
import { useQuery,  useQueryClient } from "@tanstack/react-query";
import instance from "../constants/axios";

export const ValidUserContext = createContext(null)


const RequireValidUser = ({redirect}) => {

    const { username } = useParams();
    const { user, dispatch } = useUserContext()   
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const accessingProfile = location.pathname.split('/')[1] === username


    const naviagteTo404 = () => {
        // keep url of current page while navigating to 404
        navigate(redirect ?? '/404', {replace: location.pathname})
    }

    useEffect(() => {

        console.log('username in req', username, accessingProfile, queryClient.getQueryData(['user', username]))
        if (!username) {
            return naviagteTo404()
        }  
    },[username])

    // const [activeUser, setActiveUser] = useState(null)

    // const {data: activeUserData, error,loading, hasLoaded } = useInstance(`/users/username/${username}`)
     const {  data: activeUser, error, isLoading, isFetching  } = useQuery({
          queryKey: ['user', username],
          keepPreviousData: true,
          queryFn: async () => {
            const response = await instance.get(`users/username/${username}`)
            return response.data
          },
        retry: 1,
        // refetchOnMount: true,
        refetchOnWindowFocus: false,
        cacheTime: 0
    //   dont use onsuccess to set active user sinceif res is found in cache, onsuccess will not be called
        })

    useEffect(() => {
        // set user to undefined if error
        // setActiveUser(data?.user)
        if (!isLoading){
            console.log('active', activeUser, user.id)
            if (activeUser?.user.id === user?.id) dispatch({type: "UPDATE", payload: activeUser.user})
            if (accessingProfile) return
            if ( !activeUser || error) {
                return naviagteTo404()
            }
        }
        // console.log('active user in req', activeUserData)
        // setActiveUser(activeUserData?.user)
    }, [ error, activeUser])
  

    return (
        (isLoading) ? (
            <div className="flex justify-center items-center h-full w-full">
                <ReactLoading type='spin' color='#1da1f2' height={30} width={30} />
            </div>
        ) : (
             (activeUser?.user || accessingProfile) && (
                <ValidUserContext.Provider value={{activeUser: activeUser?.user.id === user?.id ? user : activeUser?.user, isLoading}}>
                    <Outlet />
                </ValidUserContext.Provider>
            )
        )
    )
}

export default RequireValidUser