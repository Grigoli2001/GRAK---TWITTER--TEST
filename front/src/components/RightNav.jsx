import { useContext, useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import { UserDisplayer } from './User'
import Trend from './Trend'
import { NavLink, useLocation } from 'react-router-dom'
import { UserContext } from '../context/testUserContext'
// test
import { trends } from '../constants/feedTest'

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
    const { user } = useContext(UserContext)
    
    
    const [trending, setTrending] = useState([])

    useEffect(() => {
        // fetch and set  trending
        setTrending(trends.slice(0,5))
    }, [])

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
                        <UserDisplayer limit={3} withCard={true}/>
                        <NavLink to={`/i/connect-people`} >
                            <div className='p-4 hover:bg-slate-200/50 cursor-pointer text-twitter-blue hover:underline text-sm'>
                                <span>Show more</span>
                            </div>
                        </NavLink>
                </Widget>
                }

            {includeRenderWidgets?.includes('Trending') &&
                <Widget title='Trends for you'>
                    {
                        trending.map((trend, index) => {
                            return <Trend key={index} index={index+1} category={trend.category} title={trend.title} numTweets={trend.tweets} isWidget={true} />
                        })
                    }
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