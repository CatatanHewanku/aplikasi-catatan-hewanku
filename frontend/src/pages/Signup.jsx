import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, InputRightElement, Image, Link } from "@chakra-ui/react";
import { MdEmail, MdLock, MdPerson, MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { removeEmojis } from "../utils/textUtils";
import { useSilentRefresh } from "../utils/useSilentRefresh.js";
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

export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { isLoading, loadingText, executeWithRetry } = useSilentRefresh();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFirstName = (e) => {
    const value = e.target.value;

    if (value.length > 30) {
      setNameError("Name cannot exceed 30 characters");
      return;
    }

    const regex = /^[A-Za-z\s]*$/;
    if (regex.test(value)) {
      setFirstName(value);
      setNameError("");
    } else {
      setNameError("Name cannot contain numbers or symbols");
    }
  };

  const handleSignUp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) { setNameError("Name is required"); return; }
    if (firstName.length > 30) { setNameError("Name cannot exceed 30 characters"); return; }
    if (!email.trim()) { setPasswordError("Email is required"); return; }
    if (!emailRegex.test(email)) {
      setPasswordError("Invalid email format.");
      return;
    }
    if (!phone.trim() || phone.length < 11 || phone.length > 12) { setPasswordError("Valid phone number is required"); return; }
    if (!password) { setPasswordError("Password is required"); return; }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) { setPasswordError(passwordErrors.join("\n")); return; }

    if (password !== confirmPassword) { setPasswordError("Password does not match"); return; }

    setPasswordError("");
    setNameError("");

    await executeWithRetry(
      () => authService.signup(firstName, email, phone, password),
      {
        defaultLoadingText: "Signing Up...",

        onSuccess: () => {
          console.log("Backend signup success");
          localStorage.setItem("isLogin", "true");
          window.location.href = "/";
        },

        onError: (backendError) => {
          console.log("Backend signup failed:", backendError);
          const errorMessage = backendError?.response?.data?.message || backendError?.message || "Signup failed. Try with a new email.";
          setPasswordError(errorMessage);
        }
      }
    );
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px">
      <Box position="relative" bg="white" w="100%" maxW="380px" minH="700px" borderRadius="30px" px="28px" pt="65px" pb="40px" boxShadow="lg" >
        <Flex position="absolute" top="-80px" left="50%" transform="translateX(-50%)" justify="center" align="center">
          <Image src={Logo} w="150px" objectFit="contain" />
        </Flex>
        <Text textAlign="center" color="Primary.800" fontFamily="title" fontWeight="bold" fontSize="xl" mb="30px">
          Catatan Hewanku
        </Text>

        <Text textAlign="center" color="Primary.800" fontFamily="heading" fontWeight="bold" fontSize="2xl" mb="40px" >
          Sign Up
        </Text>

        <Flex direction="column" gap={4}>
          <InputGroup >
            <InputLeftElement pointerEvents="none" color="Primary.800">
              <MdPerson size="20px" />
            </InputLeftElement>
            <Input placeholder="Name" maxLength={30} value={firstName} onChange={handleFirstName} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800">
              <MdEmail size="20px" />
            </InputLeftElement>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(removeEmojis(e.target.value))} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800" >
              <MdPhone size="20px" />
            </InputLeftElement>
            <Input placeholder="Phone Number" value={phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, ""); setPhone(removeEmojis(value)); }} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800"><MdLock size="20px" /></InputLeftElement>
            <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(removeEmojis(e.target.value))} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
            <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <MdVisibilityOff color="gray" size="20px" /> : <MdVisibility color="gray" size="20px" />}
            </InputRightElement>
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800"><MdLock size="20px" /></InputLeftElement>
            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(removeEmojis(e.target.value))} bg="white" borderRadius="30px" border="1px" borderColor={passwordError ? "red.300" : "Primary.800"} boxShadow="md" _focus={{ borderColor: passwordError ? "red.300" : "Primary.800", boxShadow: "md" }} />
            <InputRightElement cursor="pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <MdVisibilityOff color="gray" size="20px" /> : <MdVisibility color="gray" size="20px" />}
            </InputRightElement>
          </InputGroup>

          {(nameError || passwordError) && (
            <Text color="red.400" fontSize="sm" whiteSpace="pre-wrap" mt="-2">
              {[nameError, passwordError].filter(Boolean).join("\n")}
            </Text>
          )}

        </Flex>

        <Flex align="center" direction="column">
          <Button
            mt="20px"
            w="80%"
            h="40px"
            bg="Primary.800"
            color="Neutral.100"
            borderRadius="30px"
            fontFamily="body"
            fontSize="xl"
            fontWeight="medium"
            boxShadow="md"
            _hover={{ opacity: 0.9 }}
            onClick={handleSignUp}
            isDisabled={isLoading}
          >
            {isLoading ? loadingText : "Sign Up"}
          </Button>

          <Text fontSize="sm" textAlign="center" mt="10px" color="Primary.800" >
            Already have account? <Link color="Primary.800" onClick={() => navigate("/")}>Log In</Link>
          </Text>

        </Flex>
      </Box>

    </Flex>
  )
}