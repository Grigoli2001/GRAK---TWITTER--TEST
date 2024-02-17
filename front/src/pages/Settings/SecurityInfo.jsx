import React from 'react'
import { useNavigate } from 'react-router-dom'

// icons
import { SlArrowRight } from "react-icons/sl";

// components
import ConfirmPassword from '../../components/ConfirmPassword'
import { Checkbox } from '@material-tailwind/react';


function SecurityInfo() {
    const nav = useNavigate()

    const handleClickFor2FA = () => {
        nav('/settings/security/2fa')
    }


  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Security" />
        <h6 className="font-normal text-xs py-2 px-4 text-gray-500 whitespace-normal">Manage your account’s security.</h6>
        <section className="w-full py-2">
            <h1 className="font-bold text-2xl py-2 px-4">Two-factor authentication</h1>
            <h6 className="font-normal text-xs py-2 px-4 text-gray-500 whitespace-normal">Help protect your account from unauthorized access by requiring a second authentication method in addition to your X password. You can choose a text message, authentication app, or security key. Learn more</h6>
            <div className='flex flex-row py-4 px-4 my-2 border-b border-gray-200 hover:bg-slate-100' onClick={handleClickFor2FA}>
                <h6 className="font-semibold text-sm text-gray-500 whitespace-normal">Two-factor authentication</h6>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </div>
        </section>
        <section className="w-full py-2">
            <h1 className="font-bold text-2xl py-2 px-4">Additional password protection</h1>
            <h6 className="font-normal text-xs py-2 px-4 text-gray-500 whitespace-normal">Enabling this setting adds extra security to your account by requiring additional information to reset your password. If enabled, you must provide either the phone number or email address associated with your account in order to reset your password.</h6>
            <div className='flex flex-row py-4 px-4 my-2' onClick={() => console.log('pressed')}>
                <div className='flex flex-col' >
                    <h6 className="font-semibold text-sm text-gray-500 whitespace-normal">Additional password protection</h6>
                    <h6 className="font-normal text-xs text-twitter-blue whitespace-normal">Learn more</h6>
                </div>
                <span className="ml-auto justify-center items-center self-center"> 
                    <Checkbox color="blue" />
                </span>
            </div>
        </section>
    </div>
  )
}

export default SecurityInfo