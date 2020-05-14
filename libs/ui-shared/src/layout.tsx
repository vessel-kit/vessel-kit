import React from "react";
import { ThemeProvider } from "theme-ui";
import { THEME } from "./theme";
import { CSSReset } from "./css-reset";
import { FontFace } from "./font-face";

export function Layout(props: React.PropsWithChildren<{}>) {
  return (
    <ThemeProvider theme={THEME}>
      <CSSReset />
      <FontFace />
      {props.children}
    </ThemeProvider>
  );
}
