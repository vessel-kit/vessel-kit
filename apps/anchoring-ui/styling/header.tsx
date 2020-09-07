import React from "react";
import styled from "@emotion/styled";
import { COLORS, PALETTE } from "@vessel-kit/ui-shared";
import { css } from "theme-ui";
import { Box } from "@theme-ui/components";
import Link, { LinkProps } from "next/link";

const HeaderE = styled.header(
  css({
    display: "flex",
    alignItems: "center",
    height: 4,
    background: COLORS.shellHeaderBg01
  })
);

const LinkE = styled.a(
  css({
    variant: "text.bodyShort01"
  })
);

const PrefixE = styled.span(
  css({
    fontWeight: "normal",
    paddingLeft: 3
  })
);

export function HeaderName(
  props: React.PropsWithChildren<LinkProps & { prefix: string }>
) {
  return (
    <Link href={props.href} passHref={true}>
      <LinkE>
        <PrefixE>{props.prefix}</PrefixE>&nbsp;{props.children}
      </LinkE>
    </Link>
  );
}

const HeaderNavigationE = styled.ul(
  css({
    display: "flex",
    listStyle: "none",
    padding: 0,
    margin: 0,
    height: "100%"
  })
);

const HeaderMenuItemE = styled.a(
  css({
    color: PALETTE.gray[3],
    padding: "0 1rem",
    fontSize: "0.875rem",
    lineHeight: "1.125rem",
    textDecoration: "none",
    alignItems: "center",
    height: "100%",
    display: "flex",
    userSelect: "none",
    border: "2px solid transparent",
    transition: "background-color 110ms,border-color 110ms, color 110ms",
    "&:hover": {
      background: "#2c2c2c",
      color: PALETTE.gray[1]
    }
  })
);

export function HeaderMenuItem(
  props: React.PropsWithChildren<{ href: string; as?: string }>
) {
  return (
    <li>
      <Link href={props.href} as={props.as} passHref={true}>
        <HeaderMenuItemE>{props.children}</HeaderMenuItemE>
      </Link>
    </li>
  );
}

const HeaderNavigationBoxE = styled(Box)(css({
  display: ["none", "block"],
  position: "relative",
  paddingLeft: "1rem",
  height: "100%",
  "::before": {
    content: '""',
    display: "block",
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    height: 24,
    width: "1px",
    background: PALETTE.gray[8]
  }
}))

export function HeaderNavigation(props: React.PropsWithChildren<{}>) {
  return (
    <HeaderNavigationBoxE>
      <HeaderNavigationE>{props.children}</HeaderNavigationE>
    </HeaderNavigationBoxE>
  );
}

export function Header(props: React.PropsWithChildren<{}>) {
  return <HeaderE>{props.children}</HeaderE>;
}
