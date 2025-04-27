import React from 'react';
import { ToastContainer as OriginalToastContainer, ToastContainerProps } from 'react-toastify';

const ToastContainer = (props: React.JSX.IntrinsicAttributes & ToastContainerProps & { children?: React.ReactNode | undefined; }) => {
  return (
    <OriginalToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      {...props} // Spread any additional props
    />
  );
};

export default ToastContainer;