// src/components/ErrorModal.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Center,
} from "@chakra-ui/react";
import { WarningIcon, InfoIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageKey: string;
  buttons?: Array<{
    labelKey: string;
    onClick: () => void;
    colorType?: "confirm" | "cancel";
  }>;
  iconType?: "warning" | "error" | "info";
}

const ErrorModal = ({ isOpen, onClose, messageKey, buttons, iconType }: ErrorModalProps) => {
  const { t } = useTranslation();
  const [isSigning, setIsSigning] = useState(false);

  // 기본 버튼 설정 추가
  const defaultButtons = buttons || [{
    labelKey: 'general.close',
    onClick: onClose,
    colorType: 'cancel'
  }];

  // 모달이 닫힐 때 로딩 상태를 초기화
  useEffect(() => {
    if (!isOpen) {
      setIsSigning(false);
    }
  }, [isOpen]);

  // 아이콘 타입에 따라 아이콘 선택
  const renderIcon = () => {
    switch (iconType) {
      case "warning":
        return <WarningIcon boxSize={16} color="yellow.500" />;
      case "error":
        return <WarningTwoIcon boxSize={16} color="red.500" />;
      case "info":
      default:
        return <InfoIcon boxSize={16} color="blue.500" />;
    }
  };

  const handleButtonClick = async (onClick: () => void, colorType?: string) => {
    if (colorType === "confirm") {
      setIsSigning(true);
      try {
        await onClick();
      } finally {
        setIsSigning(false);
        onClose(); // 버튼 클릭 후 모달 닫기
      }
    } else {
      onClick();
      onClose(); // 버튼 클릭 후 모달 닫기
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <Center mt={6}>{renderIcon()}</Center>
        <ModalBody textAlign="center" mt={4}>
          <Text fontSize="lg" color="gray.700">
            {t(messageKey)}
          </Text>
        </ModalBody>
        <ModalFooter display="flex" flexDirection="column" gap={2} w="100%" mt={4} mb={6}>
          {defaultButtons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button.onClick, button.colorType)}
              w="100%"
              colorScheme={button.colorType === "confirm" ? "green" : "red"}
              variant="solid"
              isLoading={button.colorType === "confirm" && isSigning}
              loadingText={t('auth.signingMessage')}
              spinnerPlacement="start"
            >
              {!isSigning || button.colorType !== "confirm" ? t(button.labelKey) : ""}
            </Button>
          ))}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ErrorModal;
