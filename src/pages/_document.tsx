import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
        <meta property="og:image" content="/images/logo_beta_thumbnail.png" />
        <meta content="Gapped Futures EXchange" name="description"/>
        <meta content="Gapped Futures EXchange" property="og:title"/>
        <meta content="Coming Soon." property="og:description"/>
        <meta content="/images/logo_beta_thumbnail.png" property="og:image"/>
        <meta content="Gapped Futures EXchange" property="twitter:title"/>
        <meta content="Coming Soon." property="twitter:description"/>
        <meta content="/images/logo_beta_thumbnail.png" property="twitter:image"/>
        <meta property="og:type" content="website"/>
        <meta content="/images/logo_beta_thumbnail.png" name="twitter:card"/>
        <meta content="Webflow" name="generator"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}