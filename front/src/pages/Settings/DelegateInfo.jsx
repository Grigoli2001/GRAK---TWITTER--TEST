import React from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'
import { Switch } from "@material-tailwind/react";

// icons
import { SlArrowRight } from "react-icons/sl";

function DelegateInfo() {
  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Delegate" />
        <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">Share an account with people who have delegated roles.</h6>
        <div className='flex flex-row py-4 px-4 my-2' onClick={() => console.log('pressed')}>
            <div className='flex flex-col' >
                <h6 className="font-semibold text-sm text-black whitespace-normal">Allow others to invite you to their account</h6>
                <h6 className="font-normal text-xs text-gray-500 whitespace-normal">When this setting is on, people can invite you to share their account. Learn more</h6>
            </div>
            <span className="ml-auto justify-center items-center self-center"> 
                <Switch color='blue' />
            </span>
        </div>
        <section className="w-full py-2">
            <h1 className="font-bold text-2xl py-2 px-4">Your delegations</h1>
            <div className='flex flex-row py-4 px-4 my-2 hover:bg-slate-100' onClick={() => console.log('pressed')}>
                <h6 className="font-semibold text-sm text-gray-500 whitespace-normal">Accounts delegated to you</h6>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </div>
            <div className='flex flex-row py-4 px-4 hover:bg-slate-100' onClick={() => console.log('pressed')}>
                <h6 className="font-semibold text-sm text-gray-500 whitespace-normal">Members you’ve delegated</h6>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </div>
        </section>
    </div>
  )
}

export default DelegateInfo