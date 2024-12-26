import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 투자 시간을 문자열에서 초 단위로 변환
 */
export const calcDuration = (duration: string): number => {
  const durationMap: Record<string, number> = {
    '1 MIN': 60,
    '2 MIN': 120,
    '3 MIN': 180,
  };
  return durationMap[duration] || 60; // 기본값
};

/**
 * 다음 투자 시작 시간 계산
 */
export const calculateStartTime = (duration: string): number => {
  const currentDate = new Date();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  
  const durationInMinutes = parseInt(duration.replace(' MIN', ''));
  
  let nextValidMinute = currentMinutes;
  
  if (durationInMinutes === 1) {
    // 1분 간격일 때는 기존 로직 유지
    nextValidMinute = currentMinutes + (currentSeconds > 40 ? 2 : 1);
  } 
  else if (durationInMinutes === 2) {
    // 2분 간격일 때
    const nextTwoMinute = Math.ceil(currentMinutes / 2) * 2;
    
    if (nextTwoMinute === currentMinutes) {
      // 현재가 2의 배수 분이면, 다음 2의 배수로
      nextValidMinute = currentMinutes + 2;
    } else {
      // 다음 2의 배수까지 20초 이상 남았는지 확인
      const timeUntilNext = (nextTwoMinute - currentMinutes) * 60 - currentSeconds;
      nextValidMinute = timeUntilNext > 20 ? nextTwoMinute : nextTwoMinute + 2;
    }
  }
  else if (durationInMinutes === 3) {
    // 3분 간격일 때
    const nextThreeMinute = Math.ceil(currentMinutes / 3) * 3;
    
    if (nextThreeMinute === currentMinutes) {
      // 현재가 3의 배수 분이면, 다음 3의 배수로
      nextValidMinute = currentMinutes + 3;
    } else {
      // 다음 3의 배수까지 20초 이상 남았는지 확인
      const timeUntilNext = (nextThreeMinute - currentMinutes) * 60 - currentSeconds;
      nextValidMinute = timeUntilNext > 20 ? nextThreeMinute : nextThreeMinute + 3;
    }
  }

  const targetDate = new Date(currentDate);
  targetDate.setMinutes(nextValidMinute);
  targetDate.setSeconds(0);
  targetDate.setMilliseconds(0);
  
  return Math.floor(targetDate.getTime() / 1000);
};

/*
  const calculateStartTime = (duration: string): number => {
    const now = new Date();
    let startMinutes = now.getMinutes();
    const seconds = now.getSeconds();
    if (duration === '1 MIN') {
      if (seconds > 30) startMinutes += 1;
      startMinutes += 1;
    } else if (duration === '3 MIN') {
      startMinutes = startMinutes + ((3 - (startMinutes % 3)) % 3);
    } else if (duration === '5 MIN') {
      startMinutes = startMinutes + ((5 - (startMinutes % 5)) % 5);
    }
    const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      startMinutes,
      0
    );

    console.log(`startTime: ${startTime}`);
    return Math.floor(startTime.getTime() / 1000);
  };
*/

// 에러 타입 정의
interface WalletError {
  code?: number;
  message?: string;
}

interface ContractError {
  message?: string;
}

export type InvestmentError = WalletError | ContractError | string;

/**
 * 에러 메시지를 사용자가 읽기 쉬운 형태로 변환
 */
export const getReadableErrorMessage = (error: InvestmentError): string => {
  if (typeof error === 'string') {
    return error;
  }

  // MetaMask 및 일반적인 지갑 에러 처리
  const walletError = error as WalletError;
  if (walletError?.code === 4001 || walletError?.message?.includes('user rejected')) {
    return 'general.user_canceled';
  }
  console.log(error);

  // 컨트랙트 에러 처리
  const contractErrors: Record<string, string> = {
    'insufficient balance': 'general.insufficient_token',
    'exceeds allowance': 'general.notapproved_token',
    'cycle expired': 'general.cycle_expired',
    'cycle ended': 'general.cycle_ended',
    'max investors reached': 'general.max_investors_reached',
    'already in cycle': 'general.aleady_in_cycle',
    'wallet not connected': 'auth.signInRequired'
  };

  const errorMessage = (error as ContractError)?.message?.toLowerCase() || '';
  for (const [key, value] of Object.entries(contractErrors)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // 기본 에러 메시지
  return 'general.investment_failed';
};

export const getStoredUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.warn('Failed to access AsyncStorage:', error);
    return null;
  }
};

/**
 * 코인 페어 문자열을 배열로 변환 ("BTC/ETH" => ["BTC", "ETH"])
 */
export const parseCoinPair = (pairString: string): string[] => {
  return pairString.split('/');
};

/**
 * USDT 금액 문자열에서 숫자만 추출 ("1 USDT" => "1")
 */
export const parseUsdtAmount = (usdtString: string): string => {
  return usdtString.replace(' USDT', '');
}; 

export const formatTickValue = (value: string | number) => {
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (typeof value === 'string') {
    return Number(value.replace(',', '')).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value;
};