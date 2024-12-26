import { Modal, ModalBody, ModalContent, ModalOverlay, Spinner, Text } from '@chakra-ui/react';
interface LoadingModalProps { 
  isOpen: boolean;
  message: string;
  subMessage?: string;
}

const LoadingModal = ({ isOpen, message, subMessage }: LoadingModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={() => { }} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody textAlign="center" py={10}>
          <Spinner size="xl" mb={4} />
          <Text fontSize="lg" fontWeight="bold">
            {message}
          </Text>
          {subMessage && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              {subMessage}
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default LoadingModal;