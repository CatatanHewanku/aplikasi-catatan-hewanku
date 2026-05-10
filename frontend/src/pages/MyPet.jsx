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

    useEffect(() => {
        const data = localStorage.getItem("pets");
        if(data){
            setPets(JSON.parse(data));
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

    const savePet = () => {
        if(!name) return;
        const newPet = {
            id: Date.now().toString(),
            name,
            dob,
            type,
            gender,
            image: image || DefaultPet
        };

        const updated = [...pets, newPet];
        setPets(updated);
        localStorage.setItem("pets", JSON.stringify(updated));
        setName("");
        setDob("");
        setType("");
        setGender("");
        setImage("");
        setIsOpen(false);
    };

    const deletePet = (id) => {
        const updated = pets.filter((pet) => pet.id !== id);

        setPets(updated);

        localStorage.setItem("pets", JSON.stringify(updated));
    };

    const filteredPets = pets.filter((pet) =>
        pet.name.toLowerCase().includes(search.toLowerCase())
    );

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
                    <Flex key={pet.id} align="center" justify="space-between">
                        <Flex align="center" gap={5} cursor="pointer" onClick={() => navigate(`/mypet/${pet.id}`)}>
                            <Image src={pet.image || DefaultPet} boxSize="71px" borderRadius="full" objectFit="cover"/>
                            <Box>
                                <Text fontFamily="heading"fontSize="xl"fontWeight="medium" color="Primary.900" >
                                    {pet.name}
                                </Text>

                                <Text fontFamily="body" fontSize="lg" color="Primary.800" >
                                    {pet.type || "-"}
                                </Text>
                            </Box>

                        </Flex>

                        {isEdit && (
                            <Button size="sm" colorScheme="red" onClick={() => deletePet(pet.id)} >
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
                        <Button bg="Primary.800" color="white" onClick={savePet} boxShadow="md">
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}