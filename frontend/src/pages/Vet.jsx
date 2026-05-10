import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Icon} from "@chakra-ui/react";
import { useState } from "react";
import { MdFilterAlt, MdSearch, MdStar, MdStarBorder } from "react-icons/md";
import Clinic1 from "../images/Clinic1.jpeg"
import Clinic2 from "../images/Clinic2.jpeg"
import Clinic3 from "../images/Clinic3.jpeg"
import DogHouse from "../images/DogHouse.jpeg"

export default function Vet(){
    const [search, setSearch] = useState("")
    const [vetInfo, setVetInfo] = useState ([
        {name: "Clinic Hewan Persada", image: Clinic1, isFavorite: false, originalIndex: 0},
        {name: "Doya Clinic", image: Clinic2, isFavorite: false, originalIndex: 1},
        {name: "Pradana Dog House", image: DogHouse, isFavorite: false, originalIndex: 2},
        {name: "Anabulku Clinic", image: Clinic3, isFavorite: false, originalIndex: 3},
    ]);
    const toggleFavorite = (index) => {
        const updated = [...vetInfo];
        updated[index].isFavorite = !updated[index].isFavorite;
        updated.sort((a, b) =>{
            if (a.isFavorite !== b.isFavorite){
                return b.isFavorite - a.isFavorite
            }
            return a.originalIndex - b.originalIndex
        });
        setVetInfo(updated)
    };
    const filteredVets = vetInfo.filter((vet) =>
        vet.name.toLowerCase().includes(search.toLowerCase())
      );
    return(
        <Flex direction="column" minH="100vh" p="20px">
            <Text pt="20px" pb="20px" fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900">Vet</Text>
            <Flex direction="column" gap={5}>
                <Flex direction="row" gap={3} align="center">
                <InputGroup w="290px">
                    <Input placeholder="Search vet..." value={search} onChange={(e) => setSearch(e.target.value)} border="1px" borderColor="Primary.900" borderRadius="20px" />
                    <InputRightElement pointerEvents="none">
                        <Box color="Primary.900">
                            <MdSearch />
                        </Box>
                    </InputRightElement>
                </InputGroup>
                    <Box color="Primary.900">
                        <MdFilterAlt size="24px" />
                    </Box>
            </Flex>
                <Flex direction="column" gap={5}>
                    {filteredVets.map((vet, index)=> (
                        <Flex key={index} align="center" gap={5} justify="space-between" >
                            <Flex align="center" gap={5}>
                                <Image src={vet.image} boxSize="71px" borderRadius="full" objectFit="cover"></Image>
                                    <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="Primary.900">
                                        {vet.name}
                                    </Text>

                            </Flex>

                            
                            <Icon as={vet.isFavorite ? MdStar : MdStarBorder} boxSize={7} color={vet.isFavorite ? "yellow.400" : "Primary.900"} onClick={() => toggleFavorite(index)}/>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Flex>
    )
}


