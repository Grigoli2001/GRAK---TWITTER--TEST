import React from 'react'
import { useNavigate } from 'react-router-dom';

// components
import { UserBlock } from '../../components/User';
import ConfirmPassword from '../../components/ConfirmPassword';

// context
import { users } from '../../constants/feedTest';
const user = users[0];

const ProfileTab = ({ user }) => {
    // I added logout because I need for testing
      const navigate = useNavigate();
        return (
          <div className="rounded-full text-xl flex items-center text-black gap-x-3 hover:bg-slate-200 px-2 cursor-pointer">
                    <div>
              <UserBlock user={user} size="sm" />
            </div>
          </div>
      );
    };

const handleDeactivate = () => {
    console.log('deactivate account')
}

function DeactivateAccount() {
  return (
    <div className="hidden h-screen sticky top-0 flex-col min-w-[600px] md:flex md:flex-1"
        >
        <ConfirmPassword includeWidgets={[]} name="Deactivate account" />
        <ProfileTab user={user}/>
        <div className="flex flex-col items-start justify-center p-4 mt-2 gap-y-4">
            <h2 className="text-xl font-bold">This will deactivate your account</h2>
            <h2 className="text-xs font-regular text-slate-600">You’re about to start the process of deactivating your X account. Your display name, @username, and public profile will no longer be viewable on X.com, X for iOS, or X for Android.</h2>
            <h2 className="text-xl font-bold">What else you should know</h2>
            <h2 className="text-xs font-regular text-slate-600">You can restore your X account if it was accidentally or wrongfully deactivated for up to 30 days after deactivation.</h2>
            <h2 className="text-xs font-regular text-slate-600">Some account information may still be available in search engines, such as Google or Bing. Learn more</h2>
            <h2 className="text-xs font-regular text-slate-600">If you just want to change your @username, you don’t need to deactivate your account — edit it in your settings.</h2>
            <h2 className="text-xs font-regular text-slate-600">To use your current @username or email address with a different X account, change them before you deactivate this account.</h2>
            <h2 className="text-xs font-regular text-slate-600">If you want to download your X data, you’ll need to complete both the request and download process before deactivating your account. Links to download your data cannot be sent to deactivated accounts.</h2>
        </div>
        <button 
        className="text-bold text-red-500 p-4 my-4 w-full hover:bg-rose-50"
        onClick={handleDeactivate}
        >
            Deactivate
        </button>
    </div>
  )
}

export default DeactivateAccount