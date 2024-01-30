import { forwardRef, useState, useContext, useEffect } from 'react'
import { FaPlus, FaMinus } from "react-icons/fa6";
import OptionSelector from '../OptionSelector';
import { Button } from '../Button';
import  TextCounter from './TextCounter';
import { TweetContext } from './TweetCreate'

/**
 * Input For Poll 
 * TODO: clean this up
 */
const Choice = forwardRef(({choice, choices,setChoices, handleAddChoice, handleRemoveChoice}, ref) => {
  const choiceMaxLength = 25

  const placeholderText = `Choice ${choice.id} ${choice.id > 2  ? '(optional)' : ''}`

  const handleChoiceText = (e) => {
    // maintain max length of choice text
    if (e.target.value.length > choiceMaxLength) {
      e.target.value = e.target.value.slice(0, choiceMaxLength);
      return
    }

    // set text of a choice
    setChoices(choices.map((choice) => {
      if (choice.id === e.target.dataset.id) {
        choice.text = e.target.value
      }
      return choice
    }))

  }
  // Use State to manage styles? 
  return (

    <>
      <div className='focus-within:border-twitter-blue border border-slate-300 relative flex items-center gap-2 rounded-md'>
        
        <input type='text' data-id={choice.id} onChange={handleChoiceText} maxLength={choiceMaxLength} required className="peer rounded-md outline-none border-none w-full h-full px-2 py-4 overflow-hidden"/>
        
        <span className='text-slate-600 text-base absolute pointer-events-none left-2
        peer-focus:scale-75 peer-focus:-translate-x-1 peer-focus:-translate-y-4 peer-focus:text-twitter-blue peer-focus:font-bold origin-top-left
        peer-valid:scale-75 peer-valid:-translate-x-1 peer-valid:-translate-y-4 peer-valid:text-twitter-blue peer-valid:font-bold 
        transition-all duration-200'>
          {placeholderText}
        </span>

        <TextCounter textCount={choice.text.length} maxLength={choiceMaxLength} className={'absolute top-2 right-4'} />
        
      </div>

      <div className='flex items-center justify-start gap-2 px-4'>
          { ( choice.id > 1) && 
            <Button variant="icon" size="icon-sm" onClick={() => handleAddChoice()} disabled={choices.length >= 4}>
              <FaPlus className="text-twitter-blue"/> 
            </Button>

           }
          { 
          
          ( choice.id > 2) &&  
          <Button variant="icon" size="icon-sm" className="text-red-500 hover:bg-red-200" onClick={() => handleRemoveChoice()}>
            <FaMinus/> 
          </Button>

            }
      </div>
      
    </>
  )
})

/**
 * Create a new poll component
 * @param {function} removePoll - function to remove poll from parent component
 * TODO add animation to choiches
 */

export const PollCreate = ({removePoll}) => {

  const TC = useContext(TweetContext)

  const dayOptions = Array.from(Array(7), (_, i) => i+1)
  const hourOptions = Array.from(Array(23), (_, i) => i+1)
  const minuteOptions = Array.from(Array(59), (_, i) => i+1)
  const [choices, setChoices] = useState([
        {
          id: 1,
          text: ''
        }, 
        {
          id: 2,
          text: ''
        }
        
    ])
  
  // adds a choice to the choices array
  const handleAddChoice = () => {
    if (choices.length >= 4 ){
      return
    }
    setChoices([...choices, {id: choices.length + 1, text: ''}])
  }

  // removes a choice from the choices array
  const handleRemoveChoice = () => {
    if (choices.length <= 2 ){
      return
    }
    setChoices(choices.slice(0, -1))
  }

  // checks to see if all choices have text
  

  // TODO: these work for now but need to be refactored
  useEffect(() => {
    const validateAllChoices = () => {
      return choices.every((choice) => choice.text.length > 0)
    }
    TC.setTweetForm({...TC.tweetForm, tweetPoll: {choices: choices, valid: validateAllChoices()}})

  }, [choices])



  return (
    <div className='flex flex-col border border-slate-200 rounded-lg [&>*]:p-2 my-2 overflow-hidden'>
          <div className="grid grid-cols-[1fr_auto] gap-y-2">
              {
                choices.map((choice, index) => {
                  return <Choice key={index} choice={choice} choices={choices} setChoices={setChoices}  handleAddChoice={handleAddChoice} handleRemoveChoice={handleRemoveChoice} />
                })
              }
          </div>



      <div className='border-y border-y-slate-200'>
        <span className='text-slate-600 text-sm'>Poll length</span>
        <div className='flex items-center justify-evenly gap-x-2 '>
          <OptionSelector title={'Days'} options={dayOptions} />
          <OptionSelector title={'Hours'} options={hourOptions}/>
          <OptionSelector title={'Minutes'} options={minuteOptions}/>
        </div>

      </div>

      <div onClick={() => removePoll()} className="flex items-center justify-center hover:bg-red-200 text-red-500 cursor-pointer">
        Remove Poll 
      </div>
      
    </div>
  )
}

/**
 * TODO: Poll Results Component to render within a tweet
 * Not sure what this looks like yet
 */
export const PollResults = () => {
  return (
    <div>Poll Res</div>
  )
}

