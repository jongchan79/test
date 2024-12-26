// src/components/pages/docs/disclaimer.tsx
import { Box, Container, Text, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const Disclaimer = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  useEffect(() => {
    // 현재 페이지가 영문 페이지이고 언어가 스페인어로 변경되었을 때
    if (i18n.language === 'es' && router.pathname === '/docs/disclaimer') {
      console.log('Switching to Spanish disclaimer...');
      router.push('/docs/disclaimer_es');
    }
  }, [i18n.language, router]); // router 의존성 추가

  return (
    <Container maxW="800px" py={8} px={4}>
      <Heading as="h1" fontSize="3xl" mb={6} textAlign="center">
        Disclaimer
      </Heading>
      <Text mb={4} textAlign="right">
        Last Updated: <em>Oct 9th, 2024</em>
      </Text>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          1. General Information
        </Heading>
        <Text mb={4}>
          GFEX (Gapped Futures Exchange) is a decentralized exchange (DEX) built
          on the Binance Smart Chain (BSC), offering futures trading based on
          predicting price gaps between virtual assets. As a Web3 platform, GFEX
          does not require users to log in or provide personal information.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          2. Regulatory Compliance
        </Heading>
        <Text mb={4}>
          GFEX minimizes regulatory exposure by not collecting personal data.
          However, users are responsible for complying with local laws and
          regulations relevant to their jurisdiction. GFEX is not liable for any
          legal issues arising from the use of the platform.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          3. Service Availability
        </Heading>
        <Text mb={4}>
          GFEX retrieves price data from external exchange APIs, including major
          exchanges and cryptocurrency price information providers. This
          approach mitigates concerns about price manipulation or fraudulent
          activity. While GFEX uses these external indexes, it does not set or
          control them and is not responsible for their accuracy, reliability,
          or timing. Users should be aware that market prices can fluctuate
          rapidly, and GFEX disclaims any responsibility for trading decisions
          based on these price indexes.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          4. User Responsibility
        </Heading>
        <Text mb={4}>
          <b>A. Security:</b> Users must secure their wallets, private keys, and
          authentication methods. Any loss or compromise of these credentials
          may result in loss of virtual assets and access to the account. GFEX
          is not liable for losses due to user negligence.
        </Text>
        <Text mb={4}>
          <b>B. Regulatory Compliance:</b> Users must ensure their use of the
          platform complies with all applicable laws and regulations. GFEX is
          not responsible for legal issues related to platform use.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          5. Risk Warning
        </Heading>
        <Text mb={4}>
          <b>A. Investment Risk:</b> Trading futures and predicting virtual
          asset price gaps involve significant risk and can result in
          substantial financial losses. Due to the high volatility of virtual
          assets, users should only invest amounts they can afford to lose.
        </Text>
        <Text mb={4}>
          <b>B. Market Risk:</b> The cryptocurrency market is highly volatile
          and influenced by market sentiment, regulatory changes, technological
          developments, and other factors.
        </Text>
        <Text mb={4}>
          <b>C. Regulatory Risk:</b> GFEX, as a decentralized platform, may be
          subject to varying regulations. Users are responsible for
          understanding and adhering to local laws and regulations regarding
          virtual asset trading.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          6. No Warranty
        </Heading>
        <Text mb={4}>
          GFEX is provided on an &quot;as is&quot; and &quot;as available&quot; basis. 
          We do not guarantee the accuracy, reliability, or completeness of the information 
          or services provided. Users acknowledge that they use the platform at their own risk. 
          GFEX disclaims all warranties, whether express or implied.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          7. Not Financial Advice
        </Heading>
        <Text mb={4}>
          The information provided by GFEX does not constitute investment,
          financial, or trading advice. Users should conduct their own research
          and consult a financial advisor before making any investment
          decisions. Content on the platform is for informational purposes only
          and should not be considered professional advice.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          8. Limitation of Liability
        </Heading>
        <Text mb={4}>
          GFEX, its affiliates, and service providers are not liable for any
          direct, indirect, incidental, special, consequential, or punitive
          damages arising from platform use. This includes, but is not limited
          to, loss of profits, data, or other intangible losses. Where the law
          does not allow exclusion or limitation of liability for certain
          damages, liability is limited to the maximum extent permitted by law.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          9. Indemnification
        </Heading>
        <Text mb={4}>
          Users agree to indemnify, defend, and hold harmless GFEX, its
          affiliates, and their respective officers, directors, employees, and
          agents from any claims, liabilities, damages, losses, costs, and
          expenses, including reasonable attorneys&apos; fees, related to their
          use of the platform, any violation of this disclaimer, or any
          infringement of others&apos; rights.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          10. Intellectual Property
        </Heading>
        <Text mb={4}>
          All content, trademarks, and data on the GFEX platform are owned by
          GFEX and its affiliates. Unauthorized use or reproduction of the
          platform&apos;s content is prohibited. Users are granted a limited,
          non-exclusive, non-transferable license to access and use the platform
          for personal, non-commercial purposes only.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          11. Acceptance of Terms
        </Heading>
        <Text mb={4}>
          By using GFEX, you agree to this disclaimer in its entirety. If you
          disagree with any part of this disclaimer, you should not use the
          platform. Continued use of the platform signifies acceptance of any
          changes to this disclaimer.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          12. Further Information
        </Heading>
        <Text mb={4}>
          For additional information, please refer to our &quot;Terms of Service&quot;
          section available on the footer of our website.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          13. News and Updates
        </Heading>
        <Text mb={4}>
          For the latest news and updates, please refer to the official X or
          Medium links located in the footer menu of the website.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          14. Last Updated
        </Heading>
        <Text mb={4}>
          On October 9th, 2024. This disclaimer may be updated or modified
          without prior notice. Users are encouraged to review the disclaimer
          periodically for any changes.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          15. Languages
        </Heading>
        <Text mb={4}>
          This disclaimer is available in English and may be translated into
          other languages. In the event of any discrepancy between the English
          version and translations, the English version will prevail.
        </Text>
      </Box>
    </Container>
  );
};

export default Disclaimer;
