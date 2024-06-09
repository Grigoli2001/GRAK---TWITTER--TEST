import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { TrendData } from '../components/Trend'

// icons
import { FaArrowLeftLong} from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";


const Trends = () => {

    const navigate = useNavigate()
    const handleBack = () => {
      navigate(-1)
    }

  
  return (

          <>
            <div className="sticky z-50 top-0 backdrop-blur-md bg-white/50">
              <div className="px-2 py-3">
      
                <div className='flex items-center gap-x-4 py-2'>
                  <Button onClick={handleBack} variant="icon" size="icon-sm" tooltip="Back" className="text-slate-500 hover:bg-slate-200/50">
                  <FaArrowLeftLong className='text-black'/>
                  </Button>


                    {/*  opens modal */}
                    <h3 className="font-bold text-xl">Trends</h3>
                    <Button variant='icon' size='icon-sm' tooltip="Settings" className="ml-auto text-black hover:bg-gray-300/50">
                        <FiSettings/>
                    </Button>
                </div>
      
              </div>
            </div>

            <div>
            <div>
                <h2 className='text-xl font-bold p-2'>Trends for you</h2>
                <TrendData />
            </div>
            </div>
            
            </>
                
        )}
      

export default Trends

