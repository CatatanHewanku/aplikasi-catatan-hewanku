import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, InputRightElement, Image, useToast } from "@chakra-ui/react";
import { MdArrowBack, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { removeEmojis } from "../utils/textUtils";
import Logo from "../images/Logo_fix.png";

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
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loggedInOwner = JSON.parse(localStorage.getItem("owner"));
  const savedCode = localStorage.getItem("resetCode");
  const isChangeMode = !!loggedInOwner && !savedCode;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (message, status = "success") => {
    toast({
      position: "top",
      duration: 3500,
      render: () => (
        <Box bg={status === "error" ? "red.500" : "Primary.800"} color="white" px={6} py={3} borderRadius="30px" textAlign="center" fontWeight="bold" boxShadow="xl" mt="20px">
          {message}
        </Box>
      ),
    });
  };

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
        const formData = new FormData();
        formData.append("password", password);

        const response = await fetch(`/api/owners/${loggedInOwner.owner_id}`, {
          method: "PATCH",
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          showToast("Password changed successfully!", "success"); // TOAST INSTALLED
          navigate(-1);
        } else {
          throw new Error(result.message || "Failed to change password.");
        }
      } else {
        const savedEmail = localStorage.getItem("resetEmail");

        if (!savedEmail || !savedCode) {
          throw new Error("Missing reset credentials. Please restart the password reset process.");
        }

        await authService.resetPassword(savedEmail, savedCode, password);

        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetCode");

        showToast("Password reset successfully!", "success");
        navigate("/");
      }
    } catch (error) {
      setError(error?.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg">

        <Flex position="absolute" top="-60px" left="50%" transform="translateX(-50%)" justify="center" align="center" w="100%">
          <Image src={Logo} w="120px" objectFit="contain" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" borderRadius="full" />
        </Flex>

        <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="2xl" fontFamily="title" mb="40px">
          Catatan Hewanku
        </Text>

        <Flex justify="space-between" align="center" mb="30px">
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} _hover={{ transform: "scale(1.1)" }} transition="all 0.2s">
            <MdArrowBack size="28px" />
          </Box>
          <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl">
            {isChangeMode ? "Change Password" : "Create New Password"}
          </Text>
          <Box w="28px" />
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
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(removeEmojis(e.target.value))}
                bg="white"
                borderRadius="30px"
                border="1px solid"
                borderColor="Primary.300"
              />
              <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <MdVisibilityOff color="gray" size="20px" /> : <MdVisibility color="gray" size="20px" />}
              </InputRightElement>
            </InputGroup>
          </Box>

          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">
              Confirm Password
            </Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800"><MdLock size="20px" /></InputLeftElement>
              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(removeEmojis(e.target.value))} bg="white" borderRadius="30px" border="1px solid" borderColor={error ? "red.400" : "Primary.300"} focusBorderColor="Primary.800" color="Primary.900" fontWeight="medium" boxShadow="sm" />
              <InputRightElement cursor="pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <MdVisibilityOff color="gray" size="20px" /> : <MdVisibility color="gray" size="20px" />}
              </InputRightElement>
            </InputGroup>
          </Box>
        </Flex>

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