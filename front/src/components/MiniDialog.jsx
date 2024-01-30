import {forwardRef, useRef, useContext, createContext} from 'react'
import { ClickAwayListener } from '@mui/base/ClickAwayListener'

/**
 * MiniDialog component which takes variant and size props
 * Component for popups within an element
 * Usage: MiniDialog -> Wrapper -> Dialog
 * Wrapper - must hold ref: see caveat of mui/base
 *         - default class relative for absolute positioning of Dialog
 * Dialog - any popup content styled with tailwind
 *        - auto closes with ClickAwayListener
 * Context is used to pass ref to Dialog to contain within Component
 */
const DialogContext = createContext(null)

const MiniDialog = ({ children}) => {

    const dialogRef = useRef(null);

    return (
            <DialogContext.Provider value={{dialogRef}}>
                <ClickAwayListener  onClickAway={() => dialogRef.current?.close()}>
                    {children}
                </ClickAwayListener>
            </DialogContext.Provider>
    )
}
const Dialog = ({children, className}) => {
    const { dialogRef } = useContext(DialogContext)
    return (
        <dialog ref={dialogRef} className={className} >
            {children}
        </dialog>
    )
}

const Wrapper = forwardRef(({children, className}, ref) => {
    const {dialogRef} = useContext(DialogContext)
    return (
    <div ref={ref} onClick={()=>{dialogRef.current?.open ?  dialogRef.current?.close() : dialogRef.current?.show()}} className={`relative ${className}`}>
        {children}
    </div>
    )
})

// assign to minidialog after to avoid error
// React Hook "useContext" is called in function "MiniDialog.Dialog" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use
MiniDialog.Dialog = Dialog
MiniDialog.Wrapper = Wrapper

export default MiniDialog 