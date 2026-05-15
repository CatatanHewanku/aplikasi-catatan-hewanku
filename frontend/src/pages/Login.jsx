import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, Image } from "@chakra-ui/react";
import { MdEmail, MdLock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../images/Logo.jpeg";
import { authService } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError("Email or phone is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setError("");

    try {
      await authService.login(identifier, password);
      window.location.href = "/";
    } catch (backendError) {
      setError("Invalid email or password");
    }
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" minH="500px" borderRadius="30px" px="28px" pt="65px" boxShadow="lg" pb="40px">
        <Flex position="absolute" top="-85px" left="50%" transform="translateX(-50%)" justify="center" align="center">
          <Image src={Logo} w="150px" objectFit="contain" />
        </Flex>

        <Text textAlign="center" fontFamily="title" color="Primary.900" fontWeight="bold" fontSize="xl" mb="30px">
          Catatan Hewanku
        </Text>

        <Text textAlign="center" fontFamily="heading" color="Primary.900" fontWeight="semibold" fontSize="2xl" mb="40px">
          Log In
        </Text>

        <InputGroup mb="16px">
          <InputLeftElement pointerEvents="none" color="Primary.800">
            <Box color="Primary.800">
              <MdEmail size="20px" />
            </Box>
          </InputLeftElement>
          <Input 
            placeholder="Email or Phone" 
            fontSize="md" 
            fontFamily="body" 
            fontWeight="regular" 
            color="Primary.800" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            bg="white" 
            borderRadius="30px" 
            border="1px" 
            borderColor="Primary.800" 
            boxShadow="md" 
            _focus={{ borderColor: "Primary.800", boxShadow: "md" }} 
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none" color="Primary.800">
            <Box color="Primary.800">
              <MdLock size="20px" />
            </Box>
          </InputLeftElement>
          <Input 
            type="password" 
            fontSize="md" 
            fontFamily="body" 
            fontWeight="regular" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            bg="white" 
            borderRadius="30px" 
            border="1px" 
            borderColor={error ? "red.300" : "Primary.800"} 
            boxShadow="md" 
            _focus={{ borderColor: error ? "red.300" : "Primary.800", boxShadow: "md" }} 
          />
        </InputGroup>

        {error && (
          <Text color="red.400" fontSize="xs" mt="6px" ml="8px">
            {error}
          </Text>
        )}

        <Text mt="6px" ml="8px" fontSize="xs" color="Primary.700" cursor="pointer" onClick={() => navigate("/forgot-password-email")}>
          Forgot Password?
        </Text>

        <Flex align="center" direction="column">
          <Button 
            mt="40px" 
            w="80%" 
            h="40px" 
            bg="Primary.800" 
            color="Neutral.100" 
            borderRadius="30px" 
            fontWeight="medium" 
            boxShadow="md" 
            _hover={{ opacity: 0.9 }} 
            onClick={handleLogin}
          >
            <Text fontFamily="body" fontSize="xl">
              Log In
            </Text>
          </Button>
          <Text textAlign="center" m="20px" color="Primary.800">
            Don't have an account?
          </Text>
          <Button 
            w="80%" 
            h="40px" 
            bg="Neutral.100" 
            color="Primary.800" 
            borderRadius="30px" 
            border="2px" 
            borderColor="Primary.800" 
            fontWeight="medium" 
            boxShadow="md" 
            _hover={{ bg: "Primary.100" }} 
            onClick={() => navigate("/signup")}
          >
            <Text fontFamily="body" fontSize="xl">
              Sign Up
            </Text>
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}