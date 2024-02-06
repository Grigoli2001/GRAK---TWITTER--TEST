import { useRef, useState } from 'react';
import { GoSearch } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import { UserBlock } from './User';
import { cn } from '../utils/style';

// test
import { tags, users } from '../constants/feedTest';

/**
 * Template for search bar
 * TODO: add search functionality from api or from client data
 * TODO: add search results component
 */

const SearchBar = ({fetchResults, resultComponent, className}) => {

    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const searchContaner = useRef(null)

    // show as boolean
    const handleShowResults = (show) => {
        show ? searchContaner.current.classList.remove('hidden') : searchContaner.current.classList.add('hidden')
    }

    const searchByTag = (value) => value.startsWith('#');
    const searchByUser = (value) => value.startsWith('@');

    const filterTags = (tags, value) => {
        const trimmedValue = value.slice(1).toLowerCase().trim();
     return tags.filter((tag) => tag.toLowerCase().includes(trimmedValue)).map((tag,  index, array) => ({type:'tag', value: tag, isLast: index === array.length - 1}));
    };

    const filterUsers = (users, value) => {
        const trimmedValue = value.slice(1).toLowerCase();
        return users.filter((user) =>
                user.username?.toLowerCase().includes(trimmedValue) ||user.name?.toLowerCase().includes(trimmedValue) )
                .map((user) => ({type:'user', value: user}));
    };

    const searchResults = (users, tags, value) => {
    let results = [];

    if (searchByTag(value)) {
        results = filterTags(tags, value);
    } else if (searchByUser(value)) {
        results = filterUsers(users, value);
    } else {
        const userResults = filterUsers(users, value);
        const tagResults = filterTags(tags, value);
        results = [...tagResults, ...userResults, ];
    }

    setResults(results);
};

    const handleSearch = (e) => {

        // fetchResults(e.target.value, api)
        let value = e.target.value.trim()
        setSearch(value)
        if (value.length < 3)  {
            handleShowResults(false)
            setResults([])
            return 
        }

        // test
       

// Usage
        searchResults(users, tags, value);

        // show results
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
        placeholder="Search"
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

                        result.type === 'user' ?
                            <UserBlock key={index} user={result.value} withNav={true}/>
                        :
                             <div key={index} 
                             className={cn('flex  items-center gap-4 p-4 text-black border-gray-200 border-solid font-bold hover:bg-slate-200/50 cursor-pointer',{
                                        'border-b': result.isLast
                                    })}>

                                <FaSearch className="text-2xl" />
                                <span>{result.value}{result.isLast}</span>
                            </div>
                        )
                    })

                : null
            }
    
        </div>

    </div>
  )
}

export default SearchBar