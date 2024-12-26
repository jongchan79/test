import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { usePriceStore } from '../store/usePriceStore';
import { useInvestStore } from '../store/useInvestStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAccount } from 'wagmi';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  useBreakpointValue,
  Stat,
  StatLabel,
  StatNumber,
  // Grid,
  // GridItem,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@chakra-ui/icons';
import Chart from './Chart';
import InvestButtons from '../ui/InvestButtons';
import InvestmentTimer from '../ui/InvestmentTimer';
import { ErrorModalContext } from '../pages/_app';
import {
  calcDuration,
  parseCoinPair,
  parseUsdtAmount,
  formatTickValue,
} from '../utils/investmentUtils';
import { SiBitcoin, SiEthereum, SiSolana, SiBitcoincash } from 'react-icons/si';
import { LiaChartLineSolid } from 'react-icons/lia';
import { FiClock, FiFlag } from 'react-icons/fi';
import { logEvent } from '../utils/analytics';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { debounce } from 'lodash';

const coinIcons = {
  BTC: SiBitcoin,
  ETH: SiEthereum,
  SOL: SiSolana,
  BCH: SiBitcoincash,
};

const MainScreen = () => {
  const { showErrorModal } = useContext(ErrorModalContext);
  const { t } = useTranslation();
  const { isLoggedIn, token } = useAuthStore();
  const { address, isConnected } = useAccount();

  const isFullyAuthenticated = useMemo(() => {
    return isLoggedIn && isConnected && address && token;
  }, [isLoggedIn, isConnected, address, token]);

  const {
    connect: connectPrice,
    disconnect: disconnectPrice,
    subscribeToPair: subscribePricePair,
    priceData,
    timeLabels,
    connected,
    priceDebugLogs,
  } = usePriceStore();

  const {
    currentRoom,
    subscribeInvestPair,
    roomInfo,
    startTime,
    endTime,
    startPriceDifference,
    finalPriceDifference,
    investChoice,
    error,
    connect: connectInvest,
    setStartTime,
    setError,
    setEndTime,
    setInvestChoice,
    setStartPriceDifference,
    setFinalPriceDifference,
    disconnect: disconnectInvest,
    investDebugLogs,
  } = useInvestStore();

  const clientsInRoom = roomInfo?.clientsInRoom || 0;
  const widenCount = roomInfo?.widenCount || 0;
  const narrowCount = roomInfo?.narrowCount || 0;

  const [selectedPair, setSelectedPair] = useState(['BTC', 'ETH']);
  const [selectedUsdt, setSelectedUsdt] = useState('1 USDT');
  const [selectedTime, setSelectedTime] = useState('1 MIN');
  const [investmentActive, setInvestmentActive] = useState(false);
  const [result, setResult] = useState<string>('');
  // 로그를 저장할 상태 추가
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // 로그 추가 함수
  const addDebugLog = useCallback((message: string) => {
    setDebugLogs((prev) => [...prev.slice(-9), message]); // 최근 10개만 유지
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }, []);

  // Price Calculation
  const coin1Price = useMemo(
    () => priceData[selectedPair[0]]?.slice(-1)[0] || 0,
    [priceData, selectedPair]
  );
  const coin2Price = useMemo(
    () => priceData[selectedPair[1]]?.slice(-1)[0] || 0,
    [priceData, selectedPair]
  );
  const higherPrice = useMemo(
    () => Math.max(coin1Price, coin2Price),
    [coin1Price, coin2Price]
  );
  const lowerPrice = useMemo(
    () => Math.min(coin1Price, coin2Price),
    [coin1Price, coin2Price]
  );
  const higherSymbol = useMemo(
    () => (coin1Price >= coin2Price ? selectedPair[0] : selectedPair[1]),
    [coin1Price, coin2Price, selectedPair]
  );
  const lowerSymbol = useMemo(
    () => (coin1Price < coin2Price ? selectedPair[0] : selectedPair[1]),
    [coin1Price, coin2Price, selectedPair]
  );
  const priceDifference = useMemo(
    () => Math.abs(coin1Price - coin2Price).toLocaleString(),
    [coin1Price, coin2Price]
  );

  const flexDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    md: 'row',
  });

  const remainingTimeRef = useRef<number>(0);

  useEffect(() => {
    if (error) {
      showErrorModal(
        error,
        [
          {
            labelKey: 'general.ok',
            onClick: () => {
              setResult('');
              setError(null);
            },
          },
        ],
        'error'
      );
    }
  }, [error, showErrorModal, setError]);

  // WebSocket Connection
  useEffect(() => {
    let mounted = true;
    let initialized = false;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeConnections = async () => {
      if (!mounted || initialized || retryCount >= maxRetries) return;

      try {
        if (selectedPair.length === 2) {
          const [coin1, coin2] = selectedPair;
          const pairString = `${coin1}/${coin2}`;

          addDebugLog(`Initializing connections for ${pairString}`);

          // 차트 소켓 연결 및 구독
          const priceSocket = await connectPrice();
          if (mounted && priceSocket?.connected) {
            initialized = true;
            subscribePricePair(pairString);
            addDebugLog(`Price socket connected: ${pairString}`);

            // 투자 소켓 연결 시도
            if (!investmentActive) {
              const investSocket = await connectInvest();
              if (mounted && investSocket?.connected) {
                subscribeInvestPair(coin1, coin2, selectedTime);
                addDebugLog(
                  `Investment socket connected: ${coin1}/${coin2}-${selectedTime}`
                );
              }
            }
          } else {
            retryCount++;
            if (retryCount < maxRetries) {
              addDebugLog(`Retry attempt ${retryCount}...`);
              setTimeout(initializeConnections, 2000);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing connections:', error);
        addDebugLog(`Connection error: ${error}`);
        setError('Connection failed');
      }
    };

    // 디바운스된 재연결 핸들러
    const debouncedReconnection = debounce(() => {
      if (!document.hidden && mounted) {
        if (!connected) {
          initialized = false;
          retryCount = 0;
          initializeConnections();
        }
      }
    }, 1000);

    // 초기 연결
    initializeConnections();

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', debouncedReconnection);
    window.addEventListener('focus', debouncedReconnection);
    window.addEventListener('online', debouncedReconnection);

    return () => {
      mounted = false;
      if (window.location.pathname !== '/') {
        disconnectPrice();
        disconnectInvest();
      }
      document.removeEventListener('visibilitychange', debouncedReconnection);
      window.removeEventListener('focus', debouncedReconnection);
      window.removeEventListener('online', debouncedReconnection);
      debouncedReconnection.cancel();
    };
  }, [selectedPair, investmentActive, selectedTime]); // connected 제거

  // invest result
  useEffect(() => {
    if (finalPriceDifference > 0 && startPriceDifference > 0) {
      setResult(
        startPriceDifference > finalPriceDifference ? 'narrow' : 'widen'
      );
    }
  }, [startPriceDifference, finalPriceDifference, investmentActive]);

  const handleCoinPairClick = useCallback(
    async (pair: string) => {
      const [coin1, coin2] = parseCoinPair(pair);

      setSelectedPair([coin1, coin2]);
      setStartTime(null);

      try {
        // 먼저 모든 연결 해제
        disconnectPrice();
        if (!investmentActive) {
          disconnectInvest();
        }

        // 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 차트 소켓 새로 연결
        const priceSocket = await connectPrice();
        if (priceSocket?.connected) {
          addDebugLog(`Subscribing to chart: ${coin1}/${coin2}`);
          subscribePricePair(`${coin1}/${coin2}`);
        }

        // 투자 소켓 새로 연결
        if (!investmentActive) {
          const investSocket = await connectInvest();
          if (investSocket?.connected) {
            addDebugLog(
              `Subscribing to invest room: ${coin1}/${coin2}-${selectedTime}`
            );
            subscribeInvestPair(coin1, coin2, selectedTime);
          }
        }
      } catch (error) {
        console.error('Error during socket connection or subscription:', error);
        addDebugLog(`Connection error: ${error}`);
      }
    },
    [
      setStartTime,
      selectedTime,
      investmentActive,
      subscribePricePair,
      subscribeInvestPair,
      connectPrice,
      connectInvest,
      disconnectPrice,
      disconnectInvest,
      addDebugLog,
    ]
  );

  // Handle time click
  const handleTimeClick = useCallback(
    (time: string) => {
      setSelectedTime(time);
      setStartTime(null);

      // 투자가 진행중이 아닐 때만 새로운 방 구독
      if (!investmentActive) {
        const [coin1, coin2] = selectedPair;
        subscribeInvestPair(coin1, coin2, time);
        addDebugLog(`Investment room changed: ${coin1}/${coin2}-${time}`);
      }
    },
    [
      setStartTime,
      selectedPair,
      investmentActive,
      subscribeInvestPair,
      addDebugLog,
    ]
  );

  // Initialize button
  const initButton = useCallback(async () => {
    setInvestmentActive(false);
    setResult('');
    setStartTime(null);
    setEndTime(null);
    setInvestChoice(null);
    setStartPriceDifference(0);
    setFinalPriceDifference(0);

    // 새로운 방에 들어가기
    const [coin1, coin2] = selectedPair;
    subscribeInvestPair(coin1, coin2, selectedTime);
    addDebugLog(`🔄 Subscribed to new room: ${coin1}/${coin2}-${selectedTime}`);
  }, [
    selectedPair,
    selectedTime,
    subscribeInvestPair,
    setStartTime,
    setEndTime,
    setInvestChoice,
    setStartPriceDifference,
    setFinalPriceDifference,
  ]);

  // Handle investment completion
  const handleInvestmentComplete = useCallback(
    (startTime: number, investChoice: 'widen' | 'narrow') => {
      addDebugLog(startTime.toString());
      setInvestmentActive(true);
      setStartTime(startTime);
      setInvestChoice(investChoice);

      const durationInSeconds = calcDuration(selectedTime);
      setEndTime(startTime + durationInSeconds);
    },
    [setStartTime, setEndTime, setInvestChoice, selectedTime]
  );

  // iOS 소켓 재연결을 위한 새로운 useEffect 추가
  useEffect(() => {
    let cleanup = false;

    const handleConnectionRecovery = async () => {
      if (cleanup) return;

      addDebugLog(`🔄 Checking connections...`);

      try {
        // 가격 소켓 재연결
        const priceSocket = await connectPrice();
        addDebugLog(`Price socket connection result: ${!!priceSocket?.connected}`);
        
        if (priceSocket?.connected && selectedPair.length === 2) {
          const pairString = `${selectedPair[0]}/${selectedPair[1]}`;
          addDebugLog(`[Recovery] Attempting to subscribe to: ${pairString}`);
          await subscribePricePair(pairString);
        }

        // 투자 소켓 재연결
        if (!investmentActive && selectedPair.length === 2) {
          const investSocket = await connectInvest();
          if (investSocket?.connected) {
            const [coin1, coin2] = selectedPair;
            addDebugLog(
              ` Attempting to subscribe invest: ${coin1}/${coin2}-${selectedTime}`
            );
            subscribeInvestPair(coin1, coin2, selectedTime);
          }
        }
      } catch (error) {
        console.error(`Connection recovery failed:`, error);
        addDebugLog(`Connection recovery failed: ${error}`);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleConnectionRecovery();
    });
    window.addEventListener('focus', handleConnectionRecovery);
    window.addEventListener('online', handleConnectionRecovery);

    return () => {
      cleanup = true;
      document.removeEventListener('visibilitychange', () => {
        if (!document.hidden) handleConnectionRecovery();
      });
      window.removeEventListener('focus', handleConnectionRecovery);
      window.removeEventListener('online', handleConnectionRecovery);
    };
  }, [
    selectedPair,
    investmentActive,
    connectPrice,
    connectInvest,
    subscribePricePair,
    subscribeInvestPair,
  ]);

  // useEffect(() => {
  // priceData 변경 시 로그 추가
  // console.log('Price Data Update:', {
  //   timeLabels,
  //   priceData,
  //   coin1: selectedPair[0],
  //   coin2: selectedPair[1]
  // });
  // }, [timeLabels, priceData, selectedPair]);


  return (
    <Box w="100%" p={4} bg="#f5f5f5" pb={4}>
      <VStack spacing={4}>
        {/* Chart Display */}

        <Chart
          timeLabels={timeLabels}
          priceData={priceData}
          coin1Price={coin1Price}
          coin2Price={coin2Price}
          selectedPair={selectedPair}
          coin1Symbol={selectedPair[0]}
          coin2Symbol={selectedPair[1]}
        />
      </VStack>

      {/* Price Information */}
      <Flex
        direction="row"
        justify="space-between"
        align="center"
        p={2}
        bg="gray.800"
        color="white"
        rounded="xl"
        w="100%"
        boxShadow="lg"
        gap={2}
        mt={{ base: 1, md: 2 }}
      >
        <Box
          textAlign="center"
          p={1}
          borderRadius="lg"
          bg="rgba(229, 62, 62, 0.1)"
          flex={1}
          minWidth={0}
          overflow="hidden"
        >
          <Text
            fontSize={{ base: 'xs', sm: 'xs', md: 'lg' }}
            color="red.400"
            mb={0.5}
            fontWeight="medium"
            isTruncated
          >
            {higherSymbol} Price
          </Text>
          <VStack spacing={0} align="center">
            <Flex
              alignItems="center"
              justifyContent="center"
              position="relative"
              direction={{ base: 'column', md: 'row' }}
            >
              {useBreakpointValue({
                base: null, // 모바일에서는 아이콘을 표시하지 않음
                md: (
                  <Icon
                    as={
                      coinIcons[higherSymbol as keyof typeof coinIcons] ||
                      SiBitcoin
                    }
                    color="white"
                    boxSize="20px"
                    position="absolute"
                    left="-25px"
                    top="10px"
                  />
                ),
              })}
              <Text
                fontSize={{ base: 'xs', sm: 'md', md: '2xl' }}
                color="white"
                fontWeight="bold"
                letterSpacing="wide"
                isTruncated
                whiteSpace="nowrap"
                overflow="hidden"
                textAlign="center"
                marginRight={{ base: 0, md: '8px' }}
              >
                {formatTickValue(higherPrice.toLocaleString())}
              </Text>
              <Text
                fontSize={{ base: '2xs', sm: 'xs', md: '2xl' }}
                color="gray.400"
                fontWeight="bold"
                display={{ base: 'none', md: 'block' }}
              >
                USDT
              </Text>
            </Flex>
            <Text
              fontSize={{ base: '2xs', sm: 'xs', md: 'md' }}
              color="gray.400"
              fontWeight="bold"
              display={{ base: 'block', md: 'none' }}
            >
              USDT
            </Text>
          </VStack>
        </Box>

        <Box
          textAlign="center"
          px={4}
          py={2}
          borderRadius="lg"
          bg="rgba(49, 151, 149, 0.1)"
          flex={1}
          minWidth={0}
          borderLeft="1px"
          borderRight="1px"
          borderColor="whiteAlpha.200"
          overflow="hidden"
        >
          <Flex direction="column" align="center">
            <Text
              fontSize={{ base: 'xs', md: 'xl' }}
              color="teal.300"
              mb={1}
              fontWeight="bold"
              isTruncated
            >
              {t('general.price_difference')}
            </Text>
            <Flex align="center" justify="center" position="relative">
              {useBreakpointValue({
                base: null, // 모바일에서는 아이콘을 표시하지 않음
                md: (
                  <Icon
                    as={LiaChartLineSolid}
                    color="teal.300"
                    boxSize="30px"
                    position="absolute"
                    left="-35px"
                  />
                ),
              })}
              <Text
                fontSize={{ base: 'smaller', md: '3xl' }}
                color="teal.300"
                fontWeight="bold"
                whiteSpace="nowrap"
                overflow="hidden"
                textAlign="center"
              >
                {formatTickValue(priceDifference.toLocaleString())}
              </Text>
            </Flex>
          </Flex>
        </Box>

        <Box
          textAlign="center"
          p={1}
          borderRadius="lg"
          bg="rgba(66, 153, 225, 0.1)"
          flex={1}
          minWidth={0}
          overflow="hidden"
        >
          <Text
            fontSize={{ base: 'xs', sm: 'xs', md: 'lg' }}
            color="blue.400"
            mb={0.5}
            fontWeight="bold"
            isTruncated
          >
            {lowerSymbol} Price
          </Text>
          <VStack spacing={0} align="center">
            <Flex
              alignItems="center"
              justifyContent="center"
              position="relative"
              direction={{ base: 'column', md: 'row' }}
            >
              {useBreakpointValue({
                base: null, // 모바일에서는 아이콘을 표시하지 않음
                md: (
                  <Icon
                    as={
                      coinIcons[lowerSymbol as keyof typeof coinIcons] ||
                      SiBitcoin
                    }
                    color="white"
                    boxSize="20px"
                    position="absolute"
                    left="-25px"
                    top="10px"
                  />
                ),
              })}
              <Text
                fontSize={{ base: 'xs', sm: 'md', md: '2xl' }}
                color="white"
                fontWeight="bold"
                letterSpacing="wide"
                isTruncated
                whiteSpace="nowrap"
                overflow="hidden"
                textAlign="center"
                marginRight={{ base: 0, md: '8px' }}
              >
                {formatTickValue(lowerPrice.toLocaleString())}
              </Text>
              <Text
                fontSize={{ base: '2xs', sm: 'xs', md: '2xl' }}
                color="gray.400"
                fontWeight="bold"
                display={{ base: 'none', md: 'block' }}
              >
                USDT
              </Text>
            </Flex>
            <Text
              fontSize={{ base: '2xs', sm: 'xs', md: 'md' }}
              color="gray.400"
              fontWeight="bold"
              display={{ base: 'block', md: 'none' }}
            >
              USDT
            </Text>
          </VStack>
        </Box>
      </Flex>
      {/* Price Information end */}

      {investmentActive ? (
        <VStack spacing={{ base: 1, md: 4 }} mt={{ base: 1, md: 2 }}>
          {/* 타이머 섹션 */}
          <Box
            w="100%"
            bg="gray.800"
            borderRadius="xl"
            p={4}
            boxShadow="lg"
            color="white"
          >
            <InvestmentTimer
              startTime={startTime ?? 0}
              duration={calcDuration(selectedTime)}
              t={t}
              result={result}
              remainingTimeRef={remainingTimeRef}
              userPrediction={investChoice ?? ''}
            />
          </Box>

          {/* 가격 차이 비교 섹션 */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            w="100%"
            gap={{ base: 1, md: 2 }}
            mt={{ base: 0, md: 0 }}
            position="relative"
          >
            <Box
              bg="linear-gradient(135deg, #FDB813, #F6821F)"
              color="white"
              p={1}
              pt={1}
              borderRadius="xl"
              flex={1}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              borderWidth="2px"
              borderColor="rgba(255,255,255,0.2)"
              boxShadow="0 4px 20px rgba(253,184,19,0.3)"
              height={{ base: '80px', md: 'auto' }}
            >
              <VStack spacing={0.5}>
                <Box
                  bg="rgba(0,0,0,0.2)"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'lg',
                    border: '1px solid rgba(255,255,255,0.2)',
                    pointerEvents: 'none',
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {t('general.start_price_difference')}
                  </Text>
                </Box>
                <Text
                  fontSize={{ base: 'lg', md: '2xl' }}
                  fontWeight="bold"
                  fontFamily="mono"
                >
                  {startPriceDifference > 0
                    ? formatTickValue(startPriceDifference)
                    : '-'}
                </Text>
                <Badge
                  variant="subtle"
                  colorScheme="whiteAlpha"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt="auto"
                >
                  <Icon as={FiClock} />
                  {new Date(startTime! * 1000).toLocaleTimeString()}
                </Badge>
              </VStack>
            </Box>
            {/* Opening Gap Index와 Closing Gap Index 사이에 위치 */}
            <Box
              position="relative"
              w={{ base: '100%', md: 'auto' }}
              zIndex={1}
              bg={investChoice === 'widen' ? 'red.500' : 'blue.500'}
              color="white"
              px={4}
              py={1}
              borderRadius="xl"
              boxShadow="lg"
              fontWeight="bold"
              fontSize="md"
              display="flex"
              alignItems="center"
              gap={2}
              justifyContent="center"
              height={{ base: '40px', md: 'auto' }}
            >
              <HStack
                spacing={2}
                display={{ base: 'flex', md: 'inline-flex' }}
                align="center"
                w="100%"
                justifyContent="center"
                py={{ base: 0, md: 1 }}
              >
                <Text fontSize={{ base: 'sm', md: 'lg' }} lineHeight="1" mb={0}>
                  {t('general.my_choice')}
                </Text>
                <Badge
                  bg="whiteAlpha.300"
                  color="white"
                  px={2}
                  py={0}
                  borderRadius="md"
                  fontSize={{ base: 'xs', md: '2xl' }}
                  whiteSpace="normal"
                  lineHeight="2"
                >
                  {investChoice === 'widen' ? 'WIDEN' : 'NARROW'}
                </Badge>
              </HStack>
            </Box>

            <Box
              bg="linear-gradient(135deg, #805AD5, #553C9A)"
              color="white"
              p={1}
              pt={1}
              borderRadius="xl"
              flex={1}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              borderWidth="2px"
              borderColor="rgba(255,255,255,0.2)"
              boxShadow="0 4px 20px rgba(128,90,213,0.3)"
              height={{ base: '80px', md: 'auto' }}
            >
              <VStack spacing={0.5}>
                <Box
                  bg="rgba(0,0,0,0.2)"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'lg',
                    border: '1px solid rgba(255,255,255,0.2)',
                    pointerEvents: 'none',
                  }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {t('general.end_price_difference')}
                  </Text>
                </Box>
                <Text
                  fontSize={{ base: 'lg', md: '2xl' }}
                  fontWeight="bold"
                  fontFamily="mono"
                >
                  {finalPriceDifference > 0
                    ? formatTickValue(finalPriceDifference)
                    : '-'}
                </Text>
                <Badge
                  variant="subtle"
                  colorScheme="whiteAlpha"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt="auto"
                >
                  <Icon as={FiFlag} />
                  {new Date(endTime! * 1000).toLocaleTimeString()}
                </Badge>
              </VStack>
            </Box>
          </Flex>

          {/* 재시도 버튼 */}
          {startTime != null &&
            endTime != null &&
            Math.floor(Date.now() / 1000) > (endTime || 0) && (
              <Box w="full" mt={0.1} mb={0.1}>
                <Button
                  w="full"
                  h={{ base: '60px', md: '70px' }}
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight="bold"
                  bg="linear-gradient(135deg, #00B5D8, #319795)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #00A3C4, #2C7A7B)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'linear-gradient(135deg, #0987A0, #285E61)',
                    transform: 'translateY(0)',
                  }}
                  leftIcon={
                    <Icon
                      as={LiaChartLineSolid}
                      boxSize={{ base: 5, md: 6 }}
                      mr={2}
                    />
                  }
                  onClick={initButton}
                  isDisabled={!isFullyAuthenticated}
                  boxShadow="0px 4px 20px rgba(0, 181, 216, 0.3)"
                  transition="all 0.2s ease"
                  borderRadius="xl"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text mr={2}>{t('general.retry')}</Text>
                </Button>
              </Box>
            )}
        </VStack>
      ) : (
        <VStack spacing={3} mt={4}>
          <Flex
            direction={flexDirection}
            justify="space-between"
            w="100%"
            gap={4}
          >
            <HStack spacing={2} w="100%">
              {['BTC/ETH', 'BTC/SOL', 'BTC/BCH'].map((pair) => (
                <Button
                  key={pair}
                  colorScheme={
                    selectedPair.join('/') === pair ? 'purple' : 'pink'
                  }
                  variant={
                    selectedPair.join('/') === pair ? 'solid' : 'outline'
                  }
                  onClick={() => handleCoinPairClick(pair)}
                  leftIcon={
                    selectedPair.join('/') === pair ? <CheckIcon /> : undefined
                  }
                  w="100%"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {pair}
                </Button>
              ))}
            </HStack>
            <HStack spacing={2} w="100%">
              {['1 MIN', '2 MIN', '3 MIN'].map((time) => (
                <Button
                  key={time}
                  colorScheme={selectedTime === time ? 'cyan' : 'teal'}
                  variant={selectedTime === time ? 'solid' : 'outline'}
                  onClick={() => handleTimeClick(time)}
                  leftIcon={selectedTime === time ? <CheckIcon /> : undefined}
                  isDisabled={!isLoggedIn}
                  w="100%"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {time}
                </Button>
              ))}
            </HStack>
          </Flex>
          <HStack spacing={2} w="100%">
            {['1 USDT', '25 USDT', '50 USDT'].map((amount) => (
              <Button
                key={amount}
                colorScheme={selectedUsdt === amount ? 'green' : 'teal'}
                variant={selectedUsdt === amount ? 'solid' : 'outline'}
                onClick={() => setSelectedUsdt(amount)}
                leftIcon={selectedUsdt === amount ? <CheckIcon /> : undefined}
                isDisabled={!isFullyAuthenticated}
                w="100%"
                fontSize={{ base: 'sm', md: 'md' }}
              >
                {amount}
              </Button>
            ))}
          </HStack>
          {!isFullyAuthenticated ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  w="100%"
                  h="40px"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight="bold"
                  bg="linear-gradient(135deg, #00B5D8, #319795)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #00A3C4, #2C7A7B)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  _active={{
                    bg: 'linear-gradient(135deg, #0987A0, #285E61)',
                    transform: 'translateY(0)',
                  }}
                  boxShadow="0px 4px 20px rgba(0, 181, 216, 0.3)"
                  transition="all 0.2s ease"
                  borderRadius="xl"
                  onClick={() => {
                    logEvent('connect', 'wallet', 'invest_connect_button');
                    openConnectModal();
                  }}
                >
                  {t('auth.connectWallet')}
                </Button>
              )}
            </ConnectButton.Custom>
          ) : (
            <InvestButtons
              usdt={parseUsdtAmount(selectedUsdt)}
              coinPair={selectedPair}
              duration={selectedTime}
              loginState={Boolean(isFullyAuthenticated)}
              onInvestmentComplete={handleInvestmentComplete}
            />
          )}
        </VStack>
      )}

      {/* Users Online and widen/narrow count */}
      <Flex
        justify="space-between"
        align="center"
        py={{ base: 0.75, md: 2 }}
        px={3}
        bg="#062127"
        color="white"
        rounded="xl"
        w="100%"
        maxW="100%"
        overflow="hidden"
        mx="auto"
        position="relative"
        boxShadow="sm"
        mt={{ base: 1, md: 3 }}
      >
        <Stat textAlign="center" p={1} flex="1" overflow="hidden">
          <StatLabel
            color="red.200"
            fontSize={{ base: 'xs', md: 's' }}
            fontWeight="bold"
          >
            {t('general.widen')}
          </StatLabel>
          <StatNumber
            fontSize={{ base: 'lg', md: 'xl' }}
            color="red.100"
            fontWeight="bold"
          >
            {widenCount}
          </StatNumber>
        </Stat>

        <Stat
          textAlign="center"
          p={1}
          flex="1"
          borderLeft="1px"
          borderRight="1px"
          borderColor="whiteAlpha.200"
          overflow="hidden"
        >
          <StatLabel
            color="green.200"
            fontSize={{ base: 'xs', md: 's' }}
            fontWeight="bold"
          >
            {t('general.total_clients')} [{currentRoom}]
          </StatLabel>
          <StatNumber
            fontSize={{ base: 'lg', md: '2xl' }}
            color="green.100"
            fontWeight="bold"
          >
            {clientsInRoom}
          </StatNumber>
          <Badge
            colorScheme="whiteAlpha"
            variant="subtle"
            mt={0.5}
            fontSize={{ base: '2xs', md: 'sm' }}
          >
            ONLINE
          </Badge>
        </Stat>

        <Stat textAlign="center" p={1} flex="1" overflow="hidden">
          <StatLabel
            color="blue.200"
            fontSize={{ base: 'xs', md: 's' }}
            fontWeight="bold"
          >
            {t('general.narrow')}
          </StatLabel>
          <StatNumber
            fontSize={{ base: 'lg', md: 'xl' }}
            color="blue.100"
            fontWeight="bold"
          >
            {narrowCount}
          </StatNumber>
        </Stat>
      </Flex>
      {/* Users Online and widen/narrow count end */}

      {/* Debug Logs - 화면 하단에 표시 */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="blackAlpha.800"
        color="white"
        p={2}
        maxH="200px"
        overflowY="auto"
        fontSize="xs"
        zIndex={1000}
      >
        {debugLogs.map((log, index) => (
          <Text key={`app-${index}`} mb={1}>
            {log}
          </Text>
        ))}
        {priceDebugLogs.map((log: string, index: number) => (
          <Text key={`price-${index}`} mb={1} color="blue.200">
            {log}
          </Text>
        ))}
        {investDebugLogs.map((log: string, index: number) => (
          <Text key={`price-${index}`} mb={1} color="red.200">
            {log}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default MainScreen;
