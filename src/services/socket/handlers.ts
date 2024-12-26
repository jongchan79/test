import { ChartSocket, InvestSocket } from './types';

export const chartEventHandlers = {
  subscribeChart: (socket: ChartSocket, pair: string) => {
    console.log('Subscribing to chart:', pair);
    socket.emit('subscribeChart', pair);
  },

  unsubscribeChart: (socket: ChartSocket, pair: string) => {
    console.log('Unsubscribing from chart:', pair);
    socket.emit('unsubscribeChart', pair);
  },

  getChartHistory: (socket: ChartSocket, pair: string) => {
    console.log('Requesting chart history:', pair);
    socket.emit('getChartHistory', pair);
  }
};

export const investEventHandlers = {
  joinRoom: (socket: InvestSocket, data: {
    coinPair: string;
    duration: number;
    roomName: string;
  }) => {
    console.log('Joining room:', data);
    socket.emit('joinRoom', data);
  },

  leaveRoom: (socket: InvestSocket, roomName: string) => {
    console.log('Leaving room:', roomName);
    socket.emit('leaveRoom', { roomName });
  },

  updateInvestNo: (socket: InvestSocket, data: {
    investChoice: 'widen' | 'narrow';
    investNo: string;
    coinPair: string;
    duration: number;
    tokenAddress: string;
    starttime: number;
  }) => {
    console.log('Updating invest number:', data);
    socket.emit('updateInvestNo', data);
  }
}; 