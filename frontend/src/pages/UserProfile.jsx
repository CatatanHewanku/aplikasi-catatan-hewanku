import { Flex, Box, Text, Image, Button, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { MdArrowBack, MdPerson, MdEmail, MdPhone, MdLock, MdCameraAlt } from "react-icons/md";
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import Logo from "../images/Logo.jpeg";
  
export default function UserProfile(){
  
    const navigate = useNavigate();
  
    const [user, setUser] = useState(null);
  
    const [isEdit, setIsEdit] = useState(false);
  
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");
  
    useEffect(() => {
      const savedUser =
        JSON.parse(localStorage.getItem("userProfile"));
  
      if(savedUser){
  
        setUser(savedUser);
  
        setFirstName(savedUser.firstName || "");
        setEmail(savedUser.email || "");
        setPhone(savedUser.phone || "");
        setPassword(savedUser.password || "");
        setImage(savedUser.image || "");
      }
  
    }, []);
  
    const handleImageUpload = (e) => {
  
      const file = e.target.files[0];
  
      if(!file) return;
  
      const reader = new FileReader();
  
      reader.onloadend = () => {
  
        setImage(reader.result);
      };
  
      reader.readAsDataURL(file);
    };
  
    const handleSave = () => {
  
      const updatedUser = {
        firstName,
        email,
        phone,
        password,
        image
      };
  
      localStorage.setItem(
        "userProfile",
        JSON.stringify(updatedUser)
      );
  
      setUser(updatedUser);
  
      setIsEdit(false);
    };
  
    const handleLogout = () => {
  
      localStorage.removeItem("isLogin");
  
      window.location.href = "/";
    };
  
    if(!user) return null;
  
    return(
      <Flex minH="100vh"bg="Primary.100" justify="center" align="center" px="20px" py="40px" >
        <Box position="relative"bg="white" w="100%" maxW="380px" minH="750px"  borderRadius="30px"px="28px" pt="30px" pb="40px" boxShadow="lg" >
          <Flex justify="space-between" mb="20px">
            <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} >
              <MdArrowBack size="30px"/>
            </Box>
            {!isEdit && (
              <Text color="Primary.800" cursor="pointer" fontWeight="medium" onClick={() => setIsEdit(true)}>
                Edit
              </Text>
            )}
          </Flex>
          <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="2xl" mb="30px" >
            User Profile
          </Text>
  
          <Flex justify="center" mb="30px">
            <Box position="relative" cursor={isEdit ? "pointer" : "default"} >
              <Image src={ image || "https://via.placeholder.com/120" } boxSize="120px" borderRadius="full" objectFit="cover" bg="Primary.100" />
              {isEdit && (
                <>
                  <Flex position="absolute"bottom="0" right="0" bg="Primary.800" boxSize="36px" borderRadius="full" justify="center" align="center" color="white" boxShadow="md" >
                    <MdCameraAlt size="20px"/>
                  </Flex>
                  <Input type="file" accept="image/*" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer"onChange={handleImageUpload} />
                </>
              )}
            </Box>
          </Flex>
  
          <Flex direction="column" gap={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800" >
                <MdPerson />
              </InputLeftElement>

              <Input value={firstName} onChange={(e) => setFirstName( e.target.value.replace( /[^A-Za-z\s]/g,"" ))} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
            </InputGroup>

            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800"
              >
                <MdEmail />
              </InputLeftElement>
  
              <Input value={email} onChange={(e) => setEmail(e.target.value)} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800"/>
            </InputGroup>
  
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800">
                <MdPhone />
              </InputLeftElement>
              <Input value={phone} onChange={(e) => { const value = e.target.value.replace(/\D/g, ""); setPhone(value); }} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
            </InputGroup>
  
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800">
                <MdLock />
              </InputLeftElement>
              <Input type="password" value={password} onChange={(e) =>setPassword(e.target.value) } isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
            </InputGroup>
          </Flex>
  
          {isEdit && (
            <Flex justify="center" mt="40px" >
              <Button w="80%" h="42px" bg="Primary.800" color="white" borderRadius="30px"fontSize="xl" _hover={{ opacity: 0.9 }} onClick={handleSave} >
                Save
              </Button>
            </Flex>
          )}
  
          <Flex justify="center" mt="20px" >
            <Button variant="ghost" color="red.400" onClick={handleLogout} >
              Logout
            </Button>
          </Flex>
        </Box>
      </Flex>
    )
  }