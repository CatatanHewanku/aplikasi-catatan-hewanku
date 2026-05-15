import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, Image } from "@chakra-ui/react";
import { MdArrowBack, MdLock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../images/Logo.jpeg";
import { authService } from "../services/authService";

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  return errors;
};

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join("\n"));
      return;
    }

    if (password !== confirmPassword) {
      setError("Password does not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const savedEmail = localStorage.getItem("resetEmail");
      const savedCode = localStorage.getItem("resetCode");
      
      await authService.resetPassword(savedEmail, savedCode, password);
      
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetCode");
      
      alert("Password reset successfully");
      navigate("/");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" minH="650px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg">
        <Flex position="absolute" top="-70px" left="50%" transform="translateX(-50%)" justify="center" align="center" w="100%">
          <Image src={Logo} w="150px" objectFit="contain" />
        </Flex>

        <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="xl" fontFamily="title" mb="50px">
          Catatan Hewanku
        </Text>

        <Flex justify="flex-start" mb="20px">
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)}>
            <MdArrowBack size="30px" />
          </Box>
        </Flex>

        <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl" mb="40px">
          Create New Password
        </Text>

        <InputGroup mb="20px">
          <InputLeftElement pointerEvents="none" color="Primary.800">
            <MdLock size="20px" />
          </InputLeftElement>
          <Input 
            type="password" 
            placeholder="New Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            bg="Neutral.100" 
            borderRadius="30px" 
            border="1px" 
            borderColor="Primary.800" 
            boxShadow="md" 
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none" color="Primary.800">
            <MdLock size="20px" />
          </InputLeftElement>
          <Input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            bg="white" 
            borderRadius="30px" 
            border="1px" 
            borderColor={error ? "red.300" : "Primary.800"} 
            boxShadow="md" 
          />
        </InputGroup>

        {error && (
          <Text color="red.400" fontSize="sm" mt="10px" ml="8px" whiteSpace="pre-wrap">
            {error}
          </Text>
        )}

        <Flex justify="center" mt="40px">
          <Button 
            w="80%" 
            h="40px" 
            bg="Primary.800" 
            color="white" 
            borderRadius="30px" 
            fontSize="xl" 
            _hover={{ opacity: 0.9 }} 
            onClick={handleResetPassword}
            isDisabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Password"}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}