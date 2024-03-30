import { forwardRef } from 'react'
import { Tab as BaseTab } from "@mui/base/Tab";
import { cn } from '../utils/style'

/**
 * Used only with Tabs component by mui/base --see Feed.jsx
 * Uses text prop to display text as child and for width of feed indicator
 * Extends material-ui Tab component
 */

export const Tab = forwardRef(({children,...props}, ref) => {

    // switch to using span as indicator after inline style/stylesheet error which styled all after elmts instead of the selected one
    const calcWidth = (text) => {
        let width = text?.length * 0.5
        return width 
    }

    const slotProps = {
        root: (ownerState) => { 
        // console.log(typeof ownerState.slots.root.render, 'ownerState.isActive')
          return({ 
            className: cn(
              'group py-3 hover:bg-gray-400/30  flex-1 relative text-center text-slate-500 font-semibold', 
              {
                "text-black font-bold`": ownerState.selected,
              })
            })
          }
    }
    // console.log(slotProps, 'slotProps')
  return  (
  <BaseTab {...props} slotProps={slotProps} ref={ref}>
    <span className='absolute bottom-0 h-1 left-1/2 -translate-x-1/2 rounded-full bg-twitter-blue transition-all duration-200 ease-in-out hidden group-[.base--selected]:block' 
    style={{ width: `${calcWidth(props.text)}rem` }}></span>
    {  children ?? props.text }
  </BaseTab>
  )
})

