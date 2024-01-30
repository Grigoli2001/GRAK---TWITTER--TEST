import { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import { UserBlock } from './User'
import { FollowButton } from './FollowButton'
import Trend from './Trend'

// test
import { trends, users } from '../constants/feedTest'


/**
 * Widget component for who to follow and trends
 */
const Widget = ({title, children}) => {
    return (
        <section className="border-slate-100 border-solid bg-slate-50 rounded-xl">
            <h1 className="font-bold text-xl  px-4 py-2">{title}</h1>
            {children}
        </section>
    )
}

/**
 * To follow component for who to follow widget
 * TODO: add nav to user profile from here
 * 
 */
const ToFollow = ({user}) => {
    return (
        <UserBlock user={user} avatarSize='sm' textSize='lg' withNav={true}>
            <div className='ml-auto'>
                <FollowButton followed={false} />
            </div>
        </UserBlock>
    )
}

// expects array of widgets to exclude from rendering
const RightNav = ({excludeRenderWidgets=[]}) => {

    const [trending, setTrending] = useState([])
    const [whoToFollow, setWhoToFollow] = useState([])

    useEffect(() => {
        // fetch and set  trending
        setTrending(trends)

        // fetch who to follow TODO: update based on current user
        let w = users.filter((user) => user.id !== 1)
        setWhoToFollow(w.slice(0,3))
    }, [])

    return (
        <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 px-4 flex-col min-w-[250px]  
                        md:flex md:flex-1"
        >

        {!excludeRenderWidgets?.includes('SearchBar') &&
            <SearchBar fetchResults={'/api'} />
        }

            <section className='flex flex-col overflow-y-auto no-scrollbar gap-y-4'>

                <Widget title='Who to follow'>
                        {
                            whoToFollow.map((user, index) => {
                                return <ToFollow key={index} user={user} />
                            })
                        }
                        <span className="text-twitter-blue hover:underline text-xs pl-4 cursor-pointer">See more</span>
                </Widget>

        {!excludeRenderWidgets?.includes('Trending') &&
                <Widget title='Trends for you'>
                    {
                        trending.map((trend, index) => {
                            return <Trend key={index} index={index+1} category={trend.category} title={trend.title} numTweets={trend.tweets} isWidget={true} />
                        })
                    }
                    <span className="text-twitter-blue hover:underline text-xs pl-4 cursor-pointer">See more</span>

                </Widget>
        }       

        </section>


    </div>
  )
}

export default RightNav