import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "theme-ui";
import {
  Header,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation
} from "../styling/header";
import { CSSReset, FontFace, Shell, THEME } from '@potter/ui-shared';

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <title>Anchoring</title>
        <link
          rel="stylesheet"
          type="text/css"
          href="//unpkg.com/carbon-components@10.11.2/css/carbon-components.min.css"
        />
      </Head>
      <ThemeProvider theme={THEME}>
        <CSSReset />
        <FontFace />
        <Shell.Container>
          <Shell.Header>
            <Header>
              <HeaderName prefix={"Ceramic"} href={"/"}>
                Anchoring
              </HeaderName>
              <HeaderNavigation>
                <HeaderMenuItem href={"/requests"}>Requests</HeaderMenuItem>
                <HeaderMenuItem href={"/anchors"}>Anchors</HeaderMenuItem>
              </HeaderNavigation>
            </Header>
          </Shell.Header>
          <Shell.Content>
            <Component {...pageProps} />
          </Shell.Content>
          {/*<Shell.Footer>footer</Shell.Footer>*/}
        </Shell.Container>
      </ThemeProvider>
    </>
  );
}

export default App;
