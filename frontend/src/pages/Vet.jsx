import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Icon } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MdFilterAlt, MdSearch, MdStar, MdStarBorder } from "react-icons/md";
import DogHouse from "../images/DogHouse.jpeg";

export default function Vet() {
    const [search, setSearch] = useState("");
    const [clinics, setClinics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/vet-clinics');
                const result = await response.json();

                if (response.ok) {
                    const clinicsWithFavorite = (result.data || []).map((clinic, index) => ({
                        ...clinic,
                        isFavorite: false,
                        originalIndex: index
                    }));
                    setClinics(clinicsWithFavorite);
                    console.log("Clinics fetched:", clinicsWithFavorite.map(c => ({ name: c.clinic_name, photo: c.clinic_photo_cloudinary_url })));
                }
            } catch (error) {
                console.error("Error fetching clinics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClinics();
    }, []);

    const toggleFavorite = (clinic_id) => {
        const updated = clinics.map(clinic =>
            clinic.clinic_id === clinic_id
                ? { ...clinic, isFavorite: !clinic.isFavorite }
                : clinic
        );
        updated.sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) {
                return b.isFavorite - a.isFavorite;
            }
            return a.originalIndex - b.originalIndex;
        });
        setClinics(updated);
    };

    const filteredClinics = clinics.filter((clinic) =>
        clinic.clinic_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Flex direction="column" minH="100vh" p="20px">
            <Text pt="20px" pb="20px" fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900">
                Vet
            </Text>
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
                    {isLoading ? (
                        <Flex align="center" justify="center">
                            <Text>Loading...</Text>
                        </Flex>
                    ) : (
                        filteredClinics.map((clinic) => (
                            <Flex key={clinic.clinic_id} align="center" gap={5} justify="space-between">
                                <Flex align="center" gap={5}>
                                    <Image
                        src={clinic.clinic_photo_cloudinary_url || DogHouse}
                        boxSize="71px"
                        borderRadius="full"
                        objectFit="cover"
                        fallbackSrc={DogHouse}
                        loading="lazy"
                        onError={(e) => {
                            console.error(`Failed to load image for ${clinic.clinic_name}:`, clinic.clinic_photo_cloudinary_url);
                            e.target.src = DogHouse;
                        }}
                    />
                                    <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="Primary.900">
                        {clinic.clinic_name}
                    </Text>
                                </Flex>
                                <Icon 
                    as={clinic.isFavorite ? MdStar : MdStarBorder}
                    boxSize={7}
                    color={clinic.isFavorite ? "yellow.400" : "Primary.900"}
                    cursor="pointer"
                    onClick={() => toggleFavorite(clinic.clinic_id)}
                />
                            </Flex>
                        ))
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}


