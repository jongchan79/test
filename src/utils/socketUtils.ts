import { Socket } from 'socket.io-client';

export interface ChartServerEvents {
  chartHistory: (data: ServicePriceData[]) => void;
  chartUpdate: (data: ServicePriceData) => void;
  error: (data: { 
    type: string;
    message: string 
  }) => void;
}

export interface ChartClientEvents {
  subscribeChart: (pair: string) => void;
  unsubscribeChart: (pair: string) => void;
  getChartHistory: (pair: string) => void;
}

export interface InvestServerEvents {
  roomJoined: (data: { roomName: string; message: string }) => void;
  roomUpdate: (data: { 
    clientsInRoom: number; 
    widenCount: number; 
    narrowCount: number 
  }) => void;
  // ... 기존 ServerToClientEvents의 나머지 타입들
}

export interface InvestClientEvents {
  joinRoom: (data: { 
    coinPair: string; 
    duration: number;
    roomName: string;
  }) => void;
  leaveRoom: (data: { roomName: string }) => void;
  // ... 기존 ClientToServerEvents의 나머지 타입들
}

export type InvestSocket = Socket<InvestServerEvents, InvestClientEvents>;

export interface ServicePriceData {
  roomName: string;
  prices: {
    pair1: number;
    pair2: number;
  };
  time: string;
}

interface ChartServerToClientEvents {
  chartHistory: (data: ServicePriceData[]) => void;
  chartUpdate: (data: ServicePriceData) => void;
  error: (data: { type: string; message: string }) => void;
}

interface ChartClientToServerEvents {
  subscribeChart: (pair: string) => void;
  unsubscribeChart: (pair: string) => void;
}

export type ChartSocket = Socket<ChartServerToClientEvents, ChartClientToServerEvents>;