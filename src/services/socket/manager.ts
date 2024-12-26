import { io, Socket } from 'socket.io-client';
import { ChartSocket, InvestSocket } from './types';

interface ServerToClientEvents {
  pong: () => void;
  chartUpdate: (data: PriceUpdate) => void;
  chartHistory: (data: PriceUpdate[]) => void;
  error: (data: { message: string }) => void;
  connect: () => void;
  disconnect: () => void;
}

interface ClientToServerEvents {
  ping: () => void;
  subscribeChart: (coinPair: string) => void;
  unsubscribeChart: (coinPair: string) => void;
  getChartHistory: (coinPair: string) => void;
  reconnect: () => void;
}

interface PriceUpdate {
  roomName: string;
  prices: {
    pair1: number;
    pair2: number;
  };
  time: string;
}

export class SocketManager {
  private chartSocket: ChartSocket | null = null;
  private investSocket: InvestSocket | null = null;
  private readonly SERVER_URL: string;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;
  private reconnectCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private reconnectDelay = 1000;
  private readonly INITIAL_RETRY_DELAY = 1000;
  private readonly MAX_RETRY_DELAY = 5000;
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.SERVER_URL = process.env.NEXT_PUBLIC_API_URL || '';
    this.setupVisibilityHandler();
    this.setupOnlineHandler();
  }

  private setupVisibilityHandler() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleReconnect();
        }
      });
    }
  }

  private setupOnlineHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (navigator.onLine) {
          this.handleReconnect();
        }
      });
    }
  }

  private async handleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.resetReconnectState();
      throw new Error('Maximum reconnection attempts reached');
    }

    try {
      await this.reconnectSockets();
      this.resetReconnectState();
    } catch (error: unknown) {
      console.error('Reconnection failed:', error);
      this.reconnectAttempts++;
      this.reconnectDelay *= 2;
      this.reconnectTimer = setTimeout(() => {
        this.handleReconnect();
      }, this.reconnectDelay);
    }
  }

  private resetReconnectState() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  private async reconnectSockets() {
    if (this.chartSocket) {
      await this.disconnectChartSocket();
      this.chartSocket = await this.initChartSocket();
    }
    if (this.investSocket) {
      await this.disconnectInvestSocket();
      this.investSocket = await this.initInvestSocket();
    }
  }

  async initChartSocket(): Promise<ChartSocket> {
    if (this.chartSocket?.connected) {
      try {
        await this.pingSocket(this.chartSocket);
        return this.chartSocket;
      } catch {
        await this.disconnectChartSocket();
      }
    }

    this.chartSocket = io(`${this.SERVER_URL}/chart`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: this.RECONNECT_DELAY,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    }) as ChartSocket;

    this.setupSocketErrorHandlers(this.chartSocket, 'Chart');
    return this.chartSocket;
  }

  async initInvestSocket(userId?: string): Promise<InvestSocket> {
    return this.connectWithRetry(async () => {
      if (this.investSocket?.connected) {
        console.log('Reusing existing invest socket connection, userId:', userId);
        return this.investSocket;
      }

      console.log('Initializing new invest socket connection, userId:', userId);
      const socket = io(this.SERVER_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: this.INITIAL_RETRY_DELAY,
        reconnectionDelayMax: this.MAX_RETRY_DELAY,
        reconnectionAttempts: this.MAX_RETRIES,
        timeout: 10000,
        query: { userId },
        forceNew: true
      }) as InvestSocket;

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.disconnect();
          reject(new Error('Connection timeout'));
        }, 10000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          console.log('Invest Socket connected successfully, userId:', userId);
          resolve(socket);
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Connection error:', error);
          reject(error);
        });

        socket.on('disconnect', (reason) => {
          console.log('Invest socket disconnected, reason:', reason);
          if (reason === 'io server disconnect') {
            socket.connect();
          }
        });
      });
    });
  }

  private async connectWithRetry<T>(
    connectFn: () => Promise<T>,
    retries = this.MAX_RETRIES,
    delay = this.INITIAL_RETRY_DELAY
  ): Promise<T> {
    try {
      return await connectFn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      console.log(`Connection failed, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.connectWithRetry(
        connectFn,
        retries - 1,
        Math.min(delay * 2, this.MAX_RETRY_DELAY)
      );
    }
  }

  private setupSocketErrorHandlers(socket: ChartSocket | InvestSocket, type: string) {
    const handleError = (data: { message: string }) => {
      // Already subscribed 에러는 무시
      if (data.message?.includes('Already subscribed')) {
        return;
      }
      console.error(`${type} Socket connect error:`, data.message);
      this.handleReconnect();
    };

    (socket as Socket<ServerToClientEvents, ClientToServerEvents>).on('connect_error', handleError);
    (socket as Socket<ServerToClientEvents, ClientToServerEvents>).on('disconnect', (reason: string) => {
      console.warn(`${type} Socket disconnected:`, reason);
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });
    (socket as Socket<ServerToClientEvents, ClientToServerEvents>).on('error', handleError);
  }

  private async pingSocket(socket: Socket): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Socket ping timeout'));
      }, 5000);

      (socket as Socket<ServerToClientEvents, ClientToServerEvents>).emit('ping');
      (socket as Socket<ServerToClientEvents, ClientToServerEvents>).once('pong', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  async disconnectChartSocket() {
    if (this.chartSocket) {
      this.chartSocket.removeAllListeners();
      this.chartSocket.disconnect();
      this.chartSocket = null;
    }
  }

  disconnectInvestSocket() {
    if (this.investSocket) {
      // 연결 해제 전에 모든 리스너 제거
      this.investSocket.removeAllListeners();
      
      // 연결 상태 확인 후 해제
      if (this.investSocket.connected) {
        this.investSocket.disconnect();
      }
      
      this.investSocket = null;
    }
  }

  getChartSocket(): ChartSocket | null {
    return this.chartSocket;
  }

  getInvestSocket(): InvestSocket | null {
    return this.investSocket;
  }
}

export const socketManager = new SocketManager(); 