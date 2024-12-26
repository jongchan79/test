import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Progress, Badge } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const resultAnimation = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

interface InvestmentTimerProps {
  startTime: number;
  duration: number;
  t: (key: string) => string;
  result: string;
  remainingTimeRef: React.MutableRefObject<number>;
  userPrediction: string;
}

const InvestmentTimer: React.FC<InvestmentTimerProps> = ({
  startTime,
  duration,
  t,
  result,
  remainingTimeRef,
  userPrediction,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isPreStart, setIsPreStart] = useState(true);

  useEffect(() => {
    console.log('Current result:', result);

    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);

      if (now < startTime) {
        const preStartRemaining = startTime - now;
        setTimeLeft(preStartRemaining);
        setIsPreStart(true);
        setProgress((preStartRemaining / 60) * 100);
      } else {
        const endTime = startTime + duration;
        const remaining = Math.max(0, endTime - now);
        remainingTimeRef.current = remaining;
        setTimeLeft(remaining);
        setIsPreStart(false);
        setProgress((remaining / duration) * 100);
      }

      if (now >= startTime + duration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, remainingTimeRef, result]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isPreStart) {
      if (timeLeft <= 10) return t('investmentTimer.starting_soon');
      return t('investmentTimer.starts_in');
    }

    if (timeLeft === 0)
      return `${t('general.result_base')} ${
        result === 'widen'
          ? t('general.result_widen')
          : t('general.result_narrow')
      }`;
    if (timeLeft <= 10) return t('investmentTimer.ending_soon');
    return t('investmentTimer.in_progress');
  };

  const getStatusColor = () => {
    if (isPreStart) {
      return timeLeft <= 10 ? 'orange.500' : 'yellow.500';
    }

    if (timeLeft === 0) return result === 'widen' ? 'red.500' : 'blue.500';
    if (timeLeft <= 10) return 'red.500';
    return 'green.500';
  };

  const progressProps = {
    value: progress,
    size: 'md',
    colorScheme: isPreStart ? 'yellow' : timeLeft <= 10 ? 'red' : 'green',
    borderRadius: 'full',
    hasStripe: true,
    isAnimated: true,
    bg: 'gray.700',
    transition: 'all 0.3s ease-in-out',
    sx: {
      '& > div': {
        transition: 'width 0.1s linear',
      },
    },
  };

  return (
    <VStack spacing={{ base: 0.5, md: 4 }} w="100%" position="relative">
      <Box w="100%" position="relative" height="auto">
        <HStack justify="center" spacing={4} mb={2}>
          <Badge
            colorScheme={
              isPreStart
                ? 'yellow'
                : timeLeft === 0
                  ? result === 'widen'
                    ? 'red'
                    : 'blue'
                  : 'green'
            }
            px={4}
            py={2}
            borderRadius="xl"
            fontSize={window.innerWidth < 768 ? 'sm' : 'lg'}
            fontWeight="bold"
            bg="white"
            color={getStatusColor()}
            whiteSpace={window.innerWidth < 768 ? 'normal' : 'nowrap'}
            textAlign="center"
          >
            {isPreStart
              ? t('investmentTimer.starts_in')
              : timeLeft === 0
                ? getStatusText()
                : t('investmentTimer.in_progress')}
          </Badge>
          <Badge
            px={4}
            py={2}
            bg={getStatusColor()}
            color="white"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { base: '80px', md: '100px' },
              height: { base: '40px', md: '50px' },
              borderRadius: '8px',
              boxShadow: timeLeft <= 10 ? `0 0 20px ${getStatusColor()}90` : 'none',
              borderWidth: '4px',
              borderStyle: 'solid',
              borderColor: getStatusColor(),
              animation: timeLeft <= 10 ? `${pulseAnimation} 1s infinite` : 'none',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <Text 
              color="white" 
              fontSize={window.innerWidth < 768 ? '3xl' : '5xl'}
              fontFamily="'Digital7', monospace"
            >
              {timeLeft === 0 ? '✓' : formatTime(timeLeft)}
            </Text>
          </Badge>
        </HStack>

        <Progress
          {...progressProps}
          colorScheme={isPreStart ? 'yellow' : timeLeft <= 10 ? 'red' : 'green'}
        />

        {timeLeft === 0 && (
          <VStack spacing={2} mt={3}>
            <HStack spacing={3} justify="center">
              <Badge
                colorScheme={userPrediction === result ? 'green' : 'red'}
                variant="outline"
                px={3}
                py={1}
                borderRadius="full"
                animation={`${resultAnimation} 0.5s ease-out 0.4s`}
                textAlign={window.innerWidth < 768 ? 'center' : 'inherit'}
                fontSize={window.innerWidth < 768 ? 'xs' : 'lg'}
                whiteSpace={window.innerWidth < 768 ? 'normal' : 'nowrap'}
              >
                {userPrediction === result
                  ? t('investmentTimer.correct_bonus')
                  : t('investmentTimer.wrong_penalty')}
              </Badge>
            </HStack>
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

export default InvestmentTimer;
