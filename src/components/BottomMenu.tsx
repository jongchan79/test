import { useTranslation } from 'react-i18next';
import {
  Box,
  HStack,
  Link,
  Text,
  Container,
  Center,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpointValue,
  IconButton,
  MenuDivider,
} from '@chakra-ui/react';
import Image from 'next/image';
import { HamburgerIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

const BottomMenu = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Get the correct links based on the language
  const tosLink = i18n.language === 'es' ? '/docs/tos_es' : '/docs/tos';
  const disclaimerLink =
    i18n.language === 'es' ? '/docs/disclaimer_es' : '/docs/disclaimer';
  // const subscribeLink =
  //   i18n.language === 'es' ? '/docs/subscribe_es' : '/docs/subscribe';
  // const unsubscribeLink =
  //   i18n.language === 'es' ? '/docs/unsubscribe_es' : '/docs/unsubscribe';

  return (
    <Box as="footer" bg="#062127" w="100%" p={4} color="black" mt={8}>
      <Container maxW="1204px">
        <HStack justifyContent="space-between" alignItems="center">
          <Box w={isMobile ? '90px' : '150px'} h={isMobile ? '90px' : '150px'}>
            <Image
              src={'/images/logo_bottom.webp'}
              width={isMobile ? 90 : 150}
              height={isMobile ? 90 : 150}
              alt="g-fex"
            />
          </Box>

          {isMobile ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon color="white" />}
                variant="outline"
                aria-label="Options"
                colorScheme="whiteAlpha"
                bg="transparent"
                borderColor="white"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              />
              <MenuList>
                <MenuItem
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.500"
                  _hover={{ bg: 'transparent', cursor: 'default' }}
                >
                  Principles
                </MenuItem>
                <MenuItem as={NextLink} href={tosLink}>
                  {t('general.termsOfService')}
                </MenuItem>
                <MenuItem as={NextLink} href={disclaimerLink}>
                  {t('general.disclaimer')}
                </MenuItem>
                {/* <MenuItem as={NextLink} href={subscribeLink}>
                  {t('general.subscribe')}
                </MenuItem>
                <MenuItem as={NextLink} href={unsubscribeLink}>
                  {t('general.unsubscribe')}
                </MenuItem> */}
                <MenuDivider />
                <MenuItem
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.500"
                  _hover={{ bg: 'transparent', cursor: 'default' }}
                >
                  Social Media
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="https://x.com/GFEXOFFICIAL"
                  isExternal
                >
                  X
                </MenuItem>
                <MenuItem as={Link} href="https://gfex.medium.com" isExternal>
                  Medium
                </MenuItem>

                {/* <MenuItem
                  as={Link}
                  href="https://debank.com/official/118399/"
                  isExternal
                >
                  DeBank
                </MenuItem> */}
              </MenuList>
            </Menu>
          ) : (
            <>
              <Center>
                <HStack spacing={4} color="#f0f0f0">
                  <Link href={tosLink} target="_blank">
                    <Text>{t('general.termsOfService')}</Text>
                  </Link>
                  <Text fontSize="sm">|</Text>
                  <Link href={disclaimerLink} target="_blank">
                    <Text>{t('general.disclaimer')}</Text>
                  </Link>
                  {/* <Text fontSize="sm">|</Text>
                  <Link href={subscribeLink} target="_blank">
                    <Text>{t('general.subscribe')}</Text>
                  </Link>
                  <Text fontSize="sm">|</Text>
                  <Link href={unsubscribeLink} target="_blank">
                    <Text>{t('general.unsubscribe')}</Text>
                  </Link> */}
                </HStack>
              </Center>

              <HStack spacing={4} color="#f0f0f0">
                <Link href="https://x.com/GFEXOFFICIAL" isExternal>
                  <Image src="/images/X.png" alt="X" width={24} height={24} />
                </Link>
                <Link href="https://gfex.medium.com" isExternal>
                  <Image
                    src="/images/Medium.png"
                    alt="Medium"
                    width={24}
                    height={24}
                  />
                </Link>
                {/* <Link href="https://debank.com/official/118399/" isExternal>
                  <Image
                    src="/images/debank.svg"
                    alt="DeBank"
                    width={24}
                    height={24}
                  />
                </Link> */}
              </HStack>
            </>
          )}
        </HStack>
        <Center>
          <Text
            fontSize="xs"
            textAlign="center"
            paddingLeft={{ base: 4, md: 85 }}
            color="gray.300"
          >
            Copyright © 2024 GFEX. All Rights Reserved.
          </Text>
        </Center>
      </Container>
    </Box>
  );
};

export default BottomMenu;
