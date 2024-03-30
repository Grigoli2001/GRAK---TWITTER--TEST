import { useRef, useState } from 'react';
import { GoSearch } from "react-icons/go";
import { UserBlock } from './User';
import useDebounce from '../hooks/useDebounce';
import ReactLoading from 'react-loading'
import { requests, tweetRequests } from '../constants/requests';
import instance from '../constants/axios';
import { Link } from 'react-router-dom';

// forceMode either 'users' or 'tags'

const SearchBar = ({fetchResults, className, forceMode, withNavTo, ...props}) => {

    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [searchMode, setSearchMode] = useState('users')
    const searchContainer = useRef(null)
    const [loading,setLoading] = useState(false)
    const  timeoutRef = useRef(null)
    // show as boolean
    const handleShowResults = (show) => {
        show ? searchContainer.current.classList.remove('hidden') : searchContainer.current.classList.add('hidden')
    }
    
    const handleSearch = () => {

        if (search.length < 2)  {
            handleShowResults(false)
            setResults([])
            return 
        }
        clearTimeout(timeoutRef?.current)
        timeoutRef.current = setTimeout(() => {
            setLoading(true)
            
        }, 1000)
        let api ;
        let value = search.trim()
        if (search[0] === '#' && forceMode !== 'users') {
            setSearchMode('tags')
            api = tweetRequests.searchTags
            value = value.slice(1)
        
        }
        else  if (forceMode !== 'tags') {
            setSearchMode('users')
            api = requests.getUsers
            value = search

        }
        instance.get(api, {
            params: {
                q: value
            }
        }).then((res) => {
            if (api === tweetRequests.searchTags){
              console.log(res.data?.tags?.tags, 'tags in search bar')
                setResults(res.data?.tags.tags)
                return 
            }
            setResults(res.data.users)
        }).catch((err) => {
            console.error(err)
        })
        .finally(() => {
            clearTimeout(timeoutRef.current)
            setLoading(false)
        })

        handleShowResults(true)
    }

    useDebounce(handleSearch, [search], 1000)


    return (
        <div className={`focus-within:border-slate-500 w-full flex items-center justify-start rounded-full border border-transparent py-2 px-4 mt-1 mb-4 relative bg-slate-100 ${className ?? ''}`}>
        <GoSearch className="text-slate-600" />
        
        <input
          onChange={(e) => setSearch(e.target.value.trim())}
          autoComplete="off"
          name="search"
          placeholder={props.placeholder ?? 'Search'}
          className="border-none outline-none bg-transparent w-full pl-4 pr-2 placeholder:text-gray-600"
        />
      
        <div 
          ref={searchContainer} 
          onClick={() => handleShowResults(false)}
          className="absolute hidden top-[100%] left-0 w-full z-10 bg-white rounded-lg shadow-all-round overflow-x-hidden overflow-y-auto max-h-[60vh] mt-[2px]">
          
          {loading ? (
            <div className='flex justify-center items-center w-full h-full p-4'>
              <ReactLoading type='spin' color='#1da1f2' height={30} width={30}/>
            </div>
          ) : 
          
            (
            searchMode === 'users' ? 
              (results?.length > 0) ?
                results.map((result, index) => (
                  <Link to={`/${result.username}`} key={index} className="block">
                    <UserBlock key={index} user={result} withNavTo={withNavTo ?? '/'}/>
                  </Link>
                ))
                :
                <div className='flex justify-center items-center w-full h-full p-4'>
                    <span>No users found </span>
                </div>

              : (results?.length > 0) ?
                results.map((result, index) => (
                  <Link to={`/explore/${result}`} key={index} className="flex items-center w-full h-full p-4 text-blue-400 font-bold">
                    <span>#{result}</span>
                  </Link>
                ))
                :
                <div className='flex justify-center items-center w-full h-full p-4'>
                    <span>No tags found </span>
                </div>
          )}
        </div>
      </div>
    );
  }

export default SearchBar