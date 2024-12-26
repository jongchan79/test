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

const TermsOfServiceEs = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  useEffect(() => {
    // 현재 페이지가 스페인어 페이지이고 언어가 영어로 변경되었을 때
    if (i18n.language === 'en' && router.pathname === '/docs/tos_es') {
      console.log('Switching to English ToS...');
      router.push('/docs/tos');
    }
  }, [i18n.language, router]); // router 의존성 제거, 언어 변경만 감지

  return (
    <Box bg="white" color="black" py={8} px={4}>
      <Container maxW="800px">
        <Heading as="h1" fontSize="3xl" mb={6}>
          Términos de Servicio
        </Heading>
        <Text mb={4} textAlign="right">
          Última Actualización: <em>9 de octubre de 2024</em>
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          1. Introducción
        </Heading>
        <Text mb={4}>
          Bienvenido a GFEX (Gapped Futures Exchange) (“GFEX”, “nosotros” o
          “nuestro”). Estos Términos de Servicio (“Términos”) regulan su acceso
          y uso de nuestra plataforma y cualquier otra característica o servicio
          proporcionado en conexión con GFEX (colectivamente, el “Servicio”).
        </Text>
        <Text mb={4}>
          Al utilizar el Servicio, usted acepta cumplir y estar sujeto a estos
          Términos.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          2. Servicios
        </Heading>
        <Text mb={4}>
          GFEX ofrece una plataforma descentralizada que permite a los usuarios
          participar en operaciones de futuros de criptomonedas pronosticando
          las brechas de precios entre dos activos criptográficos (el
          “Servicio”). GFEX opera utilizando una infraestructura Web3, lo que
          significa que los usuarios conectan directamente sus billeteras de
          criptomonedas a la plataforma para facilitar las operaciones. GFEX no
          administra ni controla las billeteras de los usuarios, ni ejecuta o
          efectúa operaciones en nombre de los usuarios.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          3. Acceso al Servicio
        </Heading>
        <Text mb={4}>
          Para utilizar GFEX, debe tener una dirección de blockchain y una
          billetera de terceros. Su cuenta estará asociada con su dirección de
          blockchain. GFEX no tiene control ni custodia sobre su billetera, y es
          su responsabilidad garantizar la seguridad de su billetera y claves
          privadas. GFEX no es responsable de accesos o usos no autorizados de
          su billetera.
        </Text>

        <Heading as="h2" fontSize="xl" mb={4}>
          4. Estructura de Tarifas
        </Heading>
        <Text mb={4}>
          GFEX tiene una estructura de tarifas en dos partes: una tarifa del 1%
          sobre todas las operaciones y una tarifa adicional del 3% sobre las
          operaciones rentables, aplicada tanto al beneficio como al capital
          principal.
        </Text>

        <Heading as="h3" fontSize="lg" mb={2}>
          Ejemplo
        </Heading>
        <Text mb={4}>
          Aplicación de tarifas y cálculo de beneficios cuando la decisión de
          inversión direccional fue correcta:
        </Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Índice</Th>
              <Th>Ampliar</Th>
              <Th>Reducir</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Número de Traders</Td>
              <Td>147</Td>
              <Td>211</Td>
            </Tr>
            <Tr>
              <Td>Proporción de Traders</Td>
              <Td>41.06%</Td>
              <Td>58.94%</Td>
            </Tr>
            <Tr>
              <Td>Total del Pool (con tarifa de entrada del 1% aplicada)</Td>
              <Td>$1,455.30</Td>
              <Td>$2,088.90</Td>
            </Tr>
            <Tr>
              <Td>Ganancias en una inversión de $10</Td>
              <Td>$14.21</Td>
              <Td>$6.90</Td>
            </Tr>
            <Tr>
              <Td>Después de la Deducción de la Tarifa del 3%</Td>
              <Td>$13.78</Td>
              <Td>$6.69</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Monto Total después de la Operación</strong>
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
          5. Modificaciones a los Términos
        </Heading>
        <Text mb={4}>
          GFEX puede modificar estos Términos en cualquier momento. Cualquier
          actualización será efectiva inmediatamente después de su publicación
          en la plataforma. Los usuarios son responsables de revisar los
          Términos regularmente. El uso continuo del Servicio constituye la
          aceptación de los Términos modificados.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          6. Disponibilidad del Servicio
        </Heading>
        <Text mb={4}>
          Su acceso y uso del Servicio pueden interrumpirse ocasionalmente por
          diversas razones, tales como fallos de equipo, actualizaciones
          programadas, mantenimiento o reparaciones en la plataforma. Además, el
          acceso puede verse afectado debido a restricciones geográficas,
          sospechas de violaciones de estos Términos u otras acciones que GFEX
          pueda decidir a su discreción.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          7. Terminación del Servicio
        </Heading>
        <Text mb={4}>
          GFEX se reserva el derecho de terminar o suspender el acceso de los
          usuarios a la plataforma en cualquier momento y por cualquier motivo,
          incluyendo violaciones de estos Términos. La terminación puede ocurrir
          sin previo aviso o responsabilidad.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          8. Exención de Responsabilidad
        </Heading>
        <Text mb={4}>
          Al aceptar estos Términos, se considerará que los usuarios han
          aceptado el Aviso Legal proporcionado en nuestro sitio web. Para más
          detalles, revise el Aviso Legal completo.
        </Text>

        <Heading as="h2" fontSize="xl" mt={6} mb={4}>
          9. Idioma
        </Heading>
        <Text mb={4}>
          Estos Términos están disponibles en inglés y pueden ser traducidos a
          otros idiomas. En caso de cualquier discrepancia entre la versión en
          inglés y las traducciones, prevalecerá la versión en inglés.
        </Text>
      </Container>
    </Box>
  );
};

export default TermsOfServiceEs;
