import React from 'react'
import { Button } from '../../components/Button'
import { NavLink } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-start mt-24 gap-y-4   h-full w-full">
      
      <h4 className="text-base font-semibold text-slate-400">Hmmm... this page doesn't exit. Try Searching for something else.</h4>
      <NavLink to="/explore">
        <Button size="sm">Search</Button>
      </NavLink>
    </div>
  )
}

export default NotFound