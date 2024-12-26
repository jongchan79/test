import { create } from 'zustand';
import { socketManager } from '../services/socket/manager';
import { ChartSocket } from '../services/socket/types';

interface PriceState {
  socket: ChartSocket | null;
  connected: boolean;
  connecting: boolean;
  priceData: { [key: string]: number[] };
  timeLabels: string[];
  error: string | null;
  subscriptions: Set<string>;
  currentPair: string | null;
  priceDebugLogs: string[];
  
  connect: () => Promise<ChartSocket | null>;
  disconnect: () => void;
  subscribeToPair: (pair: string) => Promise<void>;
  unsubscribePair: (pair: string) => void;
  updatePriceData: (coin: string, price: number, time: string) => void;
  addPriceDebugLog: (message: string) => void;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  socket: null,
  connected: false,
  connecting: false,
  priceData: {},
  timeLabels: [],
  error: null,
  subscriptions: new Set(),
  currentPair: null,
  priceDebugLogs: [],

  connect: async () => {
    console.log('=== Price Store Connect ===');
    const { connecting, connected, socket: existingSocket } = get();
    
    get().addPriceDebugLog(`Connect called - connecting: ${connecting}, connected: ${connected}, hasSocket: ${!!existingSocket?.connected}`);
    
    if (connecting) {
      get().addPriceDebugLog('Already attempting to connect, skipping');
      return existingSocket;
    }

    set({ connecting: true });
    try {
      const socket = await socketManager.initChartSocket();
      
      if (socket?.connected) {
        // 기존 리스너 모두 제거
        socket.removeAllListeners();
        
        // 차트 업데이트 리스너
        socket.on('chartUpdate', (data) => {
          get().addPriceDebugLog(`[Update] Received for ${data.roomName} at ${data.time}`);
          const { roomName, prices, time } = data;
          const [coin1, coin2] = roomName.split('/');        
          const { priceData, timeLabels } = get();
          const MAX_DATA_POINTS = 50;

          set({
            priceData: {
              ...priceData,
              [coin1]: [...(priceData[coin1] || []).slice(-(MAX_DATA_POINTS - 1)), prices.pair1],
              [coin2]: [...(priceData[coin2] || []).slice(-(MAX_DATA_POINTS - 1)), prices.pair2],
            },
            timeLabels: [...timeLabels.slice(-(MAX_DATA_POINTS - 1)), time],
          });
        });

        // 히스토리 리스너
        socket.on('chartHistory', (history) => {
          get().addPriceDebugLog(`[History] Received ${history.length} data points`);
          const newPriceData: { [key: string]: number[] } = {};
          const newTimeLabels: string[] = [];

          history.forEach((item) => {
            const [coin1, coin2] = item.roomName.split('/');
            if (!newPriceData[coin1]) newPriceData[coin1] = [];
            if (!newPriceData[coin2]) newPriceData[coin2] = [];
            
            newPriceData[coin1].push(item.prices.pair1);
            newPriceData[coin2].push(item.prices.pair2);
            newTimeLabels.push(item.time);
          });

          set({ 
            priceData: newPriceData, 
            timeLabels: newTimeLabels 
          });
        });

        // 연결 해제 리스너
        socket.on('disconnect', (reason) => {
          get().addPriceDebugLog(`Price socket disconnected: ${reason}`);
          set({ connected: false });
        });

        // 재연결 리스너
        socket.on('connect', () => {
          get().addPriceDebugLog('Price socket reconnected');
          set({ connected: true });
          const { currentPair } = get();
          if (currentPair) {
            get().addPriceDebugLog(`Resubscribing to: ${currentPair}`);
            socket.emit('subscribeChart', currentPair);
            socket.emit('getChartHistory', currentPair);
          }
        });

        set({ 
          socket,
          connected: true,
          connecting: false,
          error: null
        });

        get().addPriceDebugLog('Socket connected and listeners set up');
        return socket;
      }
      throw new Error('Socket connection failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      get().addPriceDebugLog(`Socket connection error: ${errorMessage}`);
      set({ 
        error: 'Failed to connect price socket',
        connecting: false,
        connected: false
      });
      return null;
    }
  },

  disconnect: () => {
    const { socket, subscriptions } = get();
    if (socket) {
      // 모든 구독 해제
      subscriptions.forEach(pair => {
        socket.emit('unsubscribeChart', pair);
      });
      
      socket.removeAllListeners();
      socket.disconnect();
      
      set({ 
        socket: null, 
        connected: false,
        subscriptions: new Set(),
        priceData: {},
        timeLabels: [],
        currentPair: null
      });
    }
  },

  subscribeToPair: async (pair: string) => {
    const { socket, subscriptions, currentPair, addPriceDebugLog } = get();
    
    addPriceDebugLog(`[Subscribe] Start - pair: ${pair}, current: ${currentPair}`);
    
    if (!socket?.connected) {
      addPriceDebugLog('[Subscribe] Socket not connected!');
      throw new Error('Socket not connected');
    }

    try {
      // 이전 구독 해제
      if (currentPair) {
        addPriceDebugLog(`[Subscribe] Unsubscribing from previous: ${currentPair}`);
        socket.emit('unsubscribeChart', currentPair);
      }

      // 항상 새로 구독 시도
      addPriceDebugLog(`[Subscribe] Subscribing to pair: ${pair}`);
      socket.emit('subscribeChart', pair);
      socket.emit('getChartHistory', pair);
      
      subscriptions.add(pair);
      set({ 
        subscriptions: new Set(subscriptions),
        currentPair: pair 
      });
      
      addPriceDebugLog(`[Subscribe] Successfully subscribed to ${pair}`);
    } catch (error) {
      addPriceDebugLog(`[Subscribe] Failed: ${error}`);
      throw error;
    }
  },

  unsubscribePair: (pair: string) => {
    const { socket, subscriptions, addPriceDebugLog } = get();
    
    if (socket?.connected && subscriptions.has(pair)) {
      socket.emit('unsubscribeChart', pair);
      subscriptions.delete(pair);
      
      set({ 
        subscriptions: new Set(subscriptions),
        priceData: {},
        timeLabels: [],
        currentPair: null
      });
      
      addPriceDebugLog(`🔄 Unsubscribed from ${pair}`);
    }
  },

  updatePriceData: (coin: string, price: number, time: string) => {
    const { priceData, timeLabels } = get();
    const MAX_DATA_POINTS = 50;

    set({
      priceData: {
        ...priceData,
        [coin]: [...(priceData[coin] || []).slice(-(MAX_DATA_POINTS - 1)), price],
      },
      timeLabels: [...timeLabels.slice(-(MAX_DATA_POINTS - 1)), time],
    });
  },

  addPriceDebugLog: (message: string) => {
    const now = new Date().toLocaleTimeString();
    set(state => ({
      priceDebugLogs: [...state.priceDebugLogs.slice(-49), `[${now}] ${message}`]
    }));
  },
}));