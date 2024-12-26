import { create } from 'zustand';
import { socketManager } from '../services/socket/manager';
import type { InvestState } from '../services/socket/types';
import { investEventHandlers } from '../services/socket/handlers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredUserId } from '../utils/investmentUtils';



export const useInvestStore = create<InvestState>((set, get) => ({
  socket: null,
  currentRoom: null,
  roomInfo: null,
  connected: false,
  connecting: false,
  error: null,
  startTime: null,
  endTime: null,
  investNo: null,
  investChoice: null,
  startPriceDifference: 0,
  finalPriceDifference: 0,
  status: 'PENDING',
  investDebugLogs: [],
  addInvestDebugLog: (message: string) => {
    const now = new Date().toLocaleTimeString();
    set((state) => ({
      investDebugLogs: [...state.investDebugLogs, `[${now}] ${message}`]
    }));
  },

  connect: async () => {
    const { connecting, connected, socket: existingSocket } = get();
    
    get().addInvestDebugLog(`Connect called - connecting: ${connecting}, connected: ${connected}, hasSocket: ${!!existingSocket}`);
    
    if (connecting || connected) {
      const { currentRoom } = get();
      const userId = await getStoredUserId();
      if (currentRoom && userId && existingSocket) {
        get().addInvestDebugLog(`Requesting room reconnect: ${currentRoom}`);
        existingSocket.emit('requestRoomReconnect', {
          roomName: currentRoom,
          userId: userId
        });
      }
      return existingSocket;
    }
    
    set({ connecting: true });
    try {
      const userId = await getStoredUserId();
      get().addInvestDebugLog(`Initializing socket with userId: ${userId}`);
      
      const socket = await socketManager.initInvestSocket(userId || undefined);
      
      if (socket?.connected) {
        socket.io.on("reconnect_attempt", () => {
          get().addInvestDebugLog("Socket reconnection attempt");
          const { currentRoom } = get();
          if (currentRoom && userId) {
            get().addInvestDebugLog(`Requesting room reconnect on attempt: ${currentRoom}`);
            socket.emit('requestRoomReconnect', {
              roomName: currentRoom,
              userId: userId
            });
          }
        });

        socket.on("connect", () => {
          get().addInvestDebugLog("Socket connected - checking current room");
          const { currentRoom } = get();
          if (currentRoom && userId) {
            get().addInvestDebugLog(`Requesting room reconnect: ${currentRoom}`);
            socket.emit('requestRoomReconnect', {
              roomName: currentRoom,
              userId: userId
            });
          }
        });

        socket.on('roomUpdate', (data) => {
          if (!data) {
            console.error('Received empty room update data');
            return;
          }
          
          try {
            set({ 
              roomInfo: {
                clientsInRoom: data.clientsInRoom,
                widenCount: data.widenCount,
                narrowCount: data.narrowCount
              }
            });
          } catch (error) {
            console.error('Error processing room update:', error);
          }
        });

        socket.on('changeRoom', (data) => {
          get().addInvestDebugLog(`Room changed: ${JSON.stringify(data)}`);
          set({
            currentRoom: data.newRoomName,
            startTime: data.startTime,
            investNo: data.investNo,
            investChoice: data.investChoice,
            startPriceDifference: data.startPriceDifference,
            roomInfo: data.roomStats,
            status: 'ACTIVE'
          });

          get().addInvestDebugLog(`Current room found: ${get().currentRoom}`);
        });

        socket.on('roomReconnected', (data) => {
          get().addInvestDebugLog(`Room reconnected event received: ${JSON.stringify(data)}`);
          const { roomName, roomData } = data;
          
          set({
            currentRoom: roomName,
            startTime: roomData.starttime,
            endTime: roomData.endtime,
            startPriceDifference: roomData.startPriceDifference,
            finalPriceDifference: roomData.finalPriceDifference,
            investChoice: roomData.myInvestment || null,
            roomInfo: {
              clientsInRoom: roomData.clientsCount,
              widenCount: roomData.widenCount,
              narrowCount: roomData.narrowCount
            },
            status: 'ACTIVE'
          });
        });

        socket.on('userId', async (newUserId) => {
          get().addInvestDebugLog(`Received userId from server: ${newUserId}`);
          try {
            await AsyncStorage.setItem('userId', newUserId);
            get().addInvestDebugLog('Saved userId to AsyncStorage');
          } catch (error) {
            get().addInvestDebugLog(`Failed to save userId: ${error}`);
          }
        });

        set({ 
          socket,
          connected: true,
          connecting: false,
          error: null
        });

        get().addInvestDebugLog('Socket connected and listeners set up');
        return socket;
      }
      throw new Error('Socket connection failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      get().addInvestDebugLog(`Socket connection error: ${errorMessage}`);
      set({ 
        error: 'Failed to connect invest socket',
        connecting: false 
      });
      return null;
    }
  },

  disconnect: () => {
    const { socket, currentRoom } = get();
    if (socket) {
      if (currentRoom) {
        get().leaveRoom();
      }
      
      socket.removeAllListeners();
      
      set({
        socket: null,
        currentRoom: null,
        roomInfo: null,
        connected: false,
        error: null,
        startTime: null,
        endTime: null,
        investNo: null,
        investChoice: null,
        startPriceDifference: 0,
        finalPriceDifference: 0,
        status: 'PENDING'
      }, false);
      
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
  },

  joinRoom: (coinPair: string, duration: number) => {
    const { socket } = get();
    if (!socket) return;

    const roomName = `${coinPair}-${duration}MIN`;
    investEventHandlers.joinRoom(socket, {
      coinPair,
      duration,
      roomName
    });
    set({ currentRoom: roomName });
  },

  leaveRoom: () => {
    const { socket, currentRoom } = get();
    if (!socket || !currentRoom) return;

    investEventHandlers.leaveRoom(socket, currentRoom);
    set({ 
      currentRoom: null,
      roomInfo: null,
      startTime: null,
      endTime: null,
      investNo: null,
      investChoice: null,
      startPriceDifference: 0,
      finalPriceDifference: 0,
      status: 'PENDING'
    });
  },

  updateInvestNo: (data: {
    investChoice: 'widen' | 'narrow';
    investNo: string;
    coinPair: string;
    duration: number;
    tokenAddress: string;
    starttime: number;
  }) => {
    const { socket } = get();
    if (!socket) return;

    investEventHandlers.updateInvestNo(socket, data);
    set({
      investChoice: data.investChoice,
      investNo: data.investNo,
      startTime: data.starttime,
      status: 'ACTIVE'
    });
  },

  setError: (error: string | null) => set({ error }),
  setStartTime: (startTime: number | null) => set({ startTime }),
  setEndTime: (endTime: number | null) => set({ endTime }),
  setInvestChoice: (investChoice: 'widen' | 'narrow' | null) => set({ investChoice }),
  setStartPriceDifference: (startPriceDifference: number) => set({ startPriceDifference }),
  setFinalPriceDifference: (finalPriceDifference: number) => set({ finalPriceDifference }),

  subscribeInvestPair: (coin1: string, coin2: string, duration: string) => {
    const { socket, connected } = get();
    if (!socket || !connected) {
      get().connect().then((newSocket) => {
        if (newSocket?.connected) {
          get().joinRoom(coin1 + '/' + coin2, parseInt(duration));
        }
      });
      return;
    }
    get().joinRoom(coin1 + '/' + coin2, parseInt(duration));
  },
  unsubscribeInvest: () => {
    get().leaveRoom();
  }
})); 