import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Button } from "@chakra-ui/react";
import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import Cat1 from "../images/Cat1.jpeg"
import Cat2 from "../images/Cat2.jpeg"
import Dog1 from "../images/Dog1.jpeg"
import Dog2 from "../images/Dog2.jpeg"

export default function MyPet(){
    const [search, setSearch] = useState("")
    const petsInfo = [
        {name: "KulKul", type: "Cat", image: Cat1},
        {name: "DalDal", type: "Dog" , image: Dog1},
        {name: "Mellow", type: "Cat", image: Cat2},
        {name: "Ninjago", type: "Dog" , image: Dog2},
    ];

    const filteredPets = petsInfo.filter((pet) =>
        pet.name.toLowerCase().includes(search.toLowerCase())
      );
    return(
        <Flex direction="column" minH="100vh" p="20px">
            <Text pt="20px" pb="20px" fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900">My Pet</Text>
            <Flex direction="column" gap={5}>
                <InputGroup w="330px">
                    <Input placeholder="Search pet..." value={search} onChange={(e) => setSearch(e.target.value)} border="1px" borderColor="Primary.800" borderRadius="20px"/>
                    <InputRightElement pointerEvents="none">
                        <Box color="Primary.800">
                            <MdSearch />
                        </Box>
                    </InputRightElement>
                </InputGroup>
                <Flex direction="column" gap={5}>
                    {filteredPets.map((pet, index)=> (
                        <Flex key={index} align="center" gap={5}>
                            <Image src={pet.image} boxSize="71px" borderRadius="full" objectFit="cover"></Image>
                            <Box>
                                <Text fontFamily="heading" fontSize="xl" fontWeight="medium" color="Primary.900">
                                    {pet.name}
                                </Text>
                                <Text fontFamily="body" fontSize="lg" fontWeight="regular" color="Primary.800">
                                    {pet.type}
                                </Text>
                            </Box>
                        </Flex>
                    ))}
                </Flex>
                    {search === "" && (
                        <Flex justify="center" mt="auto" pt="40px">
                            <Button bg="Neutral.100" border="1px" borderColor="Primary.800" borderRadius="25px" gap={2} _hover="none">
                            <Box color="Primary.800" >
                                <MdAdd size="20px"/>
                            </Box>
                            <Text color="Primary.800">Add More Pet</Text>
                            </Button>
                        </Flex>
                    )}
            </Flex>
        </Flex>
    )
}