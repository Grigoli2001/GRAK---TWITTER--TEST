import * as React from 'react';
import { Modal } from '@mui/base/Modal';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/style'


export default function NavModal({backTo, children}) {
  const navigate = useNavigate()
  const handleBackClick = () => {
    navigate(backTo || -1)
  }
  return (
      <Modal
        open={true} // set open to true since route is already navigated to, and will handle the closing of the modal
        onClose={handleBackClick}
        slots={{ backdrop: Backdrop }}
        className='fixed z-[1000] inset-0 flex items-center justify-center'
      >
        <>
          {children}
          </>
      </Modal>
   
  );
}

const Backdrop = React.forwardRef(({ open, className, onClick, ownerState, ...other }, ref) => {
  // destructued ownerstate to avoid passing it directly as a prop to the backdrop
  return (
    <div
    style={{
        WebkitTapHighlightColor: 'transparent'
    }}
      className={cn('z-[-1] fixed inset-0 bg-black/75 ', { 'base-Backdrop-open backdrop-blur-sm': open }, className)}
      ref={ref}
      onClick={onClick}
      {...other}
    >
   
    </div>
  );
});



