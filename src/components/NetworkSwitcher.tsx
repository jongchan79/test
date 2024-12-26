import { useAccount, useSwitchChain } from 'wagmi';
import { useNetworkStore } from '../store/useNetworkStore';
import { useToast } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export function NetworkSwitcher() {
  const { chain, address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const toast = useToast();
  const { targetNetwork } = useNetworkStore();
  const { disconnectWallet, walletAddress } = useAuthStore();
  const isInitialMount = useRef(true);
  const isProcessing = useRef(false);

  useEffect(() => {
    const addTargetNetwork = async () => {
      if (!targetNetwork?.id) return;

      if (isProcessing.current) return;
      isProcessing.current = true;

      if (
        typeof window.ethereum !== 'undefined' &&
        chain &&
        chain.id !== targetNetwork.id
      ) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetNetwork.id.toString(16)}`,
                chainName: targetNetwork.name,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: [targetNetwork.rpcUrls.default.http[0]],
                blockExplorerUrls: [targetNetwork.blockExplorers?.default.url],
              },
            ],
          });

          await switchChainAsync({ chainId: targetNetwork.id });
        } catch (error) {
          console.error('Error switching network:', error);
        } finally {
          isProcessing.current = false;
        }
      }
    };

    if (!isInitialMount.current && chain && targetNetwork?.id) {
      addTargetNetwork();
    } else {
      isInitialMount.current = false;
    }
  }, [chain, targetNetwork, switchChainAsync]);

  useEffect(() => {
    if (address && address !== walletAddress && walletAddress !== null) {
      if (!isInitialMount.current) {
        toast({
          title: 'Address changed',
          description: 'Your wallet address has changed. Please sign again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        disconnectWallet();
      }
    }
  }, [address, walletAddress, disconnectWallet, toast]);

  return null;
}
