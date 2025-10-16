// Temporary file to avoid Vite cache errors
// This file will be deleted after restart

import { createContext } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  throw new Error('ModalContext is deprecated');
};

const ModalProvider = ({ children }) => {
  return children;
};

export default ModalProvider;
