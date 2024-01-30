import React from 'react'
import MiniDialog from './MiniDialog'
import { quantiyFormat } from '../utils/utils'

// icons
import { FaEllipsis } from "react-icons/fa6";
import { FaRegFaceFrown } from "react-icons/fa6";

/**
 * Trend component for trends widget and explore page
 * TODO: add nav to trend from here
 */

const Trend = ({index, category, title, numTweets, isWidget}) => {
    
    const textSize = isWidget ? 'text-sm' : 'text-base'

    return (
      <div className='flex justify-between pl-4 pr-2 py-3 hover:bg-slate-200/50 cursor-pointer transition-colors duration-200'>
          <div className='flex flex-col'>
              <span className={`${textSize} text-slate-500`}>
               {isWidget &&   `${index} ·`  }
                
                {category} · Trending
            </span>
              <span className='font-bold'>{title}</span>
              <span className={`${textSize} text-slate-500`}>{quantiyFormat(numTweets)} posts</span>
          </div>

            {/*TODO: add transiton to dialog */}
          <MiniDialog>
            <MiniDialog.Wrapper className="className='text-slate-800 p-2 self-start cursor-pointer rounded-full hover:bg-twitter-blue/15 hover:text-twitter-blue">
                <MiniDialog.Dialog className='absolute -left-[9rem] top-0 w-fit bg-white rounded-xl shadow-all-round font-bold !outline-none z-10'>
                    <ul className='list-none text-sm'>
                        <li className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><FaRegFaceFrown/> Not interested in this</li>
                        <li className='hover:bg-slate-200/50 p-2 cursor-pointer flex items-center gap-2 whitespace-nowrap'><FaRegFaceFrown/> Report this trend</li>
                    </ul>
                </MiniDialog.Dialog>
                    <FaEllipsis/>
            </MiniDialog.Wrapper>
          </MiniDialog>
      </div>
    )
  }
export default Trend