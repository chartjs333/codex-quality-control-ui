import React from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

const links = [
  { title: "Home", to: "/" },
  { title: "Old", to: "/old" },
  { title: "Grid", to: "/grid" },
  { title: "LOD", to: "/lod" },
  { title: "Statistics", to: "/statistics" },
  { title: "Gallery", to: "/gallery" },
  { title: "S3", to: "/s3" },
  { title: "Crop", to: "/crop" },
  { title: "Survey", to: "/survey" },
];

const NavLink = ({ children, to }) => {
  return (
    <Link
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: "none",
        bg: "gray.200",
      }}
      to={to}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bgImage="linear-gradient(to right, blue.900, gray.700)" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box color="white" fontWeight="bold"></Box>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
              color="white"
            >
              {links.map(({ to, title }) => (
                <NavLink key={to} to={to}>
                  {title}
                </NavLink>
              ))}
            </HStack>
          </HStack>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {links.map(({ to, title }) => (
                <NavLink to={to} key={to}>
                  {title}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;
