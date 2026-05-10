import { Flex, Box, Text, Input, Button, InputGroup, InputLeftElement, Image } from "@chakra-ui/react"; 
import { MdArrowBack, MdLock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState } from "react"; 
import Logo from "../images/Logo.jpeg";
  
export default function ResetPassword(){
  
    const navigate = useNavigate();
  
    const [password, setPassword] = useState("");
  
    const [confirmPassword, setConfirmPassword] =
      useState("");
  
    const [error, setError] = useState("");
  
    const handleResetPassword = () => {
  
      if(password !== confirmPassword){
  
        setError("Password does not match");
  
        return;
      }
  
      setError("");
  
      const savedUser =
        JSON.parse(localStorage.getItem("userProfile"));
  
      const updatedUser = {
        ...savedUser,
        password
      };
  
      localStorage.setItem(
        "userProfile",
        JSON.stringify(updatedUser)
      );
  
      navigate("/");
    };
  
    return(
      <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="70px" >
        <Box position="relative" bg="white" w="100%" maxW="380px" minH="650px" borderRadius="30px" px="28px" pt="75px" pb="40px" boxShadow="lg">
          <Flex position="absolute" top="-70px" left="50%" transform="translateX(-50%)"justify="center" align="center" w="100%" >
            <Image src={Logo} w="150px" objectFit="contain" />
          </Flex>
          <Text textAlign="center" color="Primary.900" fontWeight="bold" fontSize="xl" fontFamily="title" mb="50px" >
            Catatan Hewanku
          </Text>
          <Flex justify="flex-start" mb="20px">
            <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} >
              <MdArrowBack size="30px"/>
            </Box>
          </Flex>

          <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="xl" mb="40px" >
            Create New Password
          </Text>

          <InputGroup mb="20px">
            <InputLeftElement pointerEvents="none" color="Primary.800" >
              <MdLock size="20px"/>
            </InputLeftElement>
  
            <Input type="password" placeholder="New Password" value={password}
              onChange={(e) => setPassword(e.target.value) } bg="Neutral.100" borderRadius="30px"border="1px" borderColor="Primary.800" boxShadow="md" />
          </InputGroup>
  
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="Primary.800" >
              <MdLock size="20px"/>
            </InputLeftElement>
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value) } bg="white" borderRadius="30px" border="1px"borderColor={ error ? "red.300" : "Primary.800" } boxShadow="md"/>
          </InputGroup>
          {error && (
            <Text color="red.400" fontSize="sm" mt="10px" ml="8px" >
              {error}
            </Text> 
          )}

          <Flex justify="center" mt="40px">
            <Button w="80%" h="40px" bg="Primary.800" color="white" borderRadius="30px" fontSize="xl" _hover={{ opacity: 0.9 }} onClick={handleResetPassword} >
              Save Password
            </Button>
          </Flex>
        </Box>
      </Flex>
    )
  }