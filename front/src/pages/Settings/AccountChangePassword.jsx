import React, { useState } from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'

function AccountChangePassword(props) {
    const [disabled, setDisabled] = useState(true)
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [authenticated, setAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Change your password" />
        <div className="flex flex-col items-start justify-center p-4 border-t border-l-gray-200 border-b">
        <input 
            type="password" 
            placeholder="Old Password" 
            className="w-full p-4 border border-l-gray-200 rounded-md my-4 placeholder:text-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex flex-col items-start justify-center p-4 border-l-gray-200 border-b">
        <input 
            type="password" 
            placeholder="New Password" 
            className="w-full p-4 border border-l-gray-200 rounded-md my-4 placeholder:text-gray-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} />
        <input 
            type="password" 
            placeholder="Confirm Password" 
            className="w-full p-4 border border-l-gray-200 rounded-md mb-4 placeholder:text-gray-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button className="bg-twitter-blue text-white font-bold p-1 px-4 rounded-3xl ml-auto mt-4 mr-2 disabled:bg-slate-300" disabled={disabled ? true : false}>Save</button>
    </div>
  )
}

export default AccountChangePassword