import { extendTheme } from "@chakra-ui/react";

const colors = {
  primary: "#062A1F",
  secondary: "#BADAD3",
  accent: "#D6C34E",
  background: "#FFFFFF",
  text: "#000000",
  error: "#B00020",
  success: "#2E7D32",
  warning: "#F9A825",
  info: "#0288D1",
  link: "#062A1F",
  disabled: "#A8A8A8",
  border: "#E0E0E0",
  shadow: "#A8A8A8",
  hover: "#044336",
  active: "#041F18",
  focus: "#062A1F",
  placeholder: "#A8A8A8",
  selected: "#062A1F",
  highlight: "#D6C34E",
  divider: "#E0E0E0",
  loading: "#062A1F",
  successBg: "#E8F5E9",
  errorBg: "#FFEBEE",
  warningBg: "#FFF8E1",
  infoBg: "#E1F5FE",
  disabledBg: "#F5F5F5",
  selectedBg: "#BADAD3",
  highlightBg: "#FFF9C4",
  dividerBg: "#E0E0E0",
  loadingBg: "#FDF5E6",
};

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Noto Serif', serif",
    body: "'Noto Sans', sans-serif",
  },
  colors: {
    brand: {
      50: colors.background,
      100: colors.secondary,
      200: colors.secondary,
      300: colors.accent,
      400: colors.accent,
      500: colors.primary,
      600: colors.hover,
      700: colors.active,
    },
    success: { 500: colors.success },
    error: { 500: colors.error },
    warning: { 500: colors.warning },
    info: { 500: colors.info },
    accent: { 500: colors.accent },
  },
  styles: {
    global: {
      body: {
        bg: colors.background,
        color: colors.text,
        fontFamily: "'Noto Sans', sans-serif",
        fontWeight: 400,
      },
      a: {
        color: colors.link,
        _hover: { color: colors.hover },
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: "'Noto Serif', serif",
        fontWeight: 400,
      },
    },
    Button: {
      variants: {
        solid: {
          bg: "#00202c",
          color: "white",
          _hover: { bg: "#00202c" },
        },
        ghost: {
          bg: "#00202c",
          color: "white",
          _hover: { bg: "#00202c" },
        },
        outline: {
          bg: "#00202c",
          color: "white",
          borderColor: "#00202c",
          _hover: { bg: "#00202c" },
        },
        link: {
          bg: "#00202c",
          color: "white",
          _hover: { bg: "#00202c" },
        },
      },
    },
  },
});

export default theme;
