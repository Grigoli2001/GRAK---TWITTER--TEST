import React, { createElement } from 'react'
import { Avatar } from '@material-tailwind/react'
import { defaultAvatar } from '../utils/utils'
import { MdVerified } from 'react-icons/md'
import { showName, showUsername } from '../utils/utils'
import { NavLink } from 'react-router-dom'

/**
 * Custom Avatar component which takes variant and size props
 * Extends material-tailwind Avatar component
 */
export const ExtAvatar = ({src, ...props}) => {
  return (
    <Avatar src={src ?? defaultAvatar} {...props} />
  )
}

export const UserBlock = ({user, children, withNav, avatarSize="md", textSize="md"}) => {

  // TODO: add as variant ?
  const textSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
  }
  let keys = Object.keys(textSizes)
  const index = keys.findIndex(size => size == textSize)
  const finalTextSize = textSizes[textSize] ?? textSizes.md
  const prevSize =textSizes[keys[index - 1]] ?? 'text-xs'

  const ParentComponent = withNav ? NavLink : 'div'

  // TODO add hover card
  const navProps = withNav ? { to: `/${user.username}` } : {}

  return (
      <ParentComponent  {...navProps} className='flex items-center gap-x-2 p-2 hover:bg-slate-200/50 cursor-pointer transition-colors duration-200'>
          <div className='flex-shrink-0'>
              <ExtAvatar src={user.avatar} size={avatarSize} />
          </div>
          <div className={`flex flex-col items-start pointer-events-none mr-auto ${finalTextSize}`}>
              <p className='font-bold inline-flex items-center gap-1'>{showName(user)} {user.verified && <MdVerified className='text-twitter-blue' /> }</p>
              <p className={`text-slate-400 ${prevSize}`}>{showUsername(user)}</p>
          </div>
          {children}
      </ParentComponent>
  )
}

