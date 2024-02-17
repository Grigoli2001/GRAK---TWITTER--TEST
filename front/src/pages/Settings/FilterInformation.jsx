import React from 'react'
import ConfirmPassword from '../../components/ConfirmPassword';

// components
import { Checkbox } from '@material-tailwind/react';
import { SlArrowRight } from "react-icons/sl";

function FilterInformation() {
  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Filters" />
        <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">Choose the notifications you’d like to see — and those you don’t.</h6>
        <section className="w-full py-2">
        <div className='flex flex-row py-4 px-4 my-2'>
            <div className='flex flex-col' >
                <h6 className="font-normal text-sm text-black whitespace-normal">Quality filter</h6>
                <h6 className="font-normal text-xs text-gray-500 whitespace-normal">Choose to filter out content such as duplicate or automated posts. This doesn’t apply to notifications from accounts you follow or have interacted with recently. Learn more</h6>
            </div>
            <span className="ml-auto justify-center items-center"> 
                <Checkbox color="blue" defaultChecked/>
            </span>
        </div>
        <div className='flex flex-row py-4 px-4 my-2 hover:bg-slate-100' onClick={() => console.log('pressed')}>
            <h6 className="font-normal text-sm text-black whitespace-normal">Muted Notifications</h6>
            <span className="ml-auto"> 
                <SlArrowRight className="text-gray-800 h-3.5" />
            </span>
        </div>
        </section>
    </div>
  )
}

export default FilterInformation