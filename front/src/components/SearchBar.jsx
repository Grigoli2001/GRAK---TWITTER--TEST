import { useRef, useState } from 'react';
import { GoSearch } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import { UserBlock } from './User';
import { cn } from '../utils/style';

// test
import { tags, users } from '../constants/feedTest';
import instance from '../constants/axios';
import { Link } from 'react-router-dom';

/**
 * Template for search bar
 * TODO: add search functionality from api or from client data
 * TODO: add search results component
 */

const SearchBar = ({fetchResults, resultComponent, className, ...props}) => {

    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const searchContaner = useRef(null)

    // show as boolean
    const handleShowResults = (show) => {
        show ? searchContaner.current.classList.remove('hidden') : searchContaner.current.classList.add('hidden')
    }
    
    const handleSearch = (e) => {

        let value = e.target.value.trim()
        setSearch(value)
        if (value.length < 2)  {
            handleShowResults(false)
            setResults([])
            return 
        }
        instance.post('/user/search', {search: value}).then((res) => {
            console.log(res.data.users)
            setResults(res.data.users)
        }).catch((err) => {
            console.log(err)
        })

        handleShowResults(true)
    }

  return (
    // TODO use cn for twMerge and clsx
    <div className={`focus-within:border-slate-500 w-full flex items-center justify-start rounded-full border border-transparent py-2 px-4  mt-1 mb-4 relative bg-slate-100 ${className ?? ''}`}>
        <GoSearch className="text-slate-600" />
        
        <input
        onChange={handleSearch}
        autoComplete="off"
        name="search"
        placeholder={props.placeholder ?? 'Search'}
        className="border-none outline-none bg-transparent w-full pl-4 pr-2 placeholder:text-gray-600"
        />
    
        <div 
        ref={searchContaner} 
        onClick={() => handleShowResults(false)}
        className="absolute top-[100%] left-0 w-full z-10 bg-white rounded-lg shadow-all-round overflow-x-hidden overflow-y-auto max-h-[60vh] mt-[2px] 
        ">
            {
            
                (results?.length > 0) ?
                    results.map((result, index) => {
                        return(
                            <Link to={`/${result.username}`} key={index} className="block">
                            <UserBlock key={index} user={result} withNav={'/'}/>
                            </Link>
                        )
                    })

                : null
            }
    
        </div>

    </div>
  )
}

export default SearchBar