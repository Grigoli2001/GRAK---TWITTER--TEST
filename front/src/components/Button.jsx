import React, { forwardRef } from 'react'
import { Button as BaseButton } from '@mui/base/Button'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/style'
import { Tooltip } from '@material-tailwind/react'

/**
 * Custom Button component which takes variant and size props 
 * TODO: Add ripple effect, elevation and icon props
 * I didnt like material tailwind button config
 */

export const buttonVariants = cva(
      'capitalize text-white font-bold rounded-full [&>*]:cursor-pointer',
      {
      variants:{
          variant:{
            default: 'bg-twitter-blue hover:bg-twitter-blue/80 border  text-white font-bold rounded-full disabled:bg-trasnparent disabled:text-twitter-blue/50',
            outlined: 'border border-slate-300 text-black hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-100',
            dark: 'bg-black border border-transparent hover:bg-slate-800/75', // switch to border transparent to avoid resizing between states when swapping buttons from outlined to dark and vice versa & fixed 2 hover colors to one
            text: 'hover:bg-slate-200', 
            icon: 'rounded-full text-lg text-twitter-blue hover:bg-twitter-blue/30  disabled:text-twitter-blue/50 disabled:bg-transparent'
          },
          size: {
            sm: 'text-sm px-3 py-1',
            md: 'text-base px-4 py-2',
            lg: 'text-lg px-5 py-3',
            "icon-sm": 'p-2',
          },
        },
        defaultVariants: {
          variant: 'default',
          size: 'md',
        },  
    }  
)



export const Button = forwardRef(({className, size, variant, ripple,elevate,disabled,  ...props}, ref) => {

  const Parent = (props.tooltip && !disabled) ? Tooltip : React.Fragment

  return (
    <Parent { ...((props.tooltip && !disabled) &&  { content:props.tooltip, placement:"bottom", color:"light", className:"z-[1000] !text-sm" })}>
      <BaseButton className={cn(buttonVariants({size, variant, className}))} {...props} ref={ref}>
        {props.children}
      </BaseButton>
    </Parent>
  )

})
