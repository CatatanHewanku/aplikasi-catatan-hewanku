import { Flex, Box, Text, Input, Button, Image, Link } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { useSilentRefresh } from "../utils/useSilentRefresh.js";
import Logo from "../images/Logo_fix.png";

export default function OtpVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  const { isLoading, loadingText, executeWithRetry } = useSilentRefresh();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!localStorage.getItem("resetEmail")) {
      navigate("/forgot-password-email");
    }
  }, [navigate]);

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

    await executeWithRetry(
      () => {
        const savedEmail = localStorage.getItem("resetEmail");
        return authService.verifyCode(savedEmail, otp);
      },
      {
        defaultLoadingText: "Verifying...",
        onSuccess: () => {
          localStorage.setItem("resetCode", otp);
          navigate("/reset-password");
        },
        onError: (backendError) => {
          setError(backendError?.response?.data?.message || backendError?.message || "Invalid OTP. Try again.");
        }
      }
    );
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    try {
      const savedEmail = localStorage.getItem("resetEmail");
      await authService.forgotPassword(savedEmail); 
      alert("A new OTP code has been sent to your email.");
    } catch (resendError) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" minH="650px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg" >
        <Flex position="absolute" top="-70px" left="50%" transform="translateX(-50%)" justify="center" align="center" w="100%" >
          <Image src={Logo} w="150px" objectFit="contain" />
        </Flex>
        <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="xl" fontFamily="title" mb="50px" >
          Catatan Hewanku
        </Text>

        <Flex position="relative" w="100%" justify="center" align="center" mb="24px">
          <Box position="absolute" left="0" color="Primary.800" cursor="pointer" onClick={() => navigate("/")}>
            <MdArrowBack size="30px" />
          </Box>
          <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl">
            OTP Verification
          </Text>
        </Flex>

        <Text textAlign="center" color="Primary.700" fontSize="sm" mb="32px" whiteSpace="pre-wrap">
          Enter the 6 digit OTP sent{"\n"}to your registered email.
        </Text>

        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          textAlign="center"
          maxLength={6}
          fontSize="xl"
          letterSpacing="10px"
          bg="white"
          borderRadius="30px"
          border="1px"
          borderColor={error ? "red.300" : "Primary.800"}
          boxShadow="md"
          _focus={{ borderColor: error ? "red.300" : "Primary.800", boxShadow: "md" }}
        />

        {error && (
          <Text textAlign="center" color="red.400" fontSize="sm" mt="12px" >
            {error}
          </Text>
        )}

        <Flex justify="center" mt="30px">
          <Button
            w="80%"
            h="40px"
            bg="Primary.800"
            color="Neutral.100"
            borderRadius="30px"
            fontSize="xl"
            _hover={{ opacity: 0.9 }}
            onClick={handleVerifyOtp}
            isDisabled={isLoading}
          >
            {isLoading ? loadingText : "Verify OTP"}
          </Button>
        </Flex>

        <Text fontSize="sm" textAlign="center" mt="20px" color="Primary.700">
          Didn't receive the code?{" "}
          <Link
            color="Primary.800"
            fontWeight="semibold"
            onClick={isResending ? null : handleResendOtp}
            style={{ pointerEvents: isResending ? "none" : "auto", opacity: isResending ? 0.5 : 1 }}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </Link>
        </Text>

      </Box>
    </Flex>
  );
}