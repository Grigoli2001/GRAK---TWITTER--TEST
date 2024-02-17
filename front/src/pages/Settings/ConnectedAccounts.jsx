import React, { useState } from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'


function ConnectedAccounts() {
    const [connectedAccounts, setConnectedAccounts] = useState([])

    const handleDeactivate = () => {
        // deactivate account
    }

  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Connected accounts" />
        <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">These are the social accounts you connected to your X account to log in. You can disable access here.</h6>
        <section className="w-full py-2">
            <div className='flex flex-row p-4'>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" className='self-center my-2 mx-2 mr-4'>
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                <div className='flex flex-col self-center' >
                    <h6 className="font-bold text-s text-black whitespace-normal">Google</h6>
                    <div className='flex flex-row self-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0,0,256,256" className='self-center mr-1'>
                        <g fill="#05FB00" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style={{'mix-blend-mode': 'normal'}}><g transform="scale(2,2)"><path d="M64,6c-32,0 -58,26 -58,58c0,32 26,58 58,58c32,0 58,-26 58,-58c0,-32 -26,-58 -58,-58zM64,12c28.7,0 52,23.3 52,52c0,28.7 -23.3,52 -52,52c-28.7,0 -52,-23.3 -52,-52c0,-28.7 23.3,-52 52,-52zM85.03711,48.94922c-0.7625,0.025 -1.53672,0.35117 -2.13672,0.95117l-20.90039,21.69922l-10.90039,-11.69922c-1.1,-1.2 -2.99922,-1.30117 -4.19922,-0.20117c-1.2,1.1 -1.30117,3.00117 -0.20117,4.20117l13.10156,14.09961c0.6,0.6 1.29922,1 2.19922,1c0.8,0 1.59922,-0.30039 2.19922,-0.90039l23,-24.09961c1.1,-1.2 1.10039,-3.09922 -0.09961,-4.19922c-0.55,-0.6 -1.3,-0.87656 -2.0625,-0.85156z"></path></g></g>
                        </svg>
                        <h6 className="font-normal text-xs text-green-400 whitespace-normal">Connected</h6>
                    </div>
                </div>
                <span className="ml-auto justify-center items-center self-center mr-2"> 
                    <h6 className="font-normal text-sm text-black whitespace-normal">exampleEmail@gmail.com</h6>
                </span>
            </div>
            <button 
                className="text-bold text-red-500 p-4 my-4 w-full hover:bg-rose-50"
                onClick={handleDeactivate}
                >
                    Disconnect
            </button>
        </section>
    </div>
  )
}

export default ConnectedAccounts