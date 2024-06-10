import { forwardRef , useRef } from 'react';
import { Select as BaseSelect } from '@mui/base/Select';
import { Option as BaseOption } from '@mui/base/Option';
import clsx from 'clsx';
import { CssTransition } from '@mui/base/Transitions';
import { PiCaretDown } from "react-icons/pi";

/**
 * Custom Select component which takes title and options props
 * @props title: string
 * @props options: string[]
 * TODO: use array of objects for options with display and value keys
 * Extends material-ui Select and Option component
 */
export default function OptionSelector({title, options, defaultValue,...props}) {

  const selectRef = useRef(null)
  // console.log('rendering OptionSelector')

  return (
      
      <Select {...props} title={title} defaultValue={defaultValue } className={'flex'} ref={selectRef}>
        {
          options?.map((option, index) => {
            return (
              <Option key={index} data-value={option} value={option}>{option}</Option>
            )
          })
        }
      </Select>
  );
}

const getOptionColorClasses = ({ selected, highlighted, disabled }) => {
  let classes = '';
  if (disabled) {
    classes += 'text-slate-400 dark:text-slate-700';
  } 
  else {
    if (selected) {
      classes +=
        ' bg-blue-100 dark:bg-blue-950 text-blue-950 dark:text-blue-50';
    } else if (highlighted) {
      classes +=
        ' bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300';
    }

    classes +=
      ' hover:dark:bg-slate-800 hover:bg-slate-100 hover:dark:text-slate-300 hover:text-slate-900';
    classes +=
      ' focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:dark:outline-blue-300';
  }
  return classes;
};

const Option = forwardRef((props, ref) => {
  return (
    <BaseOption
      ref={ref}
      {...props}
      slotProps={{
        root: ({ selected, highlighted, disabled }) => ({
          className: `list-none p-2 rounded-lg cursor-default last-of-type:border-b-0 ${getOptionColorClasses(
            { selected, highlighted, disabled },
          )}`,
        }),
      }}
    />
  );
});

const OptionButton = forwardRef(({ownerState, className, title, children, ...props}, ref) => {
  return (
    <button type="button" {...props} className={`${className}`} ref={ref}>
      <span className='text-xs group-[.open]:text-twitter-blue group-focus:text-twitter-blue'>{ title }</span>
      <div className={`flex justify-between w-full gap-3`}>
        {children}
        <PiCaretDown/>
      </div>
    </button>
  );
});


const AnimatedListbox = forwardRef(({ ownerState, className, ...props }, ref) => {

  return (
    <CssTransition
      className={`placement-top`}
      enterClassName="open"
      exitClassName="closed"
    >
      <ul {...props} className={`${className} max-h-[300px] no-scrollbar overflow-y-auto`} ref={ref} />
    </CssTransition>
  );
});


const resolveSlotProps = (fn, args) => (typeof fn === 'function' ? fn(args) : fn);

const Select = forwardRef((props, ref) => {

  return (
    <BaseSelect
      ref={ref}

      {...props}
      
      slots={{
        root: OptionButton,
        listbox: AnimatedListbox,
        ...props.slots,
      }}

      className={clsx('CustomSelect', props.className)}

      slotProps={{
        ...props.slotProps,
        root: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.root,
            ownerState,
          );

          return {
            ...resolvedSlotProps,
            className: clsx(
              `relative group text-lg font-sans flex-1 flex flex-col gap-2 px-3 py-2 text-left bg-white focus:ring-2 focus:ring-twitter-blue focus:border-twitter-blue dark:bg-neutral-900 border border-solid border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-300 transition-all hover:bg-slate-50 dark:hover:bg-neutral-800 outline-0 shadow-md shadow-slate-100 dark:shadow-slate-900 ${
                (ownerState.open || ownerState.focusVisible || ownerState.active)
                  ? 'ring-2 ring-twitter-blue border-twitter-blue dark:border-blue-500 open'
                  : ''
              } [&>svg]:text-base [&>svg]:h-full`,
              resolvedSlotProps?.className,
            ),
          };
        },

        listbox: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.listbox,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx(
              `text-sm z-[1000] font-sans relative p-1.5 my-3 w-full rounded-xl overflow-auto outline-0 bg-white dark:bg-slate-900 border border-solid border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 shadow shadow-slate-200 dark:shadow-slate-900 [.open_&]:opacity-100 [.open_&]:scale-100 transition-[opacity,transform] [.closed_&]:opacity-0 [.closed_&]:scale-90 [.placement-top_&]:origin-bottom [.placement-bottom_&]:origin-top`,
              resolvedSlotProps?.className,
            ),
          };
        },

        popup: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.popup,
            ownerState,
          );

          return {
            ...resolvedSlotProps,
            className: clsx(
              `z-[1000] max-h-[300px] min-w-20`,
              resolvedSlotProps?.className,
            ),
            style: {
              ...resolvedSlotProps?.style,
              width: `${ref.current?.clientWidth}px`,
            },
            placement: 'bottom',
          };
        },
      }}
    >{props.children}</BaseSelect>
  );
});

