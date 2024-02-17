import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// icons
import { IoIosArrowRoundBack } from "react-icons/io";


function ConfirmPassword({includeWidgets = [], name}) {
    const [password, setPassword] = useState('')
    const nav = useNavigate()

  return (
    <>
        <div className="flex flex-col items-start justify-between p-4">
            <div className="flex items-center justify-center">
                <IoIosArrowRoundBack className="text-3xl mr-2" onClick={() => nav(-1)} />
                <h2 className="text-xl font-bold ml-4">{name}</h2>
            </div>
        </div>
        {includeWidgets.includes('heading') && (
            <div className="flex flex-col items-start justify-center p-4 border-b border-l-gray-200">
                <div className='flex flex-col items-start justify-center mb-4"'>
                    <h2 className='text-xl font-extrabold mb-4'>Confirm your password</h2>
                    <p className='text-gray-500 text-xs'>Please enter your password in order to get this.</p>
                </div>
            </div>
        )}
        {includeWidgets.includes('middle') && (
        <div className="flex flex-col items-start p-4">
            <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-4 border border-l-gray-200 rounded-md placeholder:text-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-twitter-blue mb-4 ml-1">Forgot password?</p>
        </div>
        )}
            {includeWidgets.includes('button') && (
                <button className="bg-twitter-blue text-white font-bold p-1 px-4 rounded-3xl ml-auto">Confirm</button>
            )}
    </>
  )
}

export default ConfirmPassword