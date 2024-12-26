import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useNetworkStore } from '../store/useNetworkStore';
import { http } from 'viem';
import { bscTestnet } from 'viem/chains';


const targetNetwork = useNetworkStore.getState().targetNetwork || bscTestnet;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appName = 'GFEX App';

export const config = getDefaultConfig({
  appName,
  projectId,
  chains: [targetNetwork],
  transports: {
    [targetNetwork.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: false,
});

// 디버깅
// console.log("Config initialized with:", {
//   projectId,
//   network: targetNetwork,
//   rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
// });
