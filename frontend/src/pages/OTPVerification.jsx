import { Flex, Box, Text, Input, Button, Image } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { removeEmojis } from "../utils/textUtils";
// import Logo from "../images/Logo.jpeg";
import Logo from "../images/Logo_fix.PNG";

export default function OtpVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("resetEmail") || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    if (otp.length < 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setError("");

    try {
      // Try backend first
      const savedEmail = localStorage.getItem("resetEmail");
      await authService.verifyCode(savedEmail, otp);
      // If successful, go to reset password page
      navigate("/reset-password");
    } catch (error) {
      console.log("Backend verify code failed:", error);
      setError(error?.message || "Invalid OTP. Try again.");
    }
  };



  return (

    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      `        <Box position="relative" bg="white" w="100%" maxW="380px" minH="650px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg" >
        <Flex position="absolute" top="-70px" left="50%" transform="translateX(-50%)" justify="center" align="center" w="100%" >
          <Image src={Logo} w="150px" objectFit="contain" />
        </Flex>
        <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="xl" fontFamily="title" mb="50px" >
          Catatan Hewanku
        </Text>

        <Flex justify="flex-start" mb="20px">
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} >
            <MdArrowBack size="30px" />
          </Box>
        </Flex>
        <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl" mb="20px">
          OTP Verification
        </Text>

        <Text textAlign="center" color="Primary.700" fontSize="sm" mb="32px" >
          Enter the 6 digit OTP sent
          to your registered email.
        </Text>

        <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(removeEmojis(e.target.value))} textAlign="center" maxLength={6} fontSize="xl" letterSpacing="10px" bg="white" borderRadius="30px" border="1px" borderColor={error ? "red.300" : "Primary.800"} boxShadow="md" _focus={{ borderColor: error ? "red.300" : "Primary.800", boxShadow: "md" }} />
        {error && (
          <Text textAlign="center" color="red.400" fontSize="sm" mt="12px" >
            {error}
          </Text>
        )}

        <Flex justify="center" mt="30px">

          <Button w="80%" h="40px" bg="Primary.800" color="Neutral.100" borderRadius="30px" fontSize="xl" _hover={{ opacity: 0.9 }} onClick={handleVerifyOtp} >
            Verify OTP
          </Button>

        </Flex>

      </Box>

    </Flex>
  )
}