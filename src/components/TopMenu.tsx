import { memo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Container,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { FaGlobe } from 'react-icons/fa';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useTranslation } from 'next-i18next';
import LoginButton from '../ui/LoginButton';
import Image from 'next/image';
import dynamic from 'next/dynamic';
// import { useAuthStore } from '../store/useAuthStore';

function TopMenuComponent() {
  const { t, i18n } = useTranslation();
  // const { isLoggedIn } = useAuthStore();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClient, setIsClient] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (onClose) onClose();
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box bg="#062127" w="100%" p={4}>
      <Container maxW="1204px">
        <Flex justify="space-between" align="center">
          {/* logo */}
          <Box
            as="a"
            href="/"
            w={isMobile ? '120px' : '220px'}
            h={isMobile ? '35px' : '65px'}
          >
            <Image
              src={'/images/logo_top_250.png'}
              width={isMobile ? 120 : 220}
              height={isMobile ? 35 : 65}
              alt="g-fex"
              priority
            />
          </Box>

          {/* Mobile Hamburger Menu */}
          {isMobile ? (
            <IconButton
              icon={<HamburgerIcon color="white" />}
              aria-label="Open Menu"
              variant="ghost"
              onClick={onOpen}
            />
          ) : (
            <Flex align="center">
              {/* Language selection for desktop */}
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  colorScheme="teal"
                  mr="10px"
                  height="40px"
                >
                  <FaGlobe />
                </MenuButton>
                {isClient && (
                  <MenuList minW={100}>
                    <MenuItem onClick={() => handleLanguageChange('en')}>
                      {t('general.languageEnglish')}
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('es')}>
                      {t('general.languageSpanish')}
                    </MenuItem>
                  </MenuList>
                )}
              </Menu>
              {/* Login button for desktop */}
              <LoginButton />
            </Flex>
          )}
        </Flex>
      </Container>

      {/* Mobile Drawer for Menu Options */}
      {isClient && (
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent bg="#062127" color="white">
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody>
              {isClient && (
                <>
                  <Button
                    variant="ghost"
                    width="100%"
                    justifyContent="flex-start"
                    rightIcon={<FaGlobe color="white" />}
                    color="white"
                    onClick={() => handleLanguageChange('en')}
                  >
                    {t('general.languageEnglish')}
                  </Button>
                  <Button
                    variant="ghost"
                    width="100%"
                    justifyContent="flex-start"
                    rightIcon={<FaGlobe color="white" />}
                    color="white"
                    onClick={() => handleLanguageChange('es')}
                  >
                    {t('general.languageSpanish')}
                  </Button>
                </>
              )}
              <Box mt={4}>
                <LoginButton fullWidth onMenuClose={onClose} />
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </Box>
  );
}

export default dynamic(() => Promise.resolve(memo(TopMenuComponent)), {
  ssr: false
});
