'use client';
import { createContext, useContext, useState } from 'react';
import Popup from '@/components/common/Popup';

const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const showPopup = (options) => {
    setPopup({
      ...popup,
      isOpen: true,
      ...options
    });
  };

  const closePopup = () => {
    setPopup({
      ...popup,
      isOpen: false
    });
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      <Popup {...popup} onClose={closePopup} />
    </PopupContext.Provider>
  );
}

export const usePopup = () => useContext(PopupContext);
