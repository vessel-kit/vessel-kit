import React from "react";
import { ThemeProvider } from "theme-ui";
import { THEME } from "../styling/theme";

export function Layout(props: React.PropsWithChildren<{}>) {
  return <ThemeProvider theme={THEME}>{props.children}</ThemeProvider>;
}
