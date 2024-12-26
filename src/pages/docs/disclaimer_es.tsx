// src/components/pages/docs/disclaimer.tsx
import { Box, Container, Text, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const DisclaimerES = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  useEffect(() => {
    // 현재 페이지가 스페인어 페이지이고 언어가 영어로 변경되었을 때
    if (i18n.language === 'en' && router.pathname === '/docs/disclaimer_es') {
      console.log('Switching to English disclaimer...');
      router.push('/docs/disclaimer');
    }
  }, [i18n.language, router]); // router 의존성 제거, 언어 변경만 감지

  return (
    <Container maxW="800px" py={8} px={4}>
      <Heading as="h1" fontSize="3xl" mb={6} textAlign="center">
        Aviso Legal
      </Heading>
      <Text mb={4} textAlign="right">
        Última Actualización: <em>9 de octubre de 2024</em>
      </Text>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          1. Información General
        </Heading>
        <Text mb={4}>
          GFEX (Gapped Futures Exchange) es un intercambio descentralizado (DEX)
          construido sobre Binance Smart Chain (BSC), que ofrece operaciones de
          futuros basadas en la predicción de brechas de precios entre activos
          virtuales. Como plataforma Web3, GFEX no requiere que los usuarios
          inicien sesión ni proporcionen información personal.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          2. Cumplimiento Normativo
        </Heading>
        <Text mb={4}>
          GFEX minimiza la exposición regulatoria al no recopilar datos
          personales. Sin embargo, los usuarios son responsables de cumplir con
          las leyes y regulaciones locales aplicables en su jurisdicción. GFEX
          no se hace responsable de problemas legales derivados del uso de la
          plataforma.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          3. Disponibilidad del Servicio
        </Heading>
        <Text mb={4}>
          GFEX obtiene datos de precios de APIs de intercambios externos,
          incluidos los principales intercambios y proveedores de información
          sobre precios de criptomonedas. Este enfoque mitiga preocupaciones
          sobre la manipulación de precios o actividades fraudulentas. Aunque
          GFEX utiliza estos índices externos, no los establece ni los controla,
          y no es responsable de su precisión, fiabilidad o puntualidad. Los
          usuarios deben ser conscientes de que los precios de mercado pueden
          fluctuar rápidamente, y GFEX se exime de cualquier responsabilidad por
          decisiones comerciales basadas en estos índices de precios.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          4. Responsabilidad del Usuario
        </Heading>
        <Text mb={4}>
          <b>A. Seguridad:</b> Los usuarios deben asegurar sus billeteras, laves
          privadas y métodos de autenticación. La pérdida o el compromiso de
          estas credenciales puede resultar en la pérdida de activos virtuales y
          acceso a la cuenta. GFEX no es responsable por pérdidas debidas a
          negligencia del usuario.
        </Text>
        <Text mb={4}>
          <b>B. Cumplimiento Normativo:</b> Los usuarios deben garantizar que el
          uso de la plataforma cumple con todas las leyes y regulaciones
          aplicables. GFEX no es responsable de problemas legales relacionados
          con el uso de la plataforma.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          5. Advertencia de Riesgo
        </Heading>
        <Text mb={4}>
          <b>A. Riesgo de Inversión:</b> Operar con futuros y predecir brechas
          de precios de activos virtuales implica un riesgo significativo y
          puede resultar en pérdidas financieras sustanciales. Debido a la alta
          volatilidad de los activos virtuales, los usuarios solo deben invertir
          cantidades que puedan permitirse perder.
        </Text>
        <Text mb={4}>
          <b>B. Riesgo de Mercado:</b> El mercado de criptomonedas es altamente
          volátil y está influenciado por el sentimiento del mercado, cambios
          regulatorios, desarrollos tecnológicos y otros factores.
        </Text>
        <Text mb={4}>
          <b>C. Riesgo Regulatorio:</b> GFEX, como una plataforma
          descentralizada, puede estar sujeta a regulaciones diversas. Los
          usuarios son responsables de entender y cumplir con las leyes locales
          y regulaciones relacionadas con la negociación de activos virtuales.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          6. Sin Garantías
        </Heading>
        <Text mb={4}>
          GFEX se proporciona &ldquo;tal cual&rdquo; y &ldquo;según
          disponibilidad&rdquo;. No garantizamos la exactitud, fiabilidad o
          integridad de la información o los servicios proporcionados. Los
          usuarios reconocen que utilizan la plataforma bajo su propio riesgo.
          GFEX se exime de todas las garantías, ya sean explícitas o implícitas.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          7. No es Asesoramiento Financiero
        </Heading>
        <Text mb={4}>
          La información proporcionada por GFEX no constituye asesoramiento en
          materia de inversiones, finanzas o comercio. Los usuarios deben
          realizar su propia investigación y consultar a un asesor financiero
          antes de tomar cualquier decisión de inversión. El contenido de la
          plataforma tiene fines exclusivamente informativos y no debe
          considerarse como asesoramiento profesional.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          8. Limitación de Responsabilidad
        </Heading>
        <Text mb={4}>
          GFEX, sus afiliados y proveedores de servicios no son responsables por
          daños directos, indirectos, incidentales, especiales, consecuentes o
          punitivos que surjan del uso de la plataforma. Esto incluye, pero no
          se limita a, pérdida de beneficios, datos u otras pérdidas
          intangibles. Donde la ley no permita la exclusión o limitación de
          responsabilidad por ciertos daños, la responsabilidad se limita al
          máximo permitido por la ley.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          9. Indemnización
        </Heading>
        <Text mb={4}>
          Los usuarios acuerdan indemnizar, defender y eximir de responsabilidad
          a GFEX, sus afiliados y sus respectivos funcionarios, directores,
          empleados y agentes de cualquier reclamación, responsabilidad, daños,
          pérdidas, costos y gastos, incluidos los honorarios razonables de
          abogados, relacionados con el uso de la plataforma, cualquier
          violación de este aviso legal o cualquier infracción de los derechos
          de terceros.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          10. Propiedad Intelectual
        </Heading>
        <Text mb={4}>
          Todo el contenido, marcas registradas y datos en la plataforma GFEX
          son propiedad de GFEX y sus afiliados. Queda prohibido el uso o
          reproducción no autorizada del contenido de la plataforma. Los
          usuarios reciben una licencia limitada, no exclusiva e intransferible
          para acceder y utilizar la plataforma con fines personales y no
          comerciales únicamente.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          11. Aceptación de Términos
        </Heading>
        <Text mb={4}>
          Al utilizar GFEX, usted acepta este aviso legal en su totalidad. Si no
          está de acuerdo con alguna parte de este aviso, no debe utilizar la
          plataforma. El uso continuado de la plataforma significa la aceptación
          de cualquier cambio a este aviso legal.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          12. Información Adicional
        </Heading>
        <Text mb={4}>
          Para obtener información adicional, consulte nuestra sección de
          &ldquo;Términos de Servicio&rdquo; disponible en el pie de página de
          nuestro sitio web.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          13. Noticias y Actualizaciones
        </Heading>
        <Text mb={4}>
          Para las últimas noticias y actualizaciones, consulte los enlaces
          oficiales de X o Medium ubicados en el menú de pie de página del sitio
          web.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          14. Última Actualización
        </Heading>
        <Text mb={4}>
          El 9 de octubre de 2024. Este aviso legal puede actualizarse o
          modificarse sin previo aviso. Se recomienda a los usuarios revisar
          periódicamente el aviso para conocer cualquier cambio.
        </Text>
      </Box>

      <Box mb={6}>
        <Heading as="h2" fontSize="xl" mb={4}>
          15. Idiomas
        </Heading>
        <Text mb={4}>
          Este aviso legal está disponible en inglés y puede traducirse a otros
          idiomas. En caso de cualquier discrepancia entre la versión en inglés
          y las traducciones, prevalecerá la versión en inglés.
        </Text>
      </Box>
    </Container>
  );
};

export default DisclaimerES;
