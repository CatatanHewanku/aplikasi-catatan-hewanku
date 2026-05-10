import { Box } from "@chakra-ui/react";
import Navbar from "../pages/Navbar.jsx";

export default function Layout({ children }) {
  return (
    <Box minH="100vh">
      
      <Box pb="60px"> 
        {children}
      </Box>

      <Navbar />
    </Box>
  );
}