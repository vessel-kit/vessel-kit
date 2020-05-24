import React from "react";
import { ThemeProvider } from "theme-ui";
import { THEME } from "@potter/ui-shared";

export function Layout(props: React.PropsWithChildren<{}>) {
  return <ThemeProvider theme={THEME}>{props.children}</ThemeProvider>;
}
