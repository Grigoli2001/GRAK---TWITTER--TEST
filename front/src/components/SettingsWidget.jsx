import React from 'react'
import { NavLink } from 'react-router-dom'

// icons
import { SlArrowRight } from "react-icons/sl";

const SettingsWidget = ({url, icon, title, text, children}) => {
    return (
        <li>
            <NavLink to={url}
            className={`group w-full flex items-center justify-start text-xl bg-white hover:bg-slate-200 transition-colors duration-100 cursor-pointer p-4 py-5`}>
                <span className="text-black mx-4 relative group-[.active]:font-bold group-[.actvie]:text-lg"> 
                    { icon }
                </span>
                <span className="px-4 block">
                    <span className="text-black text-base block">
                        { title }
                    </span>

                    <span className="text-gray-500 text-xs block leading-none">
                    { text }
                    </span> 
                </span>
                <span className="ml-auto"> 
                    <SlArrowRight className="text-gray-800 h-3.5" />
                </span>
            </NavLink>
        </li>
    )
}

export default SettingsWidget;