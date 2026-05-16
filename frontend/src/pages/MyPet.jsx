import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Select } from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdSearch } from "react-icons/md";
import { CacheContext } from "../context/CacheContext.jsx";
import DefaultPet from "../images/defaultPet.jpeg";

export default function MyPet() {
    const navigate = useNavigate();
    const { getCachedData, updateCache } = useContext(CacheContext);

    const [search, setSearch] = useState("");
    const [pets, setPets] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [pet_name, setPet_name] = useState("");
    const [pet_dob, setPet_dob] = useState("");
    const [pet_type, setPet_type] = useState("");
    const [pet_gender, setPet_gender] = useState("");
    const [pet_image, setPet_image] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                // Check cache first
                const cachedPets = getCachedData('myPets');
                if (cachedPets && cachedPets.length > 0) {
                    setPets(cachedPets);
                    return;
                }

                const ownerData = JSON.parse(localStorage.getItem("owner"));
                if (!ownerData?.owner_id) {
                    console.log("No owner found");
                    return;
                }

                const response = await fetch(`http://localhost:4000/api/pets/owner/${ownerData.owner_id}`);
                const result = await response.json();

                if (response.ok) {
                    const petsData = result.data || [];
                    setPets(petsData);
                    updateCache('myPets', petsData);
                    localStorage.setItem("pets", JSON.stringify(petsData));
                } else {
                    console.error("Failed to fetch pets:", result.message);
                }
            } catch (error) {
                console.error("Error fetching pets:", error);
            }
        };

        fetchPets();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setPet_image(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const savePet = async () => {
        if (!pet_name) return;
        setIsLoading(true);
        
        try {
            const ownerData = JSON.parse(localStorage.getItem("owner"));
            if (!ownerData?.owner_id) {
                alert("User not found");
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('owner_id', ownerData.owner_id);
            formData.append('pet_name', pet_name);
            formData.append('pet_dob', pet_dob);
            formData.append('pet_type', pet_type);
            formData.append('pet_gender', pet_gender);
            
            if (pet_image && pet_image instanceof File) {
                formData.append('pet_image', pet_image);
            }

            const response = await fetch('http://localhost:4000/api/pets', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                const newPet = {
                    pet_id: result.data.pet_id,
                    pet_name: pet_name,
                    pet_dob: pet_dob,
                    pet_type: pet_type,
                    pet_gender: pet_gender,
                    pet_image: result.data.pet_image || DefaultPet
                };

                const updated = [...pets, newPet];
                setPets(updated);
                updateCache('myPets', updated);
                localStorage.setItem("pets", JSON.stringify(updated));
                
                alert("Pet added successfully");
                resetForm();
                setIsOpen(false);
            } else {
                alert(result.message || "Failed to add pet");
            }
        } catch (error) {
            console.error("Error saving pet:", error);
            alert("Error adding pet");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setPet_name("");
        setPet_dob("");
        setPet_type("");
        setPet_gender("");
        setPet_image("");
        setImagePreview("");
    };

    const deletePet = async (petId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/pets/${petId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                const updated = pets.filter((pet) => pet.pet_id !== petId);
                setPets(updated);
                updateCache('myPets', updated);
                localStorage.setItem("pets", JSON.stringify(updated));
                alert("Pet deleted successfully");
            } else {
                alert(result.message || "Failed to delete pet");
            }
        } catch (error) {
            console.error("Error deleting pet:", error);
            alert("Error deleting pet");
        }
    };

    const filteredPets = pets.filter((pet) => 
        pet?.pet_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Flex direction="column" minH="100vh" p="20px">
            <Text pt="20px" pb="20px" fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900">
                My Pet
            </Text>

            <InputGroup w="330px" mb="20px">
                <Input placeholder="Search pet..." value={search} onChange={(e) => setSearch(e.target.value)} border="1px" borderColor="Primary.800" borderRadius="20px" />
                <InputRightElement pointerEvents="none">
                    <Box color="Primary.800">
                        <MdSearch />
                    </Box>
                </InputRightElement>
            </InputGroup>

            <Flex direction="column" gap={5}>
                {filteredPets.map((pet) => (
                    <Flex key={pet.pet_id} align="center" justify="space-between">
                        <Flex align="center" gap={5} cursor="pointer" onClick={() => navigate(`/mypet/${pet.pet_id}`)}>
                            <Image src={pet.pet_image || DefaultPet} boxSize="71px" borderRadius="full" objectFit="cover" />
                            <Box>
                                <Text fontFamily="heading" fontSize="xl" fontWeight="medium" color="Primary.900">
                                    {pet.pet_name}
                                </Text>
                                <Text fontFamily="body" fontSize="lg" color="Primary.800">
                                    {pet.pet_type}
                                </Text>
                            </Box>
                        </Flex>
                        {isEdit && (
                            <Button size="sm" colorScheme="red" onClick={() => deletePet(pet.pet_id)}>
                                Delete
                            </Button>
                        )}
                    </Flex>
                ))}
            </Flex>

            <Flex direction="column" gap={4} pt="30px" pb="120px">
                {filteredPets.length > 0 && (
                    <Flex justify="center">
                        <Button size="lg" h="40px" w="50%" bg="Primary.800" borderRadius="25px" color="white" onClick={() => setIsEdit(!isEdit)}>
                            {isEdit ? "Done" : "Edit"}
                        </Button>
                    </Flex>
                )}
                {search === "" && (
                    <Flex justify="center">
                        <Button bg="Neutral.100" h="40px" w="50%" border="1px" borderColor="Primary.800" borderRadius="25px" gap={2} onClick={() => setIsOpen(true)}>
                            <Box color="Primary.800">
                                <MdAdd size="20px" />
                            </Box>
                            <Text color="Primary.800">
                                Add More Pet
                            </Text>
                        </Button>
                    </Flex>
                )}
            </Flex>

            <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="10px" p="10px">
                    <ModalHeader textAlign="center">
                        Pet Profile
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" gap={3}>
                            {imagePreview && <Image src={imagePreview} boxSize="100px" borderRadius="8px" />}
                            <Input type="file" accept="image/*" onChange={handleImageUpload} />
                            <Input placeholder="Name" value={pet_name} onChange={(e) => setPet_name(e.target.value)} />
                            <Input type="date" value={pet_dob} onChange={(e) => setPet_dob(e.target.value)} />
                            <Select placeholder="Pet Type" value={pet_type} onChange={(e) => setPet_type(e.target.value)}>
                                <option value="Cat">Cat</option>
                                <option value="Dog">Dog</option>
                            </Select>
                            <Select placeholder="Gender" value={pet_gender} onChange={(e) => setPet_gender(e.target.value)}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </Select>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={() => { setIsOpen(false); resetForm(); }} bg="Neutral.100" boxShadow="md" border="1px" borderColor="Primary.800">
                            Cancel
                        </Button>
                        <Button bg="Primary.800" color="white" onClick={savePet} boxShadow="md" isDisabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}