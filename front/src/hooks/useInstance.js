import { useState, useEffect, useRef } from 'react'
import instance from '../constants/axios'

// options {
//     page: Number
//     limit: Number
//     headers: Object
//     afterRequest: Callback
// }

export default function useInstance(url, options = {}) {
    const { page, limit, headers, afterRequest, params } = options
    
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [hasLoaded, setHasLoaded] = useState(false)   
    const [error, setError] = useState(false)
    const [ hasMore, setHasMore] = useState(false)
    const loadingTimeoutRef = useRef(null)

    useEffect(() => {
        clearTimeout(loadingTimeoutRef?.current)
        loadingTimeoutRef.current = setTimeout(() => {
            setLoading(true)
        }, 1000)
        setError(false)
        
        instance.get(url, {
            headers: headers,
            params: {
            page: page,
            limit: limit,
            ...params
            }
        })
        .then(res => {
            
            setData(res.data)
            setHasMore(res.data.length > 0)
            if (afterRequest) afterRequest()
        })
        .catch (err => setError(err))
        .finally(() => {
            clearTimeout(loadingTimeoutRef.current)
            setLoading(false)
            setHasLoaded(true)
        })

  }, [url, page, limit])

  return { data, setData,  loading, setLoading,hasLoaded, error, hasMore }

}