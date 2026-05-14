import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Select } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdSearch } from "react-icons/md";
import DefaultPet from "../images/defaultPet.jpeg";

export default function MyPet(){
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [pets, setPets] = useState([]);

    const [isEdit, setIsEdit] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [type, setType] = useState("");
    const [gender, setGender] = useState("");
    const [image, setImage] = useState("");

    const [imagePreview, setImagePreview] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const ownerData = JSON.parse(localStorage.getItem("owner"));
                if (!ownerData?.owner_id) {
                    console.log("No owner found");
                    return;
                }

                const response = await fetch(`http://localhost:4000/api/pets/owner/${ownerData.owner_id}`);
                const result = await response.json();

                if (response.ok) {
                    setPets(result.data || []);
                    // Also save to localStorage as backup
                    localStorage.setItem("pets", JSON.stringify(result.data || []));
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
        if(!file) return;
        
        setImage(file); // Store the actual File object for FormData
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const savePet = async () => {
        if(!name) return;
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
            formData.append('pet_name', name);
            formData.append('pet_dob', dob);
            formData.append('pet_type', type);
            formData.append('pet_gender', gender);
            
            // Add image file if selected
            if (image) {
                formData.append('pet_image', image);
            }

            const response = await fetch('http://localhost:4000/api/pets', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                const newPet = {
                    pet_id: result.data.pet_id,
                    pet_name: name,
                    pet_dob: dob,
                    pet_type: type,
                    pet_gender: gender,
                    pet_image: result.data.pet_image || DefaultPet
                };

                const updated = [...pets, newPet];
                setPets(updated);
                localStorage.setItem("pets", JSON.stringify(updated));
                
                alert("Pet added successfully");
                setName("");
                setDob("");
                setType("");
                setGender("");
                setImage("");
                setImagePreview("");
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

    const deletePet = async (petId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/pets/${petId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                const updated = pets.filter((pet) => pet.pet_id !== petId);
                setPets(updated);
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

    const filteredPets = pets.filter((pet) => {
        const petName = pet?.pet_name;
        return petName.toLowerCase().includes(search.toLowerCase());
    });

    return(
        <Flex direction="column" minH="100vh" p="20px" >
            <Text pt="20px" pb="20px" fontSize="xl" fontFamily="heading"  fontWeight="medium" color="Primary.900">
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
                {filteredPets.map((pet)=> (
                    <Flex key={pet.pet_id} align="center" justify="space-between">
                        <Flex align="center" gap={5} cursor="pointer" onClick={() => navigate(`/mypet/${pet.pet_id}`)}>
                            <Image src={pet.pet_image || DefaultPet} boxSize="71px" borderRadius="full" objectFit="cover"/>
                            <Box>
                                <Text fontFamily="heading"fontSize="xl"fontWeight="medium" color="Primary.900" >
                                    {pet.pet_name}
                                </Text>

                                <Text fontFamily="body" fontSize="lg" color="Primary.800" >
                                    {pet.pet_type}
                                </Text>
                            </Box>

                        </Flex>

                        {isEdit && (
                            <Button size="sm" colorScheme="red" onClick={() => deletePet(pet.pet_id)} >
                                Delete
                            </Button>
                        )}
                    </Flex>
                ))}
            </Flex>

            <Flex direction="column" gap={4} pt="30px"pb="120px" >
                {filteredPets.length > 0 && (
                    <Flex justify="center">
                        <Button size="lg" h="40px" w="50%" bg="Primary.800" borderRadius="25px" color="white" onClick={() => setIsEdit(!isEdit)}>
                            {isEdit ? "Done" : "Edit"}
                        </Button>
                    </Flex>
                )}
                {search === "" && (
                    <Flex justify="center">
                        <Button bg="Neutral.100" h="40px" w="50%" border="1px" borderColor="Primary.800" borderRadius="25px" gap={2} _hover="none" onClick={() => setIsOpen(true)}>
                            <Box color="Primary.800">
                                <MdAdd size="20px"/>
                            </Box>
                            <Text color="Primary.800">
                                Add More Pet
                            </Text>
                        </Button>
                    </Flex>
                )}
            </Flex>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="10px" p="10px"
                >
                    <ModalHeader textAlign="center">
                        Pet Profile
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" gap={3}>
                            {imagePreview && <Image src={imagePreview} boxSize="100px" borderRadius="8px" />}
                            <Input type="file" accept="image/*" onChange={handleImageUpload}/>
                            <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)}/>
                            <Input type="date"value={dob}onChange={(e)=>setDob(e.target.value)}/>
                            <Select placeholder="Pet Type" value={type} onChange={(e)=>setType(e.target.value)} >
                                <option value="Cat">Cat(Junior)</option>
                                <option value="Cat">Cat(Adult)</option>
                                <option value="Cat">Cat(Senior)</option>
                                <option value="Dog">Dog(Junior)</option>
                                <option value="Dog">Dog(Adult)</option>
                                <option value="Dog">Dog(Senior)</option>
                            </Select>
                            <Select placeholder="Gender" value={gender} onChange={(e)=>setGender(e.target.value)}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </Select>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={() => setIsOpen(false)} bg="Neutral.100" boxShadow="md" border="1px" borderColor="Primary.800">
                            Cancel
                        </Button>
                        <Button bg="Primary.800" color="white" onClick={savePet} boxShadow="md" isDisabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}