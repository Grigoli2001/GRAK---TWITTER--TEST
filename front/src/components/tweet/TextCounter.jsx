import React from 'react'

/**
 * TextCounter component which takes textCount and maxLength props
 * Displays textCount/maxLength
 */
const TextCounter = ({className, textCount, maxLength, ...props}) => {
  return (
    <span {...props} className={`text-xs text-slate-400 ${className}`}>{textCount}/{maxLength}</span>
  )
}

export default TextCounter