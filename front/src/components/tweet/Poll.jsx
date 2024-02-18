import { forwardRef, useState, useContext, useEffect } from 'react'
import { FaPlus, FaMinus, FaCircleCheck } from "react-icons/fa6";
import OptionSelector from '../OptionSelector';
import { Button } from '../Button';
import { TweetContext } from './TweetCreate'
import CustomInput from '../CustomInput';
import { dayOptions, hourOptions, minuteOptions, timeAgo} from '../../utils/utils'
import { SocketContext } from '../../context/socketContext';
import { TWEET_ACTIONS } from './Tweet'
import { createToast } from '../../hooks/createToast';
import { quantityFormat } from '../../utils/utils';
import useUserContext from '../../hooks/useUserContext';


/**
 * Input For Poll 
 * TODO: clean this up
 */
const Choice = ({choice, choices, setChoices, handleAddChoice, handleRemoveChoice}) => {
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
      if (`choice-${choice.id}` === e.target.name) {
        choice.text = e.target.value
      }
      return choice
    }))

  }
  // Use State to manage styles? 
  return (

    <>

    <CustomInput name={`choice-${choice.id}`} handleUpdate={handleChoiceText} maxLength={choiceMaxLength} value={choice.text} placeholder={placeholderText} withTextCount={true} asTextArea={false} />

      <div className='flex items-center justify-start gap-2 px-4'>
          { ( choice.id > 1) && 
            <Button variant="icon" size="icon-sm" tooltip="Add Choice" onClick={handleAddChoice} disabled={choices.length >= 4 }>
              <FaPlus className="text-twitter-blue"/> 
            </Button>

           }
          { 
          
          ( choice.id > 2) &&  
          <Button variant="icon" size="icon-sm" tooltip="Remove Choice" className="text-red-500 hover:bg-red-200" onClick={() => handleRemoveChoice()}>
            <FaMinus/> 
          </Button>

            }
      </div>
      
    </>
  )
}

/**
 * Create a new poll component
 * @param {function} removePoll - function to remove poll from parent component
 * TODO add animation to choices
 */

export const PollCreate = ({removePoll}) => {

  const TC = useContext(TweetContext)
  // id is used to keep track of which choice is being updated
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
  
  const [duration, setduration] = useState({
    days: 1,
    hours: 1,
    minutes: 1
  })
  
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
  useEffect(() => {
    const validateAllChoices = () => {
      return choices.every((choice) => choice.text.length > 0)
    }
    TC.setTweetForm({
      ...TC.tweetForm, 
      tweetPoll: {
      choices: choices, 
      valid: validateAllChoices(),
      duration: duration
    }})

  }, [choices])

  return (
    <div className='flex flex-col border border-slate-200 rounded-lg [&>*]:p-2 my-2 overflow-hidden'>
          <div className="grid grid-cols-[1fr_auto] gap-y-2">
              {
                choices.map((choice, index) => {
                  return <Choice key={index} choice={choice} choices={choices} setChoices={setChoices} handleAddChoice={handleAddChoice} handleRemoveChoice={handleRemoveChoice} />
                })
              }
          </div>



      <div className='border-y border-y-slate-200'>
        <span className='text-slate-600 text-sm'>Poll length</span>
        <div className='flex items-center justify-evenly gap-x-2 '>
          <OptionSelector title={'Days'} options={dayOptions} defaultValue={duration.days} onChange={(e, newVal) => {setduration(prev => ({...prev, days: newVal}))}} />
          <OptionSelector title={'Hours'} options={hourOptions} defaultValue={duration.hours} onChange={(e, newVal) => setduration(prev => ({...prev, hours: newVal}))}/>
          <OptionSelector title={'Minutes'} options={minuteOptions} defaultValue={duration.minutes} onChange={(e, newVal) => setduration(prev => ({...prev, minutes: newVal}))}/>
        </div>

      </div>

      <div onClick={() => removePoll()} className="flex items-center justify-center hover:bg-red-200 text-red-500 cursor-pointer">
        Remove Poll 
      </div>
      
    </div>
  )
}

export const TweetPoll = forwardRef(({postState, dispatch, ...props}, ref) => {

  const { socket } = useContext(SocketContext)
  const { user } = useUserContext()


  useEffect(() => {

    socket.emit('tweet:poll:join-room', {
      room: postState?._id,
    })

   }, [socket])

  const pollEndDate = new Date(postState.poll.poll_end)

  useEffect(() => {
    const handleLivePollVote = (data) => {
      console.log('tweet:poll:handle-live-vote', data)
      if (data.error) {
        createToast('An error occured while voting', 'error', 'error-vote-poll', {limit: 1})
        return
      } 

       dispatch({type: TWEET_ACTIONS.UPDATE_POLL, payload: {...data, iscurrentuser: data.voterId === user.id,}})
    }

    socket.on('tweet:poll:handle-live-vote', handleLivePollVote)
    return () => {
      socket.off('tweet:poll:handle-live-vote', handleLivePollVote)
    }

  }, [socket, postState?.poll?.votes])

  const handlePollVote = (e, optionId) => {
    e.stopPropagation()
    socket.emit('tweet:poll:vote', {
      room: postState?._id,
      option: optionId,
      userId: user.id
    })
  }

  return (
    <>
      {postState.poll.options ? (
        <>
          {!postState.userVoted && new Date() < pollEndDate ? (
            postState?.poll?.options?.map((option, index) => (
              <div key={index} onClick={(e) => handlePollVote(e, option.id)} className='flex items-center justify-center w-full rounded-full gap-2 border border-twitter-blue text-twitter-blue py-1 hover:bg-twitter-blue/30 cursor-pointer peer-checked:bg-twitter-blue/70'>
                <p>{option.text}</p>
              </div>
            ))
          ) : (
            <>
              {postState?.poll?.options?.map((option, index) => (
                <div key={index} className='flex items-center justify-between w-full gap-2 rounded-md border relative overflow-hidden py-1'>
                  <p className='ml-2'>{option.text}</p>
                  {postState.userVoted?.pollOption === option.id && <FaCircleCheck className='text-twitter-blue' />}
                  <p className='ml-auto mr-2'>{option.votes}</p>
                  <div id="poll-indicator" className='h-[90%] bg-gray-300 min-w-1 rounded-2xl absolute opacity-40 animate-[width]' style={{ width: `${(option.votes / postState.totalVotes) * 100}%` }}></div>
                </div>
              ))}
            </>
          )}
  
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-400'>{quantityFormat(postState.totalVotes)} vote{postState.totalVotes != 1 && 's'}</span>
            <span className='text-sm text-slate-400'>{new Date() < pollEndDate ? `${timeAgo(new Date(), postState.poll.poll_end)} left` : 'Final Results'}</span>
          </div>
        </>
      ) : (
        <div className='flex items-center justify-center gap-2'>
          <p className='text-slate-400'>There was an error loading this poll</p>
        </div>
      )}
    </>
  );
  })  