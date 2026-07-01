import { Flex, Box, Text, Image, Button, Input, InputGroup, InputLeftElement, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter } from "@chakra-ui/react";
import { MdArrowBack, MdPerson, MdEmail, MdPhone, MdLock, MdCameraAlt, MdPets, MdWarning } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useSilentRefresh } from "../utils/useSilentRefresh.js"; // 1. IMPORT HOOK

export default function UserProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  const [owner_name, setOwner_name] = useState("");
  const [owner_email, setOwner_email] = useState("");
  const [owner_phone_number, setOwner_phone_number] = useState("");
  const [owner_image_url, setOwner_image_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  
  const { isLoading, loadingText, executeWithRetry } = useSilentRefresh();

  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (message, status = "success") => {
    toast({
      position: "top",
      duration: 3000,
      render: () => (
        <Box bg={status === "error" ? "red.500" : "Primary.800"} color="white" px={6} py={3} borderRadius="30px" textAlign="center" fontWeight="bold" boxShadow="xl" mt="20px">
          {message}
        </Box>
      ),
    });
  };

  useEffect(() => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));

    if (ownerData) {
      setOwner_name(ownerData.owner_name || "");
      setOwner_email(ownerData.owner_email || "");
      setOwner_phone_number(ownerData.owner_phone_number || "");
      setOwner_image_url(ownerData.owner_image_url || "");

      setInitialData({
        name: ownerData.owner_name || "",
        email: ownerData.owner_email || "",
        phone: ownerData.owner_phone_number || "",
        image: ownerData.owner_image_url || ""
      });
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid file format! Please upload only JPG or PNG images.", "error");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);
    setOwner_image_url(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setOwner_name(initialData.name);
    setOwner_email(initialData.email);
    setOwner_phone_number(initialData.phone);
    setOwner_image_url(initialData.image);
    setSelectedFile(null);
    setIsEdit(false);
  };

  const handleSave = async () => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));
    if (!ownerData?.owner_id) {
      showToast("User not found", "error");
      return;
    }

    if (!owner_name.trim()) { showToast("Name is required", "error"); return; }
    if (owner_name.length > 30) { showToast("Name cannot exceed 30 characters", "error"); return; }
    
    if (!owner_email.trim()) { showToast("Email is required", "error"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(owner_email)) { showToast("Invalid email format", "error"); return; }
    
    if (!owner_phone_number.trim() || owner_phone_number.length < 11 || owner_phone_number.length > 12) { 
      showToast("Invalid phone number", "error"); 
      return; 
    }

    await executeWithRetry(
      async () => {
        const formData = new FormData();
        formData.append("owner_name", owner_name);
        formData.append("owner_email", owner_email);
        formData.append("owner_phone_number", owner_phone_number);

        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        const response = await fetch(`/api/owners/${ownerData.owner_id}`, { 
          method: "PATCH", 
          body: formData 
        });

        const result = await response.json();
        
        if (!response.ok) {
          const err = new Error(result.message || "Failed to update profile");
          err.status = response.status;
          throw err;
        }

        return result;
      },
      {
        defaultLoadingText: "Saving...",
        onSuccess: (result) => {
          const finalImageUrl = result.data?.owner_image_url || owner_image_url;

          const updatedOwner = {
            ...ownerData,
            owner_name,
            owner_email,
            owner_phone_number,
            owner_image_url: finalImageUrl
          };
          localStorage.setItem("owner", JSON.stringify(updatedOwner));

          setInitialData({
            name: owner_name,
            email: owner_email,
            phone: owner_phone_number,
            image: finalImageUrl
          });

          showToast("Profile updated successfully!");
          setIsEdit(false);
          setSelectedFile(null);
        },
        onError: (backendError) => {
          console.error("Save error:", backendError);
          showToast(backendError.message || "Error updating profile", "error");
        }
      }
    );
  };

  const handleDeleteAccount = async () => {
    try {
      const ownerData = JSON.parse(localStorage.getItem("owner"));
      if (!ownerData?.owner_id) return;

      const response = await fetch(`/api/owners/${ownerData.owner_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast("Account deleted successfully.");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("token");
        localStorage.removeItem("owner");
        window.location.href = "/";
      } else {
        const result = await response.json();
        showToast(result.message || "Failed to delete account.", "error");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      showToast("An error occurred while deleting your account.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("owner");
    window.location.href = "/";
  };

  return (
    <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="40px">
      <Box position="relative" bg="white" w="100%" maxW="380px" borderRadius="30px" px="28px" pt="30px" pb="40px" boxShadow="lg">

        <Flex justify="space-between" align="center" mb="20px">
          <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)} _hover={{ transform: "scale(1.1)" }} transition="all 0.2s">
            <MdArrowBack size="28px" />
          </Box>
          <Text color="Primary.900" fontWeight="bold" fontFamily="heading" fontSize="xl">
            User Profile
          </Text>
          {!isEdit ? (
            <Text color="Primary.800" cursor="pointer" fontWeight="bold" fontSize="md" onClick={() => setIsEdit(true)}>
              Edit
            </Text>
          ) : (
            <Text color="red.500" cursor="pointer" fontWeight="bold" fontSize="md" onClick={handleCancel}>
              Cancel
            </Text>
          )}
        </Flex>

        <Flex justify="center" mb="30px" mt="20px">
          <Box position="relative" cursor={isEdit ? "pointer" : "default"} transition="all 0.2s" _hover={isEdit ? { transform: "scale(1.05)" } : {}}>
            <Flex boxSize="120px" borderRadius="full" bg="Primary.100" justify="center" align="center" overflow="hidden" boxShadow="sm" border="4px solid white">
              {owner_image_url ? (
                <Image src={owner_image_url} boxSize="120px" borderRadius="full" objectFit="cover" />
              ) : (
                <Box color="Primary.800" fontSize="50px">
                  <MdPets />
                </Box>
              )}
            </Flex>
            {isEdit && (
              <>
                <Flex position="absolute" bottom="0" right="0" bg="Primary.800" boxSize="36px" borderRadius="full" justify="center" align="center" color="white" boxShadow="md" border="3px solid white">
                  <MdCameraAlt size="18px" />
                </Flex>
                <Input type="file" accept="image/*" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleImageChange} />
              </>
            )}
          </Box>
        </Flex>

        <Flex direction="column" gap={5}>
          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">Full Name</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800"><MdPerson /></InputLeftElement>
              <Input 
                maxLength={30} 
                value={owner_name} 
                onChange={(e) => setOwner_name(e.target.value.replace(/[^A-Za-z\s]/g, ""))} 
                isReadOnly={!isEdit} 
                bg={isEdit ? "white" : "Neutral.100"} 
                borderRadius="30px" 
                border={isEdit ? "1px solid" : "none"} 
                borderColor="Primary.300" 
                focusBorderColor="Primary.800" 
                fontWeight="medium" 
                color="Primary.900" 
                transition="all 0.2s" 
              />
            </InputGroup>
          </Box>

          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">Email Address</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800"><MdEmail /></InputLeftElement>
              <Input 
                value={owner_email} 
                onChange={(e) => setOwner_email(e.target.value.trim())} 
                isReadOnly={!isEdit} 
                bg={isEdit ? "white" : "Neutral.100"} 
                borderRadius="30px" 
                border={isEdit ? "1px solid" : "none"} 
                borderColor="Primary.300" 
                focusBorderColor="Primary.800" 
                fontWeight="medium" 
                color="Primary.900" 
                transition="all 0.2s" 
              />
            </InputGroup>
          </Box>

          <Box>
            <Text ml={4} mb={1} fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase" letterSpacing="wide">Phone Number</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="Primary.800"><MdPhone /></InputLeftElement>
              <Input 
                maxLength={12} 
                value={owner_phone_number} 
                onChange={(e) => setOwner_phone_number(e.target.value.replace(/\D/g, ""))} 
                isReadOnly={!isEdit} 
                bg={isEdit ? "white" : "Neutral.100"} 
                borderRadius="30px" 
                border={isEdit ? "1px solid" : "none"} 
                borderColor="Primary.300" 
                focusBorderColor="Primary.800" 
                fontWeight="medium" 
                color="Primary.900" 
                transition="all 0.2s" 
              />
            </InputGroup>
          </Box>

          {isEdit && (
            <Button w="100%" h="45px" bg="transparent" border="1px solid" borderColor="Primary.800" color="Primary.800" borderRadius="30px" leftIcon={<MdLock size="20px" />} onClick={() => navigate("/reset-password")} _hover={{ bg: "Primary.100" }} fontWeight="bold">
              Change Password
            </Button>
          )}
        </Flex>

        {isEdit ? (
          <Flex direction="column" gap={3} mt="20px">
            <Button w="100%" h="50px" bg="Primary.800" color="white" borderRadius="30px" fontSize="lg" fontWeight="bold" _hover={{ opacity: 0.9 }} onClick={handleSave} isDisabled={isLoading} boxShadow="md">
              {isLoading ? loadingText : "Save Changes"}
            </Button>
            <Button w="100%" h="50px" bg="white" color="red.500" border="1px solid" borderColor="red.500" borderRadius="30px" fontSize="lg" fontWeight="bold" _hover={{ bg: "red.50" }} onClick={onOpenDelete}>
              Delete Account
            </Button>
          </Flex>
        ) : (
          <Flex justify="center" mt="20px">
            <Button variant="ghost" color="red.500" fontWeight="bold" onClick={handleLogout} _hover={{ bg: "red.50" }} borderRadius="30px" w="100%">
              Log Out
            </Button>
          </Flex>
        )}
      </Box>

      <Modal isOpen={isDeleteOpen} onClose={onCloseDelete} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="24px" mx="20px" p={4} textAlign="center" boxShadow="2xl">
          <ModalBody>
            <Flex justify="center" mb={4}>
              <Flex boxSize="60px" borderRadius="full" bg="red.50" justify="center" align="center" color="red.500">
                <MdWarning size="32px" />
              </Flex>
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="Primary.900" mb={2}>Delete Account?</Text>
            <Text color="Primary.800" fontSize="sm" mb={4}>
              Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter display="flex" gap={3} justifyContent="center" pt={0}>
            <Button flex="1" bg="Neutral.100" color="Primary.800" borderRadius="30px" onClick={onCloseDelete}>
              Cancel
            </Button>
            <Button flex="1" bg="red.500" color="white" borderRadius="30px" onClick={handleDeleteAccount} _hover={{ bg: "red.600" }}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Flex>
  );
}