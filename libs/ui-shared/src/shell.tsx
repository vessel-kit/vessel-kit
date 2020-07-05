import React from "react";
import { Flex } from "@theme-ui/components";
import styled from "@emotion/styled";
import { css } from "theme-ui";

function Container(props: React.PropsWithChildren<{}>) {
  return (
    <Flex sx={{ flexDirection: "column", height: "100%" }}>
      {props.children}
    </Flex>
  );
}

interface HeaderProps {
  "aria-label"?: string;
  role?: string;
}

function Header(props: React.PropsWithChildren<HeaderProps>) {
  return <header {...props} />;
}

function Footer(props: React.PropsWithChildren<{}>) {
  return <footer>{props.children}</footer>;
}

const ContentE = styled.main(
  css({
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
    // background: PALETTE.alabaster[0]
  })
);

function Content(props: React.PropsWithChildren<{}>) {
  return <ContentE>{props.children}</ContentE>;
}

export const Shell = {
  Container,
  Header,
  Footer,
  Content,
};
