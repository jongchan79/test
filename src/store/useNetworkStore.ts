import { create } from 'zustand';
import { bsc, bscTestnet } from 'viem/chains';
import { Chain } from 'viem';

interface NetworkStore {
  targetNetwork: Chain;
  setTargetNetwork: (network: Chain) => void;
}

const SUPPORTED_NETWORKS = {
  development: bscTestnet,
  dev: bscTestnet,
  production: bsc
} as const;

const currentStage = process.env.NEXT_PUBLIC_STAGE as keyof typeof SUPPORTED_NETWORKS || 'development';

// console.log("currentStage", currentStage);
// console.log(SUPPORTED_NETWORKS[currentStage]);

export const useNetworkStore = create<NetworkStore>((set) => ({
  targetNetwork: SUPPORTED_NETWORKS[currentStage],
  setTargetNetwork: (network) => set({ targetNetwork: network }),
})); 