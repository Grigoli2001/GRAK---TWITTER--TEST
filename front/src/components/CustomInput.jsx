import TextCounter from './tweet/TextCounter'
import { cn } from '../utils/style'
import { TextareaAutosize } from '@mui/base/TextareaAutosize';


const CustomInput = ({name, handleUpdate, maxLength, value, placeholder, withTextCount, asTextArea}) => {
 const InputComponent = asTextArea ? TextareaAutosize : 'input'
  return (
    <div className='focus-within:border-twitter-blue border border-slate-300 relative flex items-center gap-2 rounded-md'>
        <InputComponent type='text' name={name} onChange={handleUpdate} maxLength={maxLength} {...(asTextArea && {minRows: 2, maxRows: 3})}
        value={value} className={cn("peer rounded-md outline-none border-none w-full h-full px-2 py-4 overflow-hidden",{
          "resize-none": asTextArea,
        })} />
        
        <span className={cn(`text-slate-600 text-base absolute pointer-events-none left-2
            peer-focus:scale-75 peer-focus:-translate-x-1 peer-focus:-translate-y-4 peer-focus:text-twitter-blue peer-focus:font-bold origin-top-left
            transition-all duration-200`,{
            "scale-75 -translate-x-1 -translate-y-4 text-twitter-blue font-bold":value?.length > 0
        }
        )}>
        { placeholder }
        </span>

        { withTextCount && <TextCounter textCount={value?.length} maxLength={maxLength} className={'absolute top-2 right-4'} /> }
        
    </div>
  )
}

export default CustomInput