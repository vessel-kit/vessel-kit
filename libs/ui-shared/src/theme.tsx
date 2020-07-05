const heading = {
  color: "text",
  fontFamily: "heading",
  lineHeight: "heading",
  fontWeight: "heading"
};

const spacingScale = [
  0,
  "0.125rem",
  "0.25rem",
  "0.5rem",
  "0.75rem",
  "1rem",
  "1.5rem",
  "2rem",
  "2.5rem",
  "3rem"
];
const layoutScale = [
  0,
  "1rem",
  "1.5rem",
  "2rem",
  "3rem",
  "4rem",
  "6rem",
  "10rem"
];
export const PALETTE = {
  black: ["#000000"],
  white: ["#ffffff"],
  blue: [
    null,
    "#edf5ff",
    "#d0e2ff",
    "#a6c8ff",
    "#78a9ff",
    "#4589ff",
    "#0f62fe",
    "#0043ce",
    "#002d9c",
    "#001d6c",
    "#001141"
  ],
  coolGray: [
    null,
    "#f2f4f8",
    "#dde1e6",
    "#c1c7cd",
    "#a2a9b0",
    "#878d96",
    "#697077",
    "#4d5358",
    "#343a3f",
    "#21272a",
    "#121619"
  ],
  cyan: [
    null,
    "#e5f6ff",
    "#bae6ff",
    "#82cfff",
    "#33b1ff",
    "#1192e8",
    "#0072c3",
    "#00539a",
    "#003a6d",
    "#012749",
    "#061727"
  ],
  gray: [
    null,
    "#f4f4f4",
    "#e0e0e0",
    "#c6c6c6",
    "#a8a8a8",
    "#8d8d8d",
    "#6f6f6f",
    "#525252",
    "#393939",
    "#262626",
    "#161616"
  ],
  green: [
    null,
    "#defbe6",
    "#a7f0ba",
    "#6fdc8c",
    "#42be65",
    "#24a148",
    "#198038",
    "#0e6027",
    "#044317",
    "#022d0d",
    "#071908"
  ],
  magenta: [
    null,
    "#fff0f7",
    "#ffd6e8",
    "#ffafd2",
    "#ff7eb6",
    "#ee5396",
    "#d12771",
    "#9f1853",
    "#740937",
    "#510224",
    "#2a0a18"
  ],
  orange: [null, null, null, null, "#ff832b"],
  purple: [
    null,
    "#f6f2ff",
    "#e8daff",
    "#d4bbff",
    "#be95ff",
    "#a56eff",
    "#8a3ffc",
    "#6929c4",
    "#491d8b",
    "#31135e",
    "#1c0f30"
  ],
  red: [
    null,
    "#fff1f1",
    "#ffd7d9",
    "#ffb3b8",
    "#ff8389",
    "#fa4d56",
    "#da1e28",
    "#a2191f",
    "#750e13",
    "#520408",
    "#2d0709"
  ],
  teal: [
    null,
    "#d9fbfb",
    "#9ef0f0",
    "#3ddbd9",
    "#08bdba",
    "#009d9a",
    "#007d79",
    "#005d5d",
    "#004144",
    "#022b30",
    "#081a1c"
  ],
  warmGray: [
    null,
    "#f7f3f2",
    "#e5e0df",
    "#cac5c4",
    "#ada8a8",
    "#8f8b8b",
    "#736f6f",
    "#565151",
    "#3c3838",
    "#272525",
    "#171414"
  ],
  alabaster: ['#f3f3f3'],
  yellow: [null, null, "#fdd13a", "#f1c21b"]
};

export const COLORS = {
  interactive01: PALETTE.blue[6],
  interactive02: PALETTE.gray[8],
  interactive03: PALETTE.blue[6],
  interactive04: PALETTE.blue[6],
  uiBackground: PALETTE.white[0],
  danger: PALETTE.red[6],
  ui01: PALETTE.gray[1],
  ui02: PALETTE.white[0],
  ui03: PALETTE.gray[2],
  ui04: PALETTE.gray[5],
  ui05: PALETTE.gray[10],
  text01: PALETTE.gray[10],
  text02: PALETTE.gray[8],
  text03: PALETTE.gray[4],
  text04: PALETTE.white[0],
  text05: PALETTE.gray[6],
  textError: PALETTE.red[6],

  shellHeaderBg01: PALETTE.gray[10]
}

// @ts-ignore
export const THEME = {
  breakpoints: ["42rem", "66rem", "82rem", "99rem"],
  space: spacingScale,
  sizes: layoutScale,
  fonts: {
    body: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif",
    heading: "inherit",
    monospace:
      "'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace"
  },
  fontSizes: [
    12,
    14,
    16,
    18,
    20,
    24,
    28,
    32,
    36,
    42,
    48,
    54,
    60,
    68,
    76,
    84,
    92
  ],
  fontWeights: {
    semibold: 600,
    regular: 400,
    light: 300
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#07c",
    secondary: "#30c",
    muted: "#f6f6f6"
  },
  text: {
    bodyShort01: {
      fontSize: 2,
      fontWeight: 'bold',
      color: PALETTE.gray[1],
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem 0 1rem',
      textDecoration: 'none'
    }
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body"
    },
    h1: {
      ...heading,
      fontSize: 5
    },
    h2: {
      ...heading,
      fontSize: 4
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    p: {
      color: "text",
      fontFamily: "body",
      fontWeight: "body",
      lineHeight: "body"
    },
    a: {
      color: "primary"
    },
    pre: {
      fontFamily: "monospace",
      overflowX: "auto",
      code: {
        color: "inherit"
      }
    },
    code: {
      fontFamily: "monospace",
      fontSize: "inherit"
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0
    },
    th: {
      textAlign: "left",
      borderBottomStyle: "solid"
    },
    td: {
      textAlign: "left",
      borderBottomStyle: "solid"
    },
    img: {
      maxWidth: "100%"
    }
  }
};
