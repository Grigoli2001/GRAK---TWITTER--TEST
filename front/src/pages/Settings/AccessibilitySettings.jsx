import React from 'react'
import { NavLink } from 'react-router-dom';

// components
import SettingsWidget from '../../components/SettingsWidget';
import { getAccessibilityOptions } from '../../utils/dataList';

const options = getAccessibilityOptions();

function AccessibilitySettings() {

    return (
      <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
          >
          <section className="w-full py-2">
              <h1 className="font-bold text-2xl py-2 px-4">Accessibility, display and languages</h1>
            <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">Manage how X content is displayed to you.</h6>
            <section className='flex flex-col'>
                <ul className="list-none">
                    {options.map((option, index) => (
                        <SettingsWidget key={index} {...option} />
                    ))}
                </ul>
            </section>
          </section>
      </div>
    )
  }
  
  export default AccessibilitySettings;