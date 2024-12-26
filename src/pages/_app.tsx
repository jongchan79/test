// src/pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { useAbiStore } from '../store/useAbiStore';
import { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import TopMenu from '../components/TopMenu';
import BottomMenu from '../components/BottomMenu';
import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import '../i18n';
import Head from 'next/head';
import { useEffect, useState, createContext } from 'react';
import { WalletProvider } from '../providers/WalletProvider';
import { NetworkSwitcher } from '../components/NetworkSwitcher';
import ErrorModal from '../components/ErrorModal';
import LoadingModal from '../components/LoadingModal';
import GoogleAnalytics from '../components/GoogleAnalytics';

interface ErrorButton {
  labelKey: string;
  onClick: () => void;
  colorType?: "confirm" | "cancel";
}

interface ErrorModalState {
  isOpen: boolean;
  messageKey: string;
  buttons: ErrorButton[];
  iconType: "warning" | "error" | "info";
}

interface ErrorModalContextType {
  showErrorModal: (
    messageKey: string,
    buttons?: ErrorButton[],
    iconType?: "warning" | "error" | "info"
  ) => void;
  hideErrorModal: () => void;
}

interface LoadingModalState {
  isOpen: boolean;
  message: string;
  subMessage?: string;
}

interface LoadingModalContextType {
  showLoadingModal: (message: string, subMessage?: string) => void;
  hideLoadingModal: () => void;
}

export const ErrorModalContext = createContext<ErrorModalContextType>({
  showErrorModal: (_messageKey: string, _buttons?: ErrorButton[], _iconType?: "warning" | "error" | "info") => {
    console.warn('ErrorModalContext not implemented');
  },
  hideErrorModal: () => {
    console.warn('ErrorModalContext not implemented');
  },
});

export const LoadingModalContext = createContext<LoadingModalContextType>({
  showLoadingModal: (_message: string, _subMessage?: string) => {
    console.warn('LoadingModalContext not implemented');
  },
  hideLoadingModal: () => {
    console.warn('LoadingModalContext not implemented');
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const loadAbi = useAbiStore((state) => state.loadAbi);
  const [errorModalState, setErrorModalState] = useState<ErrorModalState>({
    isOpen: false,
    messageKey: '',
    buttons: [],
    iconType: 'info',
  });
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>({
    isOpen: false,
    message: '',
  });

  const showErrorModal = (
    messageKey: string, 
    buttons?: ErrorButton[], 
    iconType?: "warning" | "error" | "info"
  ) => {
    setErrorModalState({ isOpen: true, messageKey, buttons: buttons || [], iconType: iconType || 'info'});
  };

  const hideErrorModal = () => {
    setErrorModalState(prev => ({ ...prev, isOpen: false }));
  };

  const showLoadingModal = (message: string, subMessage?: string) => {
    setLoadingModalState({ isOpen: true, message, subMessage });
  };

  const hideLoadingModal = () => {
    setLoadingModalState(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    loadAbi();
  }, [loadAbi]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>GFEX</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ChakraProvider>
        <ErrorModalContext.Provider value={{ showErrorModal, hideErrorModal }}>
          <LoadingModalContext.Provider value={{ showLoadingModal, hideLoadingModal }}>
            <WalletProvider>
              <NetworkSwitcher />
              <TopMenu />
              <Component {...pageProps} />
              <BottomMenu />
              <ErrorModal
                isOpen={errorModalState.isOpen}
                messageKey={errorModalState.messageKey}
                buttons={errorModalState.buttons}
                iconType={errorModalState.iconType}
                onClose={hideErrorModal}
              />
              <LoadingModal {...loadingModalState} />
            </WalletProvider>
          </LoadingModalContext.Provider>
        </ErrorModalContext.Provider>
      </ChakraProvider>

      <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID!} />
    </>
  );
}

export default appWithTranslation(MyApp);
