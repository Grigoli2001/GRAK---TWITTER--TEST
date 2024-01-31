import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';

// components

function MonetizationSettings() {
    const [eligible, setEligible] = useState(false);

    return (
      <div className="hidden h-screen sticky top-0 border-l border-l-gray-200 border-r border-r-gray-200 flex-col min-w-[600px] md:flex md:flex-1"
          >
          <section className="w-full py-2">
            <section>
                <h1 className="font-bold text-2xl py-2 px-4">Monetization</h1>
            </section>
            <h1 className="font-bold text-l pt-4 px-4">Available Programs</h1>
            <h6 className="font-normal text-sm py-2 px-4 text-gray-500 whitespace-normal">Eligible creators can sign up for monthly subscriptions or receive their payout for ads revenue sharing</h6>
          </section>
          <section className='flex flex-col'>
            <section className='box-border py-4 px-4 h-32 rounded-2xl m-4 my-6 shadow-xl border-2'>
                {!eligible ? <h3 className="font-extrabold tracking-tight text-xs p-1 mb-2 rounded-md bg-back-pink w-fit text-white">Not yet eligible</h3>: ""}
                <h1 className="font-bold text-l my-2">Subscription</h1>
                <h6 className="font-normal text-sm text-gray-500 whitespace-normal">Earn a living on X by letting anyone subscribe to you for monthly content.</h6>
            </section>
            <section className='box-border px-4 py-4 h-32 rounded-2xl m-4 my-6 shadow-xl border-2'>
                {!eligible ? <h3 className="font-extrabold tracking-tight text-xs p-1 mb-2 rounded-md bg-back-pink w-fit text-white">Not yet eligible</h3>: ""}
                <h1 className="font-bold text-l my-1">Ads revenue sharing</h1>
                <h6 className="font-normal text-sm text-gray-500 whitespace-normal">Earn income from the ads served in the replies to your posts. To get paid out for ads revenue sharing, make sure you connect a Stripe account.</h6>
            </section>
        </section>
      </div>
    )
  }
  
  export default MonetizationSettings;