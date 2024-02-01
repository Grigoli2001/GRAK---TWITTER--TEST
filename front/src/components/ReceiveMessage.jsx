import React from 'react'

const ReceiveMessage = ({ message, isLastMessage }) => {
    return (
        <div className={`mr-auto ${isLastMessage ? 'last-message': ''}`}>
        <div
      className='msgReceive bg-gray-100 rounded-[24px] py-[12px] px-[16px] w-fit mr-auto'
      style={{ maxWidth: '375px', maxHeight: '100%', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}
    >
        {message}
    </div>
    <p className='text-[13px] hidden text-gray opacity-50 text-right'>Yesterday, 12:00pm</p>
    </div>
    )
}

export default ReceiveMessage