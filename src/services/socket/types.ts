import { Socket } from 'socket.io-client';

export interface ChartServerEvents {
  chartUpdate: (data: ServicePriceData) => void;
  chartHistory: (data: ServicePriceData[]) => void;
}

export interface ChartClientEvents {
  subscribeChart: (pair: string) => void;
  unsubscribeChart: (pair: string) => void;
  getChartHistory: (pair: string) => void;
}

export interface InvestServerToClientEvents {
  changeRoom: (data: {
    oldRoomName: string;
    newRoomName: string;
    startTime: number;
    investNo: string;
    investChoice: 'widen' | 'narrow' | null;
    startPriceDifference: number;
    roomStats: {
      totalInvestors: number;
      widenCount: number;
      narrowCount: number;
      clientsInRoom: number;
    }
  }) => void;
  roomReconnected: (data: { 
    roomName: string; 
    roomData: InvestRoomInfo 
  }) => void;
  roomJoined: (data: { 
    roomName: string; 
    message: string 
  }) => void;
  roomLeft: (data: { 
    roomName: string; 
    message: string 
  }) => void;
  roomUpdate: (data: {
    clientsInRoom: number;
    widenCount: number;
    narrowCount: number;
  }) => void;
  investNoUpdated: (data: {
    roomName: string;
    investNo: string;
    startTime: number;
    status: string;
  }) => void;
  investmentFinalized: (data: {
    investNo: string;
    finalPriceDifference: number;
    message: string;
  }) => void;
  updateFinalizedDiff: (data: {
    finalPriceDifference: number;
  }) => void;
  error: (data: { 
    type: string; 
    message: string 
  }) => void;
  userId: (userId: string) => void;
  pong: () => void;
}

export interface InvestClientToServerEvents {
  joinRoom: (data: { 
    coinPair: string; 
    duration: number;
    roomName: string;
  }) => void;
  leaveRoom: (data: { 
    roomName: string 
  }) => void;
  requestRoomReconnect: (data: {
    roomName: string;
    userId: string;
  }) => void;
  updateInvestNo: (data: {
    investChoice: 'widen' | 'narrow';
    investNo: string;
    coinPair: string;
    duration: number;
    tokenAddress: string;
    starttime: number;
  }) => void;
  disconnect: () => void;
  connect: () => void;
  ping: () => void;
}

export type ChartSocket = Socket<ChartServerEvents, ChartClientEvents>;
export type InvestSocket = Socket<InvestServerToClientEvents, InvestClientToServerEvents>;

export interface InvestState {
  socket: InvestSocket | null;
  currentRoom: string | null;
  roomInfo: RoomData | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  startTime: number | null;
  endTime: number | null;
  investNo: string | null;
  investChoice: 'widen' | 'narrow' | null;
  startPriceDifference: number;
  finalPriceDifference: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'ERROR';
  investDebugLogs: string[];
  addInvestDebugLog: (message: string) => void;
  setError: (error: string | null) => void;
  setStartTime: (time: number | null) => void;
  setEndTime: (time: number | null) => void;
  setInvestChoice: (choice: 'widen' | 'narrow' | null) => void;
  setStartPriceDifference: (diff: number) => void;
  setFinalPriceDifference: (diff: number) => void;
  subscribeInvestPair: (coin1: string, coin2: string, duration: string) => void;
  unsubscribeInvest: () => void;
  joinRoom: (coinPair: string, duration: number) => void;
  leaveRoom: () => void;
  connect: () => Promise<Socket | null>;
  disconnect: () => void;
}

export interface InvestClientToServerEvents {
  joinRoom: (data: { 
    coinPair: string; 
    duration: number;
    roomName: string;
  }) => void;
  leaveRoom: (data: { 
    roomName: string 
  }) => void;
  requestRoomReconnect: (data: {
    roomName: string;
    userId: string;
  }) => void;
  updateInvestNo: (data: {
    investChoice: 'widen' | 'narrow';
    investNo: string;
    coinPair: string;
    duration: number;
    tokenAddress: string;
    starttime: number;
  }) => void;
  disconnect: () => void;
  connect: () => void;
  ping: () => void;
}

export interface InvestRoomInfo {
  starttime: number;
  endtime: number;
  startPriceDifference: number;
  finalPriceDifference: number;
  clientsCount: number;
  widenCount: number;
  narrowCount: number;
  myInvestment?: 'widen' | 'narrow' | null;
}

export interface ServicePriceData {
  roomName: string;
  prices: {
    pair1: number;
    pair2: number;
  };
  time: string;
}

export interface RoomData {
  clientsInRoom: number;
  widenCount: number;
  narrowCount: number;
}