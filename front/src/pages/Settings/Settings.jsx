import React from 'react'
import { NavLink } from 'react-router-dom'

// icons
import { CiSearch } from "react-icons/ci";
import { SlArrowRight } from "react-icons/sl";

export const SetttingsWidgetXs = ({url, title, children}) => {
  return (
      <li>
          <NavLink to={url}
          className={`group w-full flex items-center justify-start text-xl bg-white hover:bg-slate-200 transition-colors duration-100 cursor-pointer p-3.5 active:bg-blue`}>
              <span className="px-2 block">
                  <span className="text-black text-base block">
                      { title }
                  </span>
              </span>
              <span className="ml-auto"> 
                  <SlArrowRight className="text-gray-800 h-3.5" />
              </span>
          </NavLink>
      </li>
  )
}

const SettingList = [
  {
    title: 'Your Account',
    url: 'settings/account'
  },
  {
    title: 'Monetization',
    url: 'settings/monetization'
  },
  {
    title: 'Premium',
    url: '#'
  },
  {
    title: 'Creator Subscription',
    url: 'settings/creator'
  },
  {
    title: 'Security and account access',
    url: 'settings/security'
  },
  {
    title: 'Privacy and safety',
    url: 'settings/privacy'
  },
  {
    title: 'Notifications',
    url: 'settings/notifications'
  },
  {
    title: 'Accessibility, display, and languages',
    url: 'settings/accessibility'
  },
  {
    title: 'Additional resources',
    url: '#'
  },
  {
    title: 'Help Center',
    url: '#'
  }
]

function Settings() {
  return (
    <section className="py-2">
        <h1 className="font-bold text-2xl py-2 px-4">Settings</h1>
        <div className={`py-2 px-4 mt-1 mb-1 relative`}>
        {/* <GoSearch className="text-slate-600" /> */}
        <CiSearch className="text-black absolute top-5 left-6 h-5 w-5 " />
        
        <input
        autoComplete="off"
        name="search"
        placeholder="Search Settings"
        className="focus-within:border-slate-500 w-full flex items-center justify-start rounded-full border border-black bg-transparent py-2 px-8 placeholder:text-gray-500 bg-slate-100"
        />

        </div>
        <section className='flex flex-col gap-y-2'>
            <ul className="list-none">
              {SettingList.map((setting, index) => {
                return <SetttingsWidgetXs key={index} url={setting.url} title={setting.title} />
                }
              )}
            </ul>
        </section>
    </section>
  )
}

export default Settings