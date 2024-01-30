import { useEffect, useState} from 'react'
import Trend from '../components/Trend'
import SearchBar from '../components/SearchBar'
import { trends } from '../constants/feedTest'
import { Button } from '../components/Button'
import { FiSettings } from "react-icons/fi";


/**
 * 
 * Explore Draft
 */
const Explore = () => {
    
    const [trending, setTrending] = useState([])

    useEffect(() => {
        // fetch and set  trending
        setTrending(trends)
    }, [])

    return (
        <section>
            <div className='flex sticky items-center p-2 gap-4 top-0  bg-white/85 w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>
                <SearchBar fetchResults={'/api'} className={'!my-auto'}/>
                <Button variant='icon' size='icon-sm' className="text-black hover:bg-gray-300/50">
                    <FiSettings/>
                </Button>
            </div>
            <div>
                {
                    trending.map((trend, index) => {
                        return <Trend key={index} index={index+1} category={trend.category} title={trend.title} numTweets={trend.tweets} />
                    })

                }
            </div>

        </section>
  )
}

export default Explore