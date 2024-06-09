// import { useContext, useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import { UserDisplayer } from './User'
import { TrendData } from './Trend'
import { NavLink, useLocation } from 'react-router-dom'
import { requests } from '../constants/requests'
import useUserContext from '../hooks/useUserContext'

/**
 * Widget component for who to follow and trends
 */
const Widget = ({title, children}) => {
    
    return (
        <section className="border-slate-100 border-solid bg-slate-50 rounded-xl overflow-hidden border">
            <h1 className="font-bold text-xl  px-4 py-2">{title}</h1>
            {children}
        </section>
    )
}

// expects array of widgets to include from rendering
const RightNav = ({includeRenderWidgets=[]}) => {

    const location = useLocation()
    const { user } = useUserContext()
    
    return (
        <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 px-4 flex-col min-w-[250px]  
                        md:flex md:flex-1"
        >

        {includeRenderWidgets?.includes('SearchBar') &&
            <SearchBar fetchResults={'/api'} />
        }
            {/* fixed scroll issue within widgets */}
            <section className='overflow-y-scroll no-scrollbar'>
                <div className='flex flex-col gap-y-4 pb-4'>

                {includeRenderWidgets?.includes('WhoToFollow') &&
                <Widget title={location.pathname.includes(`/${user.username}`) ?  " You might Like ": " Who to follow " }>
                        <UserDisplayer api={requests.exploreUsers} params={{limit:3}} withCard withFollow withNavTo="/" isInfinite={false} />
                        <NavLink to={`/i/connect-people`} >
                            <div className='p-4 hover:bg-slate-200/50 cursor-pointer text-twitter-blue hover:underline text-sm'>
                                <span>Show more</span>
                            </div>
                        </NavLink>
                </Widget>
                }

            {includeRenderWidgets?.includes('Trending') &&

                <Widget title='Trends for you'>
                   <TrendData isInfinite={false}/>
                   <NavLink to={`/i/trends`} >
                        <div className='p-4 hover:bg-slate-200/50 cursor-pointer text-twitter-blue hover:underline text-sm'>
                            <span>Show more</span>
                        </div>
                 </NavLink>

                </Widget>
        }       
             </div>
        </section>


    </div>
  )
}

export default RightNav