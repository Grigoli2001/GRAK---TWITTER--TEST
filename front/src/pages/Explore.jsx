import { TrendData } from '../components/Trend'
import SearchBar from '../components/SearchBar'
import { Button } from '../components/Button'
import { FiSettings } from "react-icons/fi";
import { NavLink } from 'react-router-dom';
import  Tweets  from '../components/tweet/Tweets'
import { useParams,useNavigate } from 'react-router-dom'
import { FaArrowLeftLong} from "react-icons/fa6";


/**
 * 
 * Explore Draft
 */
export const Explore = () => {
    
    return (
        <section>
            <div className='flex sticky items-center p-2 gap-4 top-0  bg-white/85 w-full z-[50] gap-y-2 border-b border-b-solid border-slate-200 backdrop-blur-md'>
                <SearchBar fetchResults={'/api'} className={'!my-auto'}/>
                <NavLink to='/settings'>
                    <Button variant='icon' size='icon-sm' tooltip="Settings" className="text-black hover:bg-gray-300/50">
                        <FiSettings/>
                    </Button>
                </NavLink>
            </div>
            <div>
                <TrendData />
            </div>

        </section>
  )
}

const ExploreTagsFallBack = () => {

    return (
      <div className="flex flex-col  mx-auto max-w-[300px] gap-y-4 p-4 text-justify">
          <h4 className='text-2xl font-bold'>No tags seem to match this search</h4>
          <p className='text-slate-500 '>Checkout the explore for more posts</p>
          <NavLink to="/explore" className="mt-4 self-center"> 
             <Button className=''>Explore</Button>
          </NavLink>
      </div>
  
    )
  
  }
  

export const ExploreTags = () => {
    const { tag } = useParams()
    const navigate = useNavigate()
    const handleBack = () => {
        navigate(-1)
      }

    return (

        <>
        <div className="sticky z-50 top-0 backdrop-blur-md bg-white/75">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>
                    <div>
                      <h3 className="font-bold text-xl">Explore more post about #{tag}</h3>
                    </div>
                </div>
      
              </div>
        </div>
            <div>
            <Tweets api={`tweets/explore/tags`} params={{ q: tag }} FallBackComponent={<ExploreTagsFallBack/>} />
            </div>

        </>
    )
}

