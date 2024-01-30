import { forwardRef } from 'react'
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";

/**
 * Twitter Component Tab Navigator
 * Used only with Tabs component by mui/base --see Feed.jsx
 * Uses text prop to display text as child and for width of feed indicator
 * Extends material-ui Tab component
 * TODO: conditional classes with cslx
 */
export const Tab = forwardRef((props, ref) => {

    // add as style to after pseudo element
    const calcWidth = (text) => {
        let width = text?.length * 0.5
        return width 
    }

    const activeClasses = `text-black font-bold after:left-1/2 after:-translate-x-1/2 after:absolute after:bottom-0 after:h-1 after:bg-twitter-blue after:rounded-full`
    const slotProps = {
        root: (ownerState) => ({ 
            className: `py-3 hover:bg-gray-400/30  flex-1 relative ${
              ownerState.selected ? activeClasses : 'text-slate-500 font-semibold'
            }`, 
          }),
    }
  return  (
  <BaseTab {...props} slotProps={slotProps} ref={ref}>
    <style type="text/css">
      {
        `::after {
          width: ${calcWidth(props.text)}rem;`
      }
    </style>
    {/* prioritise text over children */}
    { props.text ?? props.children }
  </BaseTab>
  )
})

