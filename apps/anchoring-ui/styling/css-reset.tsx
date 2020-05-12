import React from "react";
import { Global } from "@emotion/core";

const reset = `
  html
  html,
  body,
  body > div:first-of-type,
  div#__next {
    height: 100%;
  }
`;

export function CSSReset() {
  return <Global styles={reset} />;
}
