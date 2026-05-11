import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, Image } from "@chakra-ui/react";
import { MdEmail, MdLock, MdPerson, MdPhone } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/Logo.jpeg";
import { authService } from "../services/authService";


export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstName = (e) => {
    const value = e.target.value;
    const regex = /^[A-Za-z\s]*$/;
    if (regex.test(value)) {
      setFirstName(value);
      setNameError("");
    } else {
      setNameError(
        "First name cannot contain numbers or symbols"
      );
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!firstName.trim()) {
      setNameError("First name is required");
      return;
    }
    if (!email.trim()) {
      setPasswordError("Email is required");
      return;
    }
    if (!email.includes('@')) {
      setPasswordError("Invalid email format");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setPasswordError("Valid phone number is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Password does not match");
      return;
    }

    setPasswordError("");
    setNameError("");
    setIsLoading(true);

    try {
      console.log("Calling authService.signup...");
      await authService.signup(firstName, email, phone, password);
      console.log("Backend signup success");
      localStorage.setItem("isLogin", "true");
      window.location.href = "/";
    } catch (backendError) {
      console.log("Backend signup failed:", backendError);
      setPasswordError(backendError?.message || "Signup failed. Try with a new email.");
      setIsLoading(false);
    }
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
            <Input placeholder="First Name" value={firstName} onChange={handleFirstName} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>
          {nameError && (
            <Text color="red.400" fontSize="sm" ml="8px">
              {nameError}
            </Text>
          )}
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800">
              <MdEmail size="20px" />
            </InputLeftElement>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800" >
              <MdPhone size="20px" />
            </InputLeftElement>
            <Input placeholder="Phone Number" value={phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, ""); setPhone(value); }} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800">
              <MdLock size="20px" />
            </InputLeftElement>
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} bg="white" borderRadius="30px" border="1px" borderColor="Primary.800" boxShadow="md" _focus={{ borderColor: "Primary.800", boxShadow: "md" }} />
          </InputGroup>

          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800">
              <MdLock size="20px" />
            </InputLeftElement>
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} bg="white" borderRadius="30px" border="1px" borderColor={passwordError ? "red.300" : "Primary.800"} boxShadow="md" _focus={{ borderColor: passwordError ? "red.300" : "Primary.800", boxShadow: "md" }} />
          </InputGroup>
          {passwordError && (
            <Text color="red.400" fontSize="sm" ml="8px" >
              {passwordError}
            </Text>
          )}
        </Flex>
        <Flex align="center" direction="column">
          <Button
            mt="40px"
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
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>

          <Text textAlign="center" m="20px" color="Primary.800" >
            Already have account?
          </Text>

          <Button w="80%" h=" 40px" bg="Neutral.100" color="Primary.800" borderRadius="30px" border="2px" borderColor="Primary.800" fontFamily="body" fontSize="xl" fontWeight="medium" boxShadow="md" _hover={{ bg: "Primary.100" }} onClick={() => navigate("/")} >
            Log In
          </Button>
        </Flex>

      </Box>

    </Flex>
  )
}