import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Icon, Divider, useToast } from "@chakra-ui/react";
import { useState, useEffect, useContext, Fragment } from "react";
import { MdFilterAlt, MdSearch, MdStar, MdStarBorder, MdLocationOn } from "react-icons/md";
import { CacheContext } from '../context/CacheContext.jsx';
import { useNavigate } from "react-router-dom";
import DogHouse from "../images/DogHouse.jpeg";
const URL_Name = import.meta.env.VITE_API_URL

export default function Vet() {
    const toast = useToast();
    const [search, setSearch] = useState("");
    const [clinics, setClinics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const showToast = (message, status = "error") => {
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

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371
        const dLat = (lat2 - lat1) * (Math.PI / 180)
        const dLon = (lon2 - lon1) * (Math.PI / 180)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return (R * c).toFixed(2)
    }

    const { getCachedData, updateCache } = useContext(CacheContext);

    const [owner_id, setOwner_id] = useState(() => {
        const ownerData = JSON.parse(localStorage.getItem("owner"));
        return ownerData?.owner_id || null;
    });

    useEffect(() => {
        const cacheKey = `vetClinics_${owner_id}`;

        const cachedClinics = getCachedData(cacheKey);
        if (cachedClinics) {
            setClinics(cachedClinics);
            setIsLoading(false);
            return;
        }

        const fetchClinics = async () => {
            try {
                const response = await fetch(`${URL_Name}/api/vet-clinics`);
                const result = await response.json();

                if (response.ok) {
                    let clinicsData = (result.data || []).map((clinic, index) => ({
                        ...clinic,
                        isFavorite: false,
                        originalIndex: index
                    }));

                    if (owner_id) {
                        try {
                            const favResponse = await fetch(`${URL_Name}/api/favorites/owner/${owner_id}`);
                            if (favResponse.ok) {
                                const favResult = await favResponse.json();
                                const favoriteIds = (favResult.data || []).map(fav => fav.clinic_id);

                                clinicsData = clinicsData.map(clinic => ({
                                    ...clinic,
                                    isFavorite: favoriteIds.includes(clinic.clinic_id)
                                }));
                            }
                        } catch (favError) {
                            console.error("Error fetching favorites:", favError);
                        }
                    }

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                clinicsData = clinicsData.map((clinic) => ({
                                    ...clinic,
                                    distance_km: calculateDistance(latitude, longitude, clinic.clinic_latitude, clinic.clinic_longitude)
                                }));
                                clinicsData.sort((a, b) => {
                                    if (a.isFavorite !== b.isFavorite) {
                                        return b.isFavorite - a.isFavorite;
                                    }
                                    return parseFloat(a.distance_km) - parseFloat(b.distance_km);
                                });
                                setClinics(clinicsData);
                                updateCache(cacheKey, clinicsData);
                            },
                            () => {
                                clinicsData.sort((a, b) => b.isFavorite - a.isFavorite);
                                setClinics(clinicsData);
                                updateCache(cacheKey, clinicsData);
                            }
                        );
                    } else {
                        clinicsData.sort((a, b) => b.isFavorite - a.isFavorite);
                        setClinics(clinicsData);
                        updateCache(cacheKey, clinicsData);
                    }
                }
            } catch (error) {
                console.error("Error fetching clinics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClinics();
    }, [owner_id]);

    const toggleFavorite = async (clinic_id) => {
        if (!owner_id) {
            console.error("Owner ID not found");
            return;
        }

        const clinic = clinics.find(c => c.clinic_id === clinic_id);
        const isFavorite = clinic.isFavorite;

        try {
            if (isFavorite) {
                await fetch(`${URL_Name}/api/favorites`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ owner_id, clinic_id })
                });
            } else {
                const response = await fetch(`${URL_Name}/api/favorites`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ owner_id, clinic_id })
                });

                if (!response.ok) {
                    const error = await response.json();
                    showToast(error.message || "Failed to add favorite", "error");
                    return;
                }
            }

            const updated = clinics.map(c =>
                c.clinic_id === clinic_id
                    ? { ...c, isFavorite: !c.isFavorite }
                    : c
            );
            updated.sort((a, b) => {
                if (a.isFavorite !== b.isFavorite) {
                    return b.isFavorite - a.isFavorite;
                }
                return parseFloat(a.distance_km || 0) - parseFloat(b.distance_km || 0);
            });
            setClinics(updated);
            updateCache(`vetClinics_${owner_id}`, updated);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const filteredClinics = clinics.filter((clinic) =>
        clinic.clinic_name.toLowerCase().includes(search.toLowerCase())
    );

    const navigate = useNavigate();

    return (
        <Flex direction="column" minH="100vh" p="20px">
            {/* FIXED: Increased Header size to 2xl and made it bold */}
            <Text pt="20px" pb="20px" fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
                Vet
            </Text>

            <Flex direction="column" gap={5}>
                <InputGroup w="100%" mb="10px">
                    <Input placeholder="Search vet..." value={search} onChange={(e) => setSearch(e.target.value)} border="1px" borderColor="Primary.900" borderRadius="20px" />
                    <InputRightElement pointerEvents="none">
                        <Box color="Primary.900">
                            <MdSearch />
                        </Box>
                    </InputRightElement>
                </InputGroup>

                <Flex direction="column" gap={4}>
                    {isLoading ? (
                        <Flex align="center" justify="center">
                            <Text>Loading...</Text>
                        </Flex>
                    ) : (
                        filteredClinics.map((clinic, index) => {
                            const showFavoriteHeader = index === 0 && clinic.isFavorite;
                            const showDividerAndOtherHeader = !clinic.isFavorite && index > 0 && filteredClinics[index - 1].isFavorite;
                            const showAllClinicsHeader = index === 0 && !clinic.isFavorite;

                            return (
                                <Fragment key={clinic.clinic_id}>
                                    {showFavoriteHeader && (
                                        <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mt={2} mb={1}>
                                            Favorite Clinics
                                        </Text>
                                    )}

                                    {showDividerAndOtherHeader && (
                                        <>
                                            <Divider borderColor="Primary.900" opacity={0.3} my={3} />
                                            <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mb={1}>
                                                Other Clinics
                                            </Text>
                                        </>
                                    )}

                                    {showAllClinicsHeader && (
                                        <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mt={2} mb={1}>
                                            All Clinics
                                        </Text>
                                    )}

                                    <Flex
                                        align="center"
                                        justify="space-between"
                                        my={2}
                                        w="100%"
                                        cursor="pointer"
                                        onClick={() => navigate(`/vet-clinic/${clinic.clinic_id}`, { state: { distance_km: clinic.distance_km } })}
                                        _hover={{ opacity: 0.8 }}
                                        transition="opacity 0.2s"
                                    >
                                        <Flex align="center" gap={4} flex="1" overflow="hidden">
                                            <Image
                                                src={clinic.clinic_photo_cloudinary_url || DogHouse}
                                                boxSize="70px"
                                                minW="70px"
                                                borderRadius="full"
                                                objectFit="cover"
                                                fallbackSrc={DogHouse}
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error(`Failed to load image for ${clinic.clinic_name}`);
                                                    e.target.src = DogHouse;
                                                }}
                                            />
                                            <Flex direction="column" gap={0} flex="1" overflow="hidden">
                                                {/* FIXED: Reduced to lg, kept bold to establish clear hierarchy */}
                                                <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="Primary.900" isTruncated>
                                                    {clinic.clinic_name}
                                                </Text>
                                                {clinic.distance_km && (
                                                    <Flex align="center" gap={1} mt={1}>
                                                        <MdLocationOn size={16} color="var(--chakra-colors-Primary-900)" />
                                                        {/* FIXED: Reduced to sm */}
                                                        <Text fontSize="sm" color="Primary.900" isTruncated>
                                                            {clinic.distance_km} km away
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </Flex>
                                        </Flex>

                                        <Box pl={4} onClick={(e) => e.stopPropagation()}>
                                            <Icon
                                                as={clinic.isFavorite ? MdStar : MdStarBorder}
                                                boxSize={8}
                                                color={clinic.isFavorite ? "yellow.400" : "Primary.900"}
                                                cursor="pointer"
                                                onClick={() => toggleFavorite(clinic.clinic_id)}
                                                transition="transform 0.1s"
                                                _active={{ transform: "scale(0.8)" }}
                                            />
                                        </Box>
                                    </Flex>
                                </Fragment>
                            );
                        })
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}