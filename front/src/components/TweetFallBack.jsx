import React from "react";
import { Button } from "./Button";

const TweetFallBack = () => {
    return (
        <div className="flex flex-col  mx-auto max-w-[300px] gap-y-6 p-4 text-justify">
            <h4 className='text-4xl font-bold'>Welcome to X</h4>
            <p className='text-slate-500 '>This is the best place to see what's happening in your world. Find some people and topics to follow now.</p>
            <Button className='mt-4 self-center'>Let's go</Button>
        </div>
    );
};

export default TweetFallBack;