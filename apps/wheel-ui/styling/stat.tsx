import React from "react";
import styled from "@emotion/styled";
import { css } from "theme-ui";
import { PALETTE } from "@potter/ui-shared";
import { Box } from "@theme-ui/components";

const SubtitleE = styled.span(
  css({
    display: "block",
    fontSize: 1,
    fontWeight: "regular",
    color: PALETTE.gray[8]
  })
);

const ValueE = styled(Box)(
  css({
    fontSize: 12,
    paddingTop: 2,
    paddingRight: 2
  })
);

export function Stat(props: {
  title: string;
  subtitle?: string | React.ReactNode;
  value: string;
}) {
  const subtitle = <SubtitleE>{props.subtitle}</SubtitleE>

  return (
    <Box className={"bx--tile"} sx={{paddingBottom: 0}}>
      <h5>
        {props.title} {subtitle}
      </h5>
      <ValueE>{props.value}</ValueE>
    </Box>
  );
}
