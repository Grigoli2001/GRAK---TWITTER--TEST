import { useRef, useCallback } from 'react'  
import { quantityFormat } from '../utils/utils'
import { Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import ReactLoading from 'react-loading'


// icons
import { FaEllipsis } from "react-icons/fa6";
import { FaRegFaceFrown } from "react-icons/fa6";
import { tweetRequests } from '../constants/requests';
import { NavLink } from 'react-router-dom';
import instance from '../constants/axios';
import {  useInfiniteQuery } from '@tanstack/react-query';
import { topics } from '../constants/feedTest'

/**
 * Trend component for trends widget and explore page
 */

const Trend = ({index, category, title, numTweets, isWidget}) => {
    
    const textSize = isWidget ? 'text-sm' : 'text-base'

    return (
      <NavLink to={`/explore/${title.slice(1)}`} className='flex justify-between pl-4 pr-2 py-3 hover:bg-slate-200/50 cursor-pointer transition-colors duration-200'>
          <div className='flex flex-col'>
              <span className={`${textSize} text-slate-500`}>
               {isWidget &&   `${index} · `  }
                {category} · Trending
            </span>
              <span className='font-bold'>{title}</span>
              <span className={`${textSize} text-slate-500`}>{quantityFormat(numTweets)} posts</span>
          </div>

          <Popover placement='left' offset={{ crossAxis: 20 }}>
            <PopoverHandler className='text-slate-800 p-2 self-start cursor-pointer rounded-full hover:bg-twitter-blue/15 hover:text-twitter-blue'>
              <div>
                <PopoverContent className='!p-0 !shadow-all-round text-black w-fit bg-white rounded-xl font-bold !outline-none z-10'>
                    <ul className='list-none text-sm'>
                        <li className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><FaRegFaceFrown/> Not interested in this</li>
                        <li className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><FaRegFaceFrown/> Report this trend</li>
                    </ul>
                </PopoverContent>
                    <FaEllipsis/>
              </div>
            </PopoverHandler>
          </Popover>
      </NavLink>
    )
  }

  export const TrendData = () => {
    // const { data: trending, loading, error, hasMore } = useInstance(tweetRequests.getTrending, {page: 1, limit: 5, headers: {}});
    const { error, data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading} = useInfiniteQuery({
      queryKey: ['trending'],
      queryFn: async ({ queryKey, pageParam }) => {
        const res = await  instance.get(tweetRequests.getTrending, { params: { page: pageParam, limit: 5} })
        return res.data
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.trends.length < 5) {
          return undefined
        }
        return lastPage.prevPage + 1
      },
      initialPageParam: 0
    })

    const observer = useRef() 
    const lastTrendElementRef = useCallback(node => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observer.current.observe(node)
    }, [isLoading, hasNextPage, fetchNextPage])

    const trends =  data?.pages?.reduce((acc, page) => {
      return [...acc, ...page.trends]
    }, [])
  
    if (trends && trends.length ===0  || error) {
      return (
        <div className="p-4 flex items-center jutsify-center text-slate-500 text-center"><p>No trends available</p></div>

      )
    }

    if (isLoading) {  
      return (
        <div className="flex justify-center items-center flex-col">
          <ReactLoading type="spin" color="#1da1f2" height={30} width={30} />
        </div>
      );
    }

    return (
      <>
       
            {trends && trends.map((trend, index) =>{ 
              // gen random category
              const categoryIndex =  Math.floor(Math.random() * topics.length);
              const category = topics[categoryIndex].category
              return (
                <Trend key={index} index={index + 1} category={category} title={'#'+trend.tag} numTweets={trend.count} isWidget={true} />
              )}
              )}
              {isFetchingNextPage && <div className='flex justify-center items-center'><ReactLoading type="spin" color="#1da1f2" height={30} width={30} /></div>}
      </>
    );
  };
