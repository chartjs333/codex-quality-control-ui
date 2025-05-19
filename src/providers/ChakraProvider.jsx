import React from "react";
import { ChakraProvider as Chakra, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";

const ChakraProvider = ({ children }) => (
  <Chakra resetCSS theme={theme}>
    <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
    {children}
  </Chakra>
);

export default ChakraProvider;
