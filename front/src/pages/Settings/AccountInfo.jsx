import React, { useState } from 'react'

// components
import ConfirmPassword from '../../components/ConfirmPassword'

function AccountInfo(props) {
    const [authenticated, setAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

  return (
    <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
        >
        {authenticated ? (
            <div className="flex flex-col items-start justify-between p-4">
                <div className="flex items-center justify-center">
                    <h2 className="text-xl font-bold ml-4">{props.name}</h2>
                </div>
            </div>
        ) : 
        <ConfirmPassword includeWidgets={['heading','middle','button']} name="Account information" />
        }
    </div>
  )
}

export default AccountInfo