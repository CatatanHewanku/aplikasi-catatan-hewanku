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

  // SMART DETECTION: Are we changing a known password, or resetting a forgotten one?
  const loggedInOwner = JSON.parse(localStorage.getItem("owner"));
  const savedCode = localStorage.getItem("resetCode");
  const isChangeMode = !!loggedInOwner && !savedCode;

  const handleResetPassword = async () => {
    if (!password) {
      setError("Password is required.");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join("\n"));
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (isChangeMode) {
        // --- 1. CHANGE PASSWORD FLOW (Logged In User) ---
        const formData = new FormData();
        formData.append("password", password);

        // Reusing the exact same endpoint from UserProfile
        const response = await fetch(`http://localhost:4000/api/owners/${loggedInOwner.owner_id}`, {
          method: "PATCH",
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          alert("Password changed successfully!");
          navigate(-1); // Send them right back to their profile
        } else {
          throw new Error(result.message || "Failed to change password.");
        }
      } else {
        // --- 2. FORGOT PASSWORD FLOW (Email OTP) ---
        const savedEmail = localStorage.getItem("resetEmail");

        if (!savedEmail || !savedCode) {
          throw new Error("Missing reset credentials. Please restart the password reset process.");
        }
        
        await authService.resetPassword(savedEmail, savedCode, password);
        
        // Clean up memory
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetCode");
        
        alert("Password reset successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Password update error:", error);
      setError(error?.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg">
        
        {/* Floating Logo */}
        <Flex position="absolute" top="-60px" left="50%" transform="translateX(-50%)" justify="center" align="center" w="100%">
          <Image src={Logo} w="120px" objectFit="contain" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" borderRadius="full" />
        </Flex>

        <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="2xl" fontFamily="title" mb="40px">
          Catatan Hewanku
        </Text>

        {/* Dynamic Header Row */}
        <Flex justify="space-between" align="center" mb="30px">
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} _hover={{ transform: "scale(1.1)" }} transition="all 0.2s">
            <MdArrowBack size="28px" />
          </Box>
          <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl">
            {isChangeMode ? "Change Password" : "Create New Password"}
          </Text>
          <Box w="28px" /> {/* Empty box for perfect flex centering */}
        </Flex>

        <Flex direction="column" gap={5}>
          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">
              New Password
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800">
                <MdLock size="20px" />
              </InputLeftElement>
              <Input 
                type="password" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                bg="white" 
                borderRadius="30px" 
                border="1px solid" 
                borderColor="Primary.300" 
                focusBorderColor="Primary.800"
                color="Primary.900"
                fontWeight="medium"
                boxShadow="sm" 
              />
            </InputGroup>
          </Box>

          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">
              Confirm Password
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800">
                <MdLock size="20px" />
              </InputLeftElement>
              <Input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                bg="white" 
                borderRadius="30px" 
                border="1px solid" 
                borderColor={error ? "red.400" : "Primary.300"} 
                focusBorderColor="Primary.800"
                color="Primary.900"
                fontWeight="medium"
                boxShadow="sm" 
              />
            </InputGroup>
          </Box>
        </Flex>

        {/* Polished Error Box */}
        {error && (
          <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={3} mt={5}>
            <Text color="red.500" fontSize="sm" fontWeight="medium" whiteSpace="pre-wrap" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

        <Flex justify="center" mt="40px">
          <Button 
            w="100%" 
            h="50px" 
            bg="Primary.800" 
            color="white" 
            borderRadius="30px" 
            fontSize="lg" 
            fontWeight="bold"
            boxShadow="md"
            _hover={{ opacity: 0.9, transform: "translateY(-2px)" }} 
            transition="all 0.2s"
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