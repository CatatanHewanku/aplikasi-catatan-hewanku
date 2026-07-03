import { Box } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const hideNavPages = ["/medication-form", "/quick-notes", "/user-profile"];
  const isNavHidden = hideNavPages.some(path => location.pathname.includes(path));

  return (
    <Box pb={isNavHidden ? "0px" : "60px"}>
      {children}
    </Box>
  );
}