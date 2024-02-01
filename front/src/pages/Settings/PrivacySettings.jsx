import React from 'react'
import { NavLink } from 'react-router-dom';

// components
import SettingsWidget from '../../components/SettingsWidget';
import { SetttingsWidgetXs } from './Settings';
import { getPrivacyOptionsOne, getPrivacyOptionsTwo } from '../../utils/dataList';

let options = getPrivacyOptionsOne();
let optionstwo = getPrivacyOptionsTwo();


function PrivacySettings() {

    return (
      <div className="hidden h-screen overflow-y-auto no-scrollbar border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
          >
          <section className="w-full py-2">
              <h1 className="font-bold text-2xl pt-2 pb-1 px-4">Privacy and Safety</h1>
              <h6 className="font-normal text-sm pt-1 pb-2 px-4 text-gray-500 whitespace-normal">Manage what information you see and share on X.</h6>
              <section className='border-b border-gray-200'>
                <h1 className="font-black text-xl py-2 px-4">Your X activity</h1>
                <section className='flex flex-col'>
                    <ul className="list-none">
                        {options.map((option, index) => (
                            <SettingsWidget key={index} {...option} />
                        ))}
                    </ul>
                </section>
              </section>
              <section className='border-b border-gray-200'>
              <h1 className="font-black text-xl py-2 pt-4 px-4">Data sharing and personalization</h1>
                <section className='flex flex-col'>
                    <ul className="list-none">
                        {optionstwo.map((option, index) => (
                            <SettingsWidget key={index} {...option} />
                        ))}
                    </ul>
                </section>
              </section>
              <section className='mb-20'>
                <h1 className="font-black text-xl py-2 pt-4 px-4">Learn more about privacy on X</h1>
                <section className='flex flex-col'>
                    <ul className="list-none">
                        <SetttingsWidgetXs url='#' title='Privacy Policy' />
                        <SetttingsWidgetXs url='#' title='Data Transfer Policy' />
                        <SetttingsWidgetXs url='#' title='Data Protection Agreement' />
                    </ul>
                </section>
              </section>
          </section>
      </div>
    )
  }
  
  export default PrivacySettings;