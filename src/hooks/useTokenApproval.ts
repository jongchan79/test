import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';

export const useTokenApproval = (tokenAddress: `0x${string}`, spenderAddress: `0x${string}`) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, spenderAddress] : undefined,
    query: {
      enabled: Boolean(address)
    }
  });

  const allowance = async (): Promise<bigint> => {
    if (!address) return BigInt(0);
    const result = await refetchAllowance();
    return result.data ?? BigInt(0);
  };

  const checkAndApprove = async (amount: bigint): Promise<string> => {
    try {
      const currentAllowance = await allowance();
      
      if (currentAllowance >= amount) {
        console.log('Sufficient allowance:', currentAllowance.toString());
        return 'approval passed'; // approval 불필요
      }

      console.log('Insufficient allowance. Approving...');
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spenderAddress, amount],
      });

      if (!hash) throw new Error('Approval transaction failed');
      
      return hash; // approval 필요했고 실행됨
      
    } catch (error) {
      console.error('Approval error:', error);
      throw error;
    }
  };

  return {
    checkAndApprove,
    allowance,
    currentAllowance: allowanceData ?? BigInt(0)
  };
}; 