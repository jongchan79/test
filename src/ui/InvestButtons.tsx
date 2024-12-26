import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react';
import { useInvestStore } from '../store/useInvestStore';
import { Abi, erc20Abi, parseUnits } from 'viem';
import { useTokenApproval } from '../hooks/useTokenApproval';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContracts,
} from 'wagmi';
import { useAbiStore } from '../store/useAbiStore';
import ErrorModal from '../components/ErrorModal';
import { decodeEventLog } from 'viem';
import { t } from 'i18next';
import { calcDuration, calculateStartTime, getReadableErrorMessage, type InvestmentError } from '../utils/investmentUtils';
import { logEvent } from '../utils/analytics';

interface InvestButtonsProps {
  coinPair: string[];
  duration: string;
  loginState: boolean;
  usdt: string;
  onInvestmentComplete: (
    startTime: number,
    investChoice: 'widen' | 'narrow'
  ) => void;
}


const InvestButtons: React.FC<InvestButtonsProps> = ({
  coinPair,
  duration,
  loginState,
  usdt,
  onInvestmentComplete,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
  const [investHash, setInvestHash] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  // const [approveTx, setApproveTx] = useState<`0x${string}` | undefined>();
  const abi = useAbiStore((state) => state.abi);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`;
  const {
    socket,
    currentRoom,
    connect: connectInvest,
    updateInvestNo,
    subscribeInvestPair
  } = useInvestStore();
  const { address } = useAccount();
  const [investChoice, setInvestChoice] = useState<'widen' | 'narrow'>('widen');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { checkAndApprove, currentAllowance } = useTokenApproval(usdtAddress, contractAddress);

  const {
    isLoading: isInvestConfirming,
    isSuccess: isInvestConfirmed,
    data: investReceipt,
  } = useWaitForTransactionReceipt({ hash: investHash });

  const {
    data: usdtBalance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useReadContracts({
    allowFailure: true,
    contracts: address ? [
      {
        address: usdtAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
    ] : [],
  });

  useEffect(() => {
    if (!abi) {
      console.log('ABI not loaded yet');
    }
  }, [abi]);

  useEffect(() => {
    if (investReceipt && isInvestConfirmed) {
      const logs = investReceipt.logs.map(log => {
        const eventSignature = log.topics[0];
        
        if (eventSignature === '0x09c8c6905032ffdf346b9078dc68182e8dece2455e124e28b2bd3359389a9ab8') {
          try {
            return decodeEventLog({
              abi: abi as Abi,
              data: log.data,
              topics: log.topics,
            })
          } catch (error) {
            console.error('Failed to decode log:', error)
            return null;
          }
        }
        return null;
      }).filter(Boolean);

      const investEvent = logs.find(
        (log) => log?.eventName === 'InvestmentMade'
      );

      if (
        investEvent &&
        'args' in investEvent &&
        investEvent.args &&
        'roomId' in investEvent.args
      ) {
        const investmentId = Number(investEvent.args.roomId);
        console.log('Investment ID:', investmentId);

        // send socket data
        if (socket) {
          console.log('socket emit');

          updateInvestNo({
            investChoice: investChoice,
            investNo: String(investmentId),
            coinPair: coinPair[0] + '/' + coinPair[1],
            duration: parseInt(duration.replace(' MIN', '')),
            tokenAddress: usdtAddress,
            starttime: calculateStartTime(duration),
          });

          console.log(`starttime: ${calculateStartTime(duration)}`);
          console.log(`duration: ${duration}`);
          onInvestmentComplete(calculateStartTime(duration), investChoice);
        } else {
          console.error('socket not set');
        }
      } else {
        console.error('Invalid invest event structure:', investEvent);
      }
    }
  }, [
    investReceipt,
    abi,
    socket,
    investChoice,
    coinPair,
    duration,
    usdtAddress,
    isInvestConfirmed,
    onInvestmentComplete,
    updateInvestNo,
  ]);

  const isInvestmentError = (error: unknown): error is InvestmentError => {
    if (typeof error === 'string') return true;
    if (error && typeof error === 'object') {
      return 'code' in error || 'message' in error;
    }
    return false;
  };

  const handleInvest = useCallback(
    async (prediction: 'widen' | 'narrow') => {
      if (!currentRoom) {
        setErrorMessage('general.room_not_connected');
        onOpen();
        
        // 3초 후 자동으로 재연결 시도
        setTimeout(async () => {
          try {
            await connectInvest();
            const [coin1, coin2] = coinPair;
            const formattedDuration = duration.replace(/\s+/g, '');
            subscribeInvestPair(coin1, coin2, formattedDuration);
            
            setErrorMessage('general.reconnecting');
            setTimeout(() => {
              onClose();
            }, 2000);
          } catch (error) {
            console.error('Reconnection failed:', error);
            window.location.reload();
          }
        }, 3000);
        return;
      }

      // 소켓 연결 상태 확인 및 자동 재연결
      if (!socket || !socket.connected) {
        setErrorMessage('general.socket_reconnecting');
        onOpen();
        
        try {
          await connectInvest();
          const [coin1, coin2] = coinPair;
          const formattedDuration = duration.replace(/\s+/g, '');
          subscribeInvestPair(coin1, coin2, formattedDuration);
          
          setErrorMessage('general.reconnected');
          setTimeout(() => {
            onClose();
          }, 2000);
        } catch (error) {
          console.error('Socket reconnection failed:', error);
          setErrorMessage('general.socket_reconnection_failed');
        }
        return;
      }

      logEvent('invest', 'trading', `${prediction}_investment`, parseFloat(usdt));
      setIsLoading(true);
      setInvestChoice(prediction);
      const amount = parseUnits(usdt, 18);

      try {
        if (!address) {
          throw new Error('Wallet not connected');
        }

        if (!usdtAddress) {
          throw new Error('USDT contract address not configured');
        }

        console.log('=== Investment Debug Info ===');
        console.log('Wallet Address:', address);
        console.log('USDT Address:', usdtAddress);
        console.log('USDT Balance:', usdtBalance?.[0]);
        console.log('Required Amount:', amount);
        console.log('Current Allowance:', currentAllowance);

        if (isBalanceError) {
          throw new Error('Failed to fetch USDT balance');
        }
        if (isBalanceLoading) {
          throw new Error('Balance is still loading');
        }
        if (!usdtBalance?.[0]?.result || usdtBalance[0].result < amount) {
          throw new Error('Insufficient USDT balance');
        }

        // allowance가 충분한 경우 바로 invest 호출
        if (currentAllowance >= amount) {
          const investmentParams = {
            tokenAddress: usdtAddress,
            amount: amount,
            coinPair: coinPair[0] + '/' + coinPair[1],
            prediction: BigInt(prediction === 'narrow' ? 0 : 1),
            duration: BigInt(calcDuration(duration)),
            startTime: BigInt(calculateStartTime(duration)),
          };
          
          const result = await writeContractAsync({
            address: contractAddress,
            abi: abi as Abi,
            functionName: 'invest',
            args: [investmentParams],
          });

          console.log('Investment transaction hash:', result);
          setInvestHash(result);
        } else {
          // allowance가 부족한 경우 approve 트랜잭션 실행
          const approveHash = await checkAndApprove(amount) as `0x${string}`;
          setApproveHash(approveHash);
          console.log('Approval transaction sent:', approveHash);
        }
      } catch (err) {
        console.error('Investment error:', err);
        if (isInvestmentError(err)) {
          setErrorMessage(getReadableErrorMessage(err));
        } else {
          setErrorMessage(getReadableErrorMessage('Unknown error occurred'));
        }
        onOpen();
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentRoom,
      socket,
      address,
      usdtAddress,
      isBalanceError,
      isBalanceLoading,
      usdtBalance,
      duration,
      usdt,
      onOpen,
      checkAndApprove,
      currentAllowance,
      coinPair,
      contractAddress,
      abi,
      writeContractAsync,
      connectInvest,
      onClose,
      subscribeInvestPair
    ]
  );

  useEffect(() => {
    if (isApproveConfirmed && approveHash) {  // approveHash 체크 추가
      const invest = async () => {
        try {
          const investmentParams = {
            tokenAddress: usdtAddress,
            amount: parseUnits(usdt, 18),
            coinPair: coinPair[0] + '/' + coinPair[1],
            prediction: BigInt(investChoice === 'narrow' ? 0 : 1),
            duration: BigInt(calcDuration(duration)),
            startTime: BigInt(calculateStartTime(duration)),
          };
          
          const result = await writeContractAsync({
            address: contractAddress,
            abi: abi as Abi,
            functionName: 'invest',
            args: [investmentParams],
          });

          console.log('Investment transaction hash:', result);
          setInvestHash(result);
        } catch (err) {
          console.error('Investment error:', err);
          setErrorMessage(getReadableErrorMessage(err as InvestmentError));
          onOpen();
        }
      };
      invest();
    }
  }, [
    isApproveConfirmed,
    approveHash,  // 의존성 배열에 approveHash 추가
    writeContractAsync,
    usdtAddress,
    coinPair,
    investChoice,
    duration,
    contractAddress,
    abi,
    onOpen,
    usdt
  ]);

  if (!abi) {
    return <div>Loading ABI...</div>;
  }

  return (
    <VStack spacing={4} w="100%">
      <HStack spacing={4} w="100%">
        <Button
          w="50%"
          h="50px"
          colorScheme="red"
          leftIcon={<ArrowUpIcon />}
          isLoading={isLoading && investChoice === 'widen'}
          onClick={() => handleInvest('widen')}
          isDisabled={!loginState || isApproveConfirming || isInvestConfirming}
        >
          {t('general.widen')}
        </Button>
        <Button
          w="50%"
          h="50px"
          colorScheme="blue"
          leftIcon={<ArrowDownIcon />}
          isLoading={isLoading && investChoice === 'narrow'}
          onClick={() => handleInvest('narrow')}
          isDisabled={!loginState || isApproveConfirming || isInvestConfirming}
        >
          {t('general.narrow')}
        </Button>
      </HStack>
      <ErrorModal
        isOpen={isOpen}
        onClose={onClose}
        messageKey={errorMessage}
        buttons={[{ labelKey: 'Close', onClick: onClose, colorType: 'cancel' }]}
        iconType="error"
      />

      <Modal
        isOpen={isApproveConfirming || isInvestConfirming}
        onClose={() => {}}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody textAlign="center" py={10}>
            <Spinner size="xl" mb={4} />
            <Text fontSize="lg" fontWeight="bold">
              {isApproveConfirming
                ? 'Approving Transaction...'
                : 'Processing Investment...'}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Processing your transaction. Please wait.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default InvestButtons;