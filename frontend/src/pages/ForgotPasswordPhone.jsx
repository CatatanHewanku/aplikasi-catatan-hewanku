import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, Image } from "@chakra-ui/react";
import { MdPhone, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
// import Logo from "../images/Logo.jpeg";
import Logo from "../images/Logo_fix.PNG";

export default function ForgotPasswordPhone() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (phone.length < 10) {
      setError("Valid phone number is required");
      return;
    }

    setError("");

    try {
      await authService.forgotPassword(phone);
      localStorage.setItem("resetEmail", phone);
      navigate("/otp-verification");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
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
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate("/")}>
            <MdArrowBack size="30px" />
          </Box>
        </Flex>

        <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl" mb="20px">
          Reset Password
        </Text>

        <Text textAlign="center" color="Primary.700" fontSize="sm" mb="32px" whiteSpace="pre-wrap">
          Enter your registered phone number.
          {"\n"}
          Reset instructions will be sent
          to your registered email.
        </Text>

        <InputGroup>
          <InputLeftElement pointerEvents="none" color="Primary.800">
            <MdPhone size="20px" />
          </InputLeftElement>
          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            fontFamily="body"
            fontSize="lg"
            bg="white"
            borderRadius="30px"
            border="1px"
            borderColor={error ? "red.300" : "Primary.800"}
            boxShadow="md"
            _focus={{ borderColor: error ? "red.300" : "Primary.800", boxShadow: "md" }}
          />
        </InputGroup>

        {error && (
          <Text textAlign="center" color="red.400" fontSize="sm" mt="14px">
            {error}
          </Text>
        )}

        <Flex justify="center" mt="30px">
          <Button
            w="80%"
            h="40px"
            bg="Primary.800"
            color="white"
            borderRadius="30px"
            fontSize="xl"
            _hover={{ opacity: 0.9 }}
            onClick={handleSendOtp}
          >
            Send OTP
          </Button>
        </Flex>

        <Text textAlign="center" mt="24px" color="Primary.700" cursor="pointer" onClick={() => navigate("/forgot-password-email")}>
          Use email instead
        </Text>
      </Box>
    </Flex>
  );
}