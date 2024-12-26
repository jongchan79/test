import { useEffect, useCallback, useRef, useContext } from 'react';
import {
  useAccount,
  useDisconnect,
  useSignMessage,
  useChainId,
  useSwitchChain,
  useBalance,
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuthStore } from '../store/useAuthStore';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  VStack,
  HStack,
  Text,
  Divider,
  Box,
} from '@chakra-ui/react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { SiBinance, SiTether } from 'react-icons/si';
import { ErrorModalContext, LoadingModalContext } from '../pages/_app';
import { useNetworkStore } from '../store/useNetworkStore';
import { logEvent } from '../utils/analytics';

interface LoginButtonProps {
  fullWidth?: boolean;
  onMenuClose?: () => void;
}

const LoginButton = ({ fullWidth, onMenuClose }: LoginButtonProps) => {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const { token, setToken, setWalletAddress, disconnectWallet } =
    useAuthStore();
  const { targetNetwork } = useNetworkStore();
  const { showLoadingModal, hideLoadingModal } =
    useContext(LoadingModalContext);
  const { showErrorModal } = useContext(ErrorModalContext);
  const signatureProcessRef = useRef<Promise<void> | null>(null);
  const isSigningRef = useRef(false);

  const handleError = useCallback(
    (messageKey: string) => {
      showErrorModal(messageKey, [
        {
          labelKey: 'general.confirm',
          onClick: () => {},
          colorType: 'confirm',
        },
      ]);
    },
    [showErrorModal]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      console.log('Connector:', connector);
      if (connector && typeof connector.getChainId === 'function') {
        const chainId = await connector.getChainId();
        console.log('Current Chain ID:', chainId);
      }

      if (connector && typeof connector.disconnect === 'function') {
        await connector.disconnect();
      }
      await disconnectAsync();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    disconnectWallet();
    signatureProcessRef.current = null;
  }, [disconnectAsync, disconnectWallet, connector]);

  const checkAndSwitchNetwork = useCallback(async () => {
    if (chainId !== targetNetwork.id) {
      try {
        showLoadingModal(
          'Switching network...',
          'Please confirm the network switch in your wallet'
        );
        await switchChainAsync({ chainId: targetNetwork.id });
        showErrorModal('auth.networkSwitchSuccess', [
          {
            labelKey: 'general.confirm',
            onClick: () => {},
            colorType: 'confirm',
          },
        ]);
        hideLoadingModal();
        return true;
      } catch (error) {
        console.error('Network switch error:', error);
        handleError('auth.networkSwitchError');
        hideLoadingModal();
        return false;
      }
    }
    return true;
  }, [
    chainId,
    targetNetwork,
    switchChainAsync,
    showLoadingModal,
    hideLoadingModal,
    showErrorModal,
    handleError,
  ]);

  const handleSignMessage = useCallback(async () => {
    if (isSigningRef.current || signatureProcessRef.current) return;

    try {
      isSigningRef.current = true;

      if (!connector || !isConnected || !address) {
        return;
      }

      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) return;

      showLoadingModal(
        'Connecting Wallet...',
        'Please confirm the connection on your wallet.'
      );

      const message = `Welcome to GFEX!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet address:\n${address}\n\nTimestamp:\n${Date.now()}`;

      const signature = await signMessageAsync({ message });
      if (signature) {
        setToken(signature);
        setWalletAddress(address);
        showErrorModal('auth.walletConnected', [
          {
            labelKey: 'general.confirm',
            onClick: () => {},
            colorType: 'confirm',
          },
        ]);
      }
    } catch (error) {
      console.error('Sign message error:', error);
      handleError('auth.signFailed');
    } finally {
      hideLoadingModal();
      signatureProcessRef.current = null;
      isSigningRef.current = false;
    }
  }, [
    address,
    signMessageAsync,
    setToken,
    setWalletAddress,
    isConnected,
    connector,
    showLoadingModal,
    hideLoadingModal,
    handleError,
    checkAndSwitchNetwork,
    showErrorModal,
  ]);

  useEffect(() => {
    const shouldSign =
      isConnected && address && !token && !isSigningRef.current;

    if (shouldSign) {
      handleSignMessage();
    }
  }, [isConnected, address, token, handleSignMessage]);

  const { data: bnbBalance, refetch: refetchBnb } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  const { data: usdtBalance, refetch: refetchUsdt } = useBalance({
    address: address as `0x${string}`,
    token: process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`,
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  const refreshBalances = useCallback(async () => {
    await Promise.all([refetchBnb(), refetchUsdt()]);
  }, [refetchBnb, refetchUsdt]);

  const AccountMenu = () => (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FaUserCircle />}
        width={fullWidth ? '100%' : 'auto'}
        colorScheme="teal"
        onClick={refreshBalances}
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
      </MenuButton>
      <MenuList>
        <VStack align="start" spacing={3} p={3}>
          <Text fontWeight="bold" color="black">
            Account Balances
          </Text>
          <HStack color="black">
            <SiBinance />
            <Text fontWeight="bold">BNB</Text>
            <Text>{Number(bnbBalance?.formatted || 0).toFixed(4)}</Text>
          </HStack>
          <HStack color="black">
            <SiTether />
            <Text fontWeight="bold">USDT</Text>
            <Text>{Number(usdtBalance?.formatted || 0).toFixed(2)}</Text>
          </HStack>
          <Divider />
          <Button
            leftIcon={<FaSignOutAlt />}
            onClick={handleDisconnect}
            variant="ghost"
            width="100%"
          >
            Logout
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  );

  const checkAndRedirectToMetaMask = useCallback(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const isMetaMaskBrowser = window.ethereum?.isMetaMask;
      if (!isMetaMaskBrowser) {
        // MetaMask 브라우저로 직접 연결
        const metamaskAppUrl = `https://metamask.app.link/dapp/${window.location.href}`;

        // MetaMask 앱이 설치되어 있는지 확인
        const checkMetaMaskInstalled = () => {
          const start = Date.now();
          setTimeout(() => {
            if (Date.now() - start < 1500) {
              // MetaMask 앱이 설치되어 있지 않음
              window.location.href =
                'https://apps.apple.com/app/metamask/id1438144202';
            }
          }, 1000);
        };

        // MetaMask 앱으로 리디렉션
        window.location.href = metamaskAppUrl;
        checkMetaMaskInstalled();
        return true;
      }
    }
    return false;
  }, []);

  const handleConnectClick = useCallback(
    async ({ openConnectModal }: { openConnectModal: () => void }) => {
      logEvent('connect', 'wallet', 'connect_button');
      onMenuClose?.();
      if (!checkAndRedirectToMetaMask()) {
        const networkSwitched = await checkAndSwitchNetwork();
        if (networkSwitched) {
          openConnectModal();
        }
      }
    },
    [checkAndSwitchNetwork, checkAndRedirectToMetaMask, onMenuClose]
  );

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal }) => (
        <Box>
          {!(account && chain) ? (
            <Button
              onClick={() => handleConnectClick({ openConnectModal })}
              colorScheme="teal"
              width={fullWidth ? '100%' : 'auto'}
            >
              Connect Wallet
            </Button>
          ) : (
            <AccountMenu />
          )}
        </Box>
      )}
    </ConnectButton.Custom>
  );
};

export default LoginButton;
