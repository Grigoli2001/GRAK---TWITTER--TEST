import React from 'react'
import { Outlet } from 'react-router-dom';
import Settings from '../../pages/Settings/Settings';

const SettingsLayout = (props) => {
  
  return (
      <>
        <div className={`w-[650px]`}>
          <Settings />
        </div>
        <Outlet/>
    </>
    
  )
}

export default SettingsLayout;