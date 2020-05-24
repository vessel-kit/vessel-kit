import React from "react";

export function Tile(props: React.PropsWithChildren<{}>) {
  return <div className={"bx--tile"}>{props.children}</div>;
}
