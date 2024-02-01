import React from 'react';

const SendMessage = ({ message, isLastMessage }) => {
  return (
    < div className={`ml-auto ${isLastMessage ? 'last-message': ''}`}>
    <div
      className='msgSend bg-twitter-blue rounded-[24px] py-[12px] w-fit px-[16px] text-white ml-auto'
      style={{ maxWidth: '375px', maxHeight: '100%', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}
    >
      {message}
    </div>
        <p className='text-[13px] hidden text-gray opacity-50 text-right'>October 13th, 2023, 12:00pm</p>
    </div>
  );
};

export default SendMessage;
