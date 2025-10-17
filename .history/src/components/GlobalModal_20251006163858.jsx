import { useModal } from '../context/ModalContext';
import AuthModal from './AuthModal';

const GlobalModal = () => {
  const { authModalOpen, closeAuthModal } = useModal();

  return (
    <AuthModal 
      isOpen={authModalOpen} 
      onClose={closeAuthModal} 
    />
  );
};

export default GlobalModal;
