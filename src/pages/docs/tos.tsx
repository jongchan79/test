// src/components/pages/docs/tos.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Container,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

const TermsOfService = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  useEffect(() => {
    // 현재 페이지가 영문 페이지이고 언어가 스페인어로 변경되었을 때
    if (i18n.language === 'es' && router.pathname === '/docs/tos') {
      console.log('Switching to Spanish ToS...');
      router.push('/docs/tos_es');
    }
  }, [i18n.language, router]); // router 의존성 제거, 언어 변경만 감지

  return (
    <Box bg="white" color="black" py={8} px={4}>
      <Container maxW="800px">
        <Heading as="h1" fontSize="3xl" mb={6}>
          Terms of Service
        </Heading>
        <Text mb={4} textAlign="right">
          Last Updated: <em>October 9th, 2024</em>
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          1. Introduction
        </Heading>
        <Text mb={4}>
          Welcome to GFEX (Gapped Futures Exchange) (“GFEX,” “we,” “us,” or
          “our”). These Terms of Service (“Terms”) govern your access to and use
          of our platform and any other features or services provided in
          connection with GFEX (collectively, the “Service”).
        </Text>
        <Text mb={4}>
          By using the Service, you agree to comply with and be bound by these
          Terms.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          2. Services
        </Heading>
        <Text mb={4}>
          GFEX offers a decentralized platform that allows users to engage in
          cryptocurrency futures trading by forecasting price gaps between two
          crypto assets (“Service”). GFEX operates using a Web3 infrastructure,
          meaning users connect their cryptocurrency wallets directly to the
          platform to facilitate trades. GFEX does not manage or control User
          wallets, nor do we execute or effectuate trades on behalf of Users.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          3. Accessing the Service
        </Heading>
        <Text mb={4}>
          To use GFEX, you must have a blockchain address and a third-party
          wallet. Your account will be associated with your blockchain address.
          GFEX does not have control or custody over your wallet, and it is your
          responsibility to ensure the security of your wallet and private keys.
          GFEX is not liable for any unauthorized access or use of your wallet.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          4. Fee Schedule
        </Heading>
        <Text mb={4}>
          GFEX has a two-part fee structure: a 1% transaction fee on all trades,
          and an additional 3% fee on profitable trades, applied to both the
          profit and the principal.
        </Text>

        <Heading as="h3" fontSize="lg" mb={2}>
          Example
        </Heading>
        <Text mb={4}>
          Fee application and profit calculation when the directional investment
          decision was correct:
        </Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Index</Th>
              <Th>Widen</Th>
              <Th>Narrow</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Number of Traders</Td>
              <Td>147</Td>
              <Td>211</Td>
            </Tr>
            <Tr>
              <Td>Trader Ratio</Td>
              <Td>41.06%</Td>
              <Td>58.94%</Td>
            </Tr>
            <Tr>
              <Td>Pool Total (1% entrance fee applied)</Td>
              <Td>$1,455.30</Td>
              <Td>$2,088.90</Td>
            </Tr>
            <Tr>
              <Td>Earning on a $10 Investment</Td>
              <Td>$14.21</Td>
              <Td>$6.90</Td>
            </Tr>
            <Tr>
              <Td>After 3% Fee Deduction</Td>
              <Td>$13.78</Td>
              <Td>$6.69</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Total Amount after the Trade</strong>
              </Td>
              <Td>
                <strong>$24.11</strong>
              </Td>
              <Td>
                <strong>$16.80</strong>
              </Td>
            </Tr>
          </Tbody>
        </Table>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          5. Modifications to Terms
        </Heading>
        <Text mb={4}>
          GFEX may modify these Terms at any time. Any updates will be effective
          immediately upon posting on the platform. Users are responsible for
          reviewing the Terms regularly. Continued use of the Service
          constitutes acceptance of any modified Terms.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          6. Service Availability
        </Heading>
        <Text mb={4}>
          Your access to and use of the Service may occasionally be interrupted
          for various reasons, such as equipment failure, scheduled updates,
          maintenance, or repairs to the platform. Additionally, access may be
          affected due to geographic restrictions, suspected violations of these
          Terms, or other actions GFEX may choose to take at its discretion.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          7. Termination of Service
        </Heading>
        <Text mb={4}>
          GFEX reserves the right to terminate or suspend User access to the
          platform at any time, for any reason, including violation of these
          Terms. Termination may occur without prior notice or liability.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          8. Disclaimer
        </Heading>
        <Text mb={4}>
          By agreeing to these Terms, Users shall be deemed to have agreed to
          the Disclaimer provided on our website. For further details, please
          review the full Disclaimer.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          9. Language
        </Heading>
        <Text mb={4}>
          These Terms are available in English and may be translated into other
          languages. In the event of any discrepancy between the English version
          and translations, the English version will prevail.
        </Text>
      </Container>
    </Box>
  );
};

export default TermsOfService;
