import { create } from 'zustand';
import { Abi } from 'abitype';

// AbiStore 인터페이스를 정의하고 export합니다
export interface AbiStore {
  abi: Abi | null;
  loadAbi: () => void;
}

import localAbi from '../abi/local/abi.json';
import devAbi from '../abi/dev/abi.json';
import prodAbi from '../abi/prod/abi.json';

export const useAbiStore = create<AbiStore>((set) => ({
  abi: null,
  loadAbi: () => {
    const stage = process.env.NEXT_PUBLIC_STAGE || 'local';
    let selectedAbi;
    switch (stage) {
      case 'dev':
        selectedAbi = devAbi;
        break;
      case 'prod':
        selectedAbi = prodAbi;
        break;
      default:
        selectedAbi = localAbi;
    }
    set({ abi: selectedAbi as Abi });
  },
}));
