import React from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'
import { Checkbox } from '@material-tailwind/react'

function TwoFactorAuth() {
  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Two-factor authentication" />
        <h1 className="font-bold text-2xl py-2 px-4">Two-factor authentication</h1>
        <section className="w-full py-2">
            <div className='flex flex-row py-4 px-4 my-2'>
                <div className='flex flex-col' >
                    <h6 className="font-bold text-sm text-gray-500 whitespace-normal">Text message</h6>
                    <h6 className="font-normal text-xs text-gray-500 whitespace-normal">Use your mobile phone to receive a text message with an authentication code to enter when you log in to X.
</h6>
                </div>
                <span className="ml-auto justify-center items-center"> 
                    <Checkbox color="blue" />
                </span>
            </div>
            <div className='flex flex-row py-4 px-4 my-2'>
                <div className='flex flex-col' >
                    <h6 className="font-bold text-sm text-gray-500 whitespace-normal">Authentication app</h6>
                    <h6 className="font-normal text-xs text-gray-500 whitespace-normal">Use a mobile authentication app to get a verification code to enter every time you log in to X.</h6>
                </div>
                <span className="ml-auto justify-center items-center"> 
                    <Checkbox color="blue" />
                </span>
            </div>
            <div className='flex flex-row py-4 px-4 my-2'>
                <div className='flex flex-col' >
                    <h6 className="font-bold text-sm text-gray-500 whitespace-normal">Security key</h6>
                    <h6 className="font-normal text-xs text-gray-500 whitespace-normal">Use a security key that inserts into your computer or syncs to your mobile device when you log in to X. You’ll need to use a supported mobile device or web browser. Learn more</h6>
                </div>
                <span className="ml-auto justify-center items-center"> 
                    <Checkbox color="blue" />
                </span>
            </div>
        </section>
    </div>
  )
}

export default TwoFactorAuth