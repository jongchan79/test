// src/store/useAuthStore.ts
import { create } from 'zustand';
import { useNetworkStore } from './useNetworkStore';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  walletAddress: string | null;
  chainId: number | null;
  isSignModalOpen: boolean;
  tokenExpiry: number;
  refreshToken: string | null;
  
  setToken: (token: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  openSignModal: () => void;
  closeSignModal: () => void;
  disconnectWallet: () => void;
  validateNetwork: () => boolean;
}

const getStorageValue = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageValue = (key: string, value: string | null) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // State
  token: null,
  walletAddress: null,
  isLoggedIn: false,
  chainId: null,
  isSignModalOpen: false,
  tokenExpiry: 0,
  refreshToken: null,

  // Methods
  setToken: (token: string | null) => {
    setStorageValue('auth_token', token);
    set({ token, isLoggedIn: !!token });
  },

  setLoggedIn: (loggedIn: boolean) => {
    set({ isLoggedIn: loggedIn });
  },

  setWalletAddress: (address: string | null) => {
    setStorageValue('wallet_address', address);
    set({ walletAddress: address });
  },

  setChainId: (chainId: number | null) => {
    set({ chainId });
  },

  openSignModal: () => {
    set({ isSignModalOpen: true });
  },

  closeSignModal: () => {
    set({ isSignModalOpen: false });
  },

  disconnectWallet: () => {
    setStorageValue('auth_token', null);
    setStorageValue('wallet_address', null);

    // localStorage에서 wagmi 관련 데이터도 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
    }

    set({
      isLoggedIn: false,
      token: null,
      walletAddress: null,
      chainId: null,
      isSignModalOpen: false,
      tokenExpiry: 0,
      refreshToken: null
    });
  },

  validateNetwork: () => {
    const { chainId } = get();
    const { targetNetwork } = useNetworkStore.getState();
    return chainId === targetNetwork.id;
  },
}));

// 초기 상태 복원
if (typeof window !== 'undefined') {
  const storedToken = getStorageValue('auth_token');
  const storedAddress = getStorageValue('wallet_address');

  if (storedToken && storedAddress) {
    useAuthStore.setState({
      token: storedToken,
      walletAddress: storedAddress,
      isLoggedIn: true,
    });
  }
}
