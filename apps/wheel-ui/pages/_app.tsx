import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import {
  Header,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation
} from "../styling/header";
import { Layout, Shell } from "@vessel-kit/ui-shared";

function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <title>Wheel</title>
        <link
          rel="stylesheet"
          type="text/css"
          href="//unpkg.com/carbon-components@10.11.2/css/carbon-components.min.css"
        />
      </Head>
      <Shell.Container>
        <Shell.Header>
          <Header>
            <HeaderName prefix={"Vessel"} href={"/"}>
              Wheel
            </HeaderName>
            <HeaderNavigation>
              <HeaderMenuItem href={"/documents"}>Documents</HeaderMenuItem>
            </HeaderNavigation>
          </Header>
        </Shell.Header>
        <Shell.Content>
          <Component {...pageProps} />
        </Shell.Content>
        {/*<Shell.Footer>footer</Shell.Footer>*/}
      </Shell.Container>
    </Layout>
  );
}

export default App;
