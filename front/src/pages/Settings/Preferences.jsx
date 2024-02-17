import React from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'

// icons
import { SlArrowRight } from 'react-icons/sl'


function Preferences() {
  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Filters" />
        <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">Select your preferences by notification type. Learn more</h6>
        <section className="w-full py-2">
            <div className='flex flex-row py-4 px-4 my-2 hover:bg-slate-100' onClick={() => console.log('pressed')}>
                <h6 className="font-normal text-sm text-black whitespace-normal">Push Notifications</h6>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </div>
            <div className='flex flex-row py-4 px-4 my-2 hover:bg-slate-100' onClick={() => console.log('pressed')}>
                <h6 className="font-normal text-sm text-black whitespace-normal">Email Notifications</h6>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </div>
        </section>
    </div>
  )
}

export default Preferences