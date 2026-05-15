import { Flex, Box, Text, Image, Button, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { MdArrowBack, MdPerson, MdEmail, MdPhone, MdLock, MdCameraAlt, MdPets } from "react-icons/md";
import { useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export default function UserProfile() {
    const navigate = useNavigate();

    const [owner_name, setOwner_name] = useState("");
    const [owner_email, setOwner_email] = useState("");
    const [owner_phone_number, setOwner_phone_number] = useState("");
    const [password, setPassword] = useState("");
    const [owner_image_url, setOwner_image_url] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const ownerData = JSON.parse(localStorage.getItem("owner"));
        
        if (ownerData) {
            setOwner_name(ownerData.owner_name || "");
            setOwner_email(ownerData.owner_email || "");
            setOwner_phone_number(ownerData.owner_phone_number || "");
            setOwner_image_url(ownerData.owner_image_url || "");
        }
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setOwner_image_url(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const ownerData = JSON.parse(localStorage.getItem("owner"));
            if (ownerData?.owner_id) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`http://localhost:4000/api/owners/${ownerData.owner_id}/upload-image`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setOwner_image_url(data.image_url);
                    console.log("Image uploaded to Cloudinary:", data.image_url);
                }
            }
        } catch (error) {
            console.log("Backend image upload failed:", error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const ownerData = JSON.parse(localStorage.getItem("owner"));
            if (!ownerData?.owner_id) {
                alert("User not found");
                setIsLoading(false);
                return;
            }

            const updateData = {
                owner_name,
                owner_email,
                owner_phone_number
            };

            if (password) {
                updateData.password = password;
            }

            const response = await fetch(
                `http://localhost:4000/api/owners/${ownerData.owner_id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                }
            );

            const result = await response.json();

            if (response.ok) {
                const updatedOwner = {
                    ...ownerData,
                    owner_name,
                    owner_email,
                    owner_phone_number,
                    owner_image_url
                };
                localStorage.setItem("owner", JSON.stringify(updatedOwner));
                
                alert("Profile updated successfully");
                setIsEdit(false);
                setPassword("");
            } else {
                alert(result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Error updating profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem("isLogin");
            localStorage.removeItem("token");
            localStorage.removeItem("owner");
        }
        
        window.location.href = "/";
    };

    return (
        <Flex minH="100vh" bg="Primary.100" justify="center" align="center" px="20px" py="40px">
            <Box position="relative" bg="white" w="100%" maxW="380px" minH="750px" borderRadius="30px" px="28px" pt="30px" pb="40px" boxShadow="lg">
                <Flex justify="space-between" mb="20px">
                    <Box color="Primary.800" cursor="pointer" onClick={() => navigate(-1)}>
                        <MdArrowBack size="30px" />
                    </Box>
                    {!isEdit && (
                        <Text color="Primary.800" cursor="pointer" fontWeight="medium" onClick={() => setIsEdit(true)}>
                            Edit
                        </Text>
                    )}
                </Flex>

                <Text textAlign="center" color="Primary.800" fontWeight="bold" fontFamily="heading" fontSize="2xl" mb="30px">
                    User Profile
                </Text>

                <Flex justify="center" mb="30px">
                    <Box position="relative" cursor={isEdit ? "pointer" : "default"}>
                        <Flex boxSize="120px" borderRadius="full" bg="Primary.100" justify="center" align="center" overflow="hidden">
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
                                <Flex position="absolute" bottom="0" right="0" bg="Primary.800" boxSize="36px" borderRadius="full" justify="center" align="center" color="white" boxShadow="md">
                                    <MdCameraAlt size="20px" />
                                </Flex>
                                <Input type="file" accept="image/*" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleImageUpload} />
                            </>
                        )}
                    </Box>
                </Flex>

                <Flex direction="column" gap={4}>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="Primary.800">
                            <MdPerson />
                        </InputLeftElement>
                        <Input value={owner_name} onChange={(e) => setOwner_name(e.target.value.replace(/[^A-Za-z\s]/g, ""))} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
                    </InputGroup>

                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="Primary.800">
                            <MdEmail />
                        </InputLeftElement>
                        <Input value={owner_email} onChange={(e) => setOwner_email(e.target.value)} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
                    </InputGroup>

                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="Primary.800">
                            <MdPhone />
                        </InputLeftElement>
                        <Input value={owner_phone_number} onChange={(e) => setOwner_phone_number(e.target.value.replace(/\D/g, ""))} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
                    </InputGroup>

                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="Primary.800">
                            <MdLock />
                        </InputLeftElement>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} isReadOnly={!isEdit} bg="Neutral.100" borderRadius="30px" border="1px" borderColor="Primary.800" />
                    </InputGroup>
                </Flex>

                {isEdit && (
                    <Flex justify="center" mt="40px">
                        <Button w="80%" h="42px" bg="Primary.800" color="white" borderRadius="30px" fontSize="xl" _hover={{ opacity: 0.9 }} onClick={handleSave} isDisabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </Flex>
                )}

                <Flex justify="center" mt="20px">
                    <Button variant="ghost" color="red.400" onClick={handleLogout}>
                        Logout
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
}