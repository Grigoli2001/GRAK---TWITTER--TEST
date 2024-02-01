import React from 'react'
import { NavLink } from 'react-router-dom';

// icons
import { PiMedalLight } from "react-icons/pi";
import { GoArrowUpRight } from "react-icons/go";

function CreatorSettings() {

    return (
      <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
          >
          <section className="w-full py-2">
              <h1 className="font-bold text-2xl py-2 px-4">Creator Subscriptions</h1>
            <section className='flex flex-col'>
                <ul className="list-none">
                    <li>
                        <NavLink to="#"
                            className={`group w-full flex items-center justify-start text-xl bg-white hover:bg-slate-200 transition-colors duration-100 cursor-pointer p-4 py-5`}>
                            <span className="text-black mx-4 relative group-[.active]:font-bold group-[.actvie]:text-lg"> 
                                <PiMedalLight />
                            </span>
                            <span className="px-4 block">
                                <span className="text-black text-base block">
                                    Manage Creator Subscriptions
                                </span>

                                <span className="text-gray-500 text-xs block leading-none">
                                    Manage your subscriptions to creators on Twitter.View and manage your subscriptions to creators below using Stripe. Any active subscriptions you initiated on iOS or Android can be managed in the app.
                                </span> 
                            </span>
                            <span className="ml-auto"> 
                                <GoArrowUpRight className="text-gray-800 h-3.5" />
                            </span>
                        </NavLink>
                    </li>
                </ul>
            </section>
          </section>
      </div>
    )
  }
  
  export default CreatorSettings;