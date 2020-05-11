import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { THEME } from "../lib/theme";
import { ThemeProvider } from "theme-ui";
import Link from "next/link";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <title>Anchoring</title>
      </Head>
      <ThemeProvider theme={THEME}>
        <nav>
          <h1>
            <Link href={"/"}><a>Anchoring</a></Link>
          </h1>
          <Link href={"/requests"}>
            <a>Requests</a>
          </Link>
          <Link href={"/anchors"}>
            <a>Anchors</a>
          </Link>
        </nav>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default App;
