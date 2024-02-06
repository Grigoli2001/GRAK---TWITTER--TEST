import React from 'react'
import SideNav from '../../components/SideNav';
import { UserProvider } from '../../context/testUserContext';
import { Outlet } from 'react-router-dom';
import Settings from '../../pages/Settings/Settings';

const SettingsLayout = (props) => {
  
  return (
      <UserProvider>
      <div className="flex h-full  max-w-[1300px] mx-auto">

        <SideNav />

        <main className={`w-[650px]`}>
          <Settings />
        </main>

          <Outlet/>
      </div>
    </UserProvider>
    
  )
}

export default SettingsLayout;