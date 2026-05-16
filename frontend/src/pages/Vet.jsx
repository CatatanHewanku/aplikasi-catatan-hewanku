import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Icon, Divider } from "@chakra-ui/react";
import { useState, useEffect, useContext, Fragment } from "react";
import { MdFilterAlt, MdSearch, MdStar, MdStarBorder, MdLocationOn } from "react-icons/md";
import { CacheContext } from '../context/CacheContext.jsx';
import DogHouse from "../images/DogHouse.jpeg";

export default function Vet() {
    const [search, setSearch] = useState("");
    const [clinics, setClinics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Calculate distance between two coordinates (km)
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
                const response = await fetch('http://localhost:4000/api/vet-clinics');
                const result = await response.json();

                if (response.ok) {
                    let clinicsData = (result.data || []).map((clinic, index) => ({
                        ...clinic,
                        isFavorite: false,
                        originalIndex: index
                    }));

                    // Fetch user's favorite clinics
                    if (owner_id) {
                        try {
                            const favResponse = await fetch(`http://localhost:4000/api/favorites/owner/${owner_id}`);
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

                    // Request location and sort by distance
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
                                // 3. Update cache using the new key
                                updateCache(cacheKey, clinicsData);
                            },
                            () => {
                                clinicsData.sort((a, b) => b.isFavorite - a.isFavorite);
                                setClinics(clinicsData);
                                // 4. Update cache using the new key
                                updateCache(cacheKey, clinicsData);
                            }
                        );
                    } else {
                        clinicsData.sort((a, b) => b.isFavorite - a.isFavorite);
                        setClinics(clinicsData);
                        // 5. Update cache using the new key
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
                // Remove from favorites
                await fetch('http://localhost:4000/api/favorites', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ owner_id, clinic_id })
                });
            } else {
                // Add to favorites
                const response = await fetch('http://localhost:4000/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ owner_id, clinic_id })
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(error.message);
                    return;
                }
            }

            // Update local state
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

            // Update cache when favorite changes
            updateCache(`vetClinics_${owner_id}`, updated);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
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
                    <InputGroup>
                        <Input placeholder="Search vet..." value={search} onChange={(e) => setSearch(e.target.value)} border="1px" borderColor="Primary.900" borderRadius="20px" />
                        <InputRightElement pointerEvents="none">
                            <Box color="Primary.900">
                                <MdSearch />
                            </Box>
                        </InputRightElement>
                    </InputGroup>
                </Flex>
                <Flex direction="column" gap={5}>
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

                                    {/* Renders at the very top if you have favorites */}
                                    {showFavoriteHeader && (
                                        <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mt={2} mb={1}>
                                            Favorite Clinics
                                        </Text>
                                    )}

                                    {/* Renders in the middle, splitting the two lists */}
                                    {showDividerAndOtherHeader && (
                                        <>
                                            <Divider borderColor="Primary.900" opacity={0.3} my={4} />
                                            <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mb={1}>
                                                Other Clinics
                                            </Text>
                                        </>
                                    )}

                                    {/* Renders at the very top if you have zero favorites */}
                                    {showAllClinicsHeader && (
                                        <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="Primary.900" mt={2} mb={1}>
                                            All Clinics
                                        </Text>
                                    )}

                                    {/* Your existing clinic card */}
                                    <Flex align="center" gap={5} justify="space-between" my={2}>
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
                                            <Flex direction="column" gap={1}>
                                                <Text fontFamily="heading" fontSize="lg" fontWeight="medium" color="Primary.900">
                                                    {clinic.clinic_name}
                                                </Text>
                                                {clinic.distance_km && (
                                                    <Flex align="center" gap={1}>
                                                        <MdLocationOn size={14} color="Primary.900" />
                                                        <Text fontSize="sm" color="Primary.900">
                                                            {clinic.distance_km} km away
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </Flex>
                                        </Flex>
                                        <Icon
                                            as={clinic.isFavorite ? MdStar : MdStarBorder}
                                            boxSize={7}
                                            color={clinic.isFavorite ? "yellow.400" : "Primary.900"}
                                            cursor="pointer"
                                            onClick={() => toggleFavorite(clinic.clinic_id)}
                                        />
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


