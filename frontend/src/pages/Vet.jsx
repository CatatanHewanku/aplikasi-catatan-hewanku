import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Icon, Divider, useToast, Button } from "@chakra-ui/react";
import { useState, useEffect, useContext, Fragment } from "react";
import { MdFilterAlt, MdSearch, MdStar, MdStarBorder, MdLocationOn } from "react-icons/md";
import { CacheContext } from '../utils/CacheContext.jsx';
import { useNavigate } from "react-router-dom";
import { removeEmojis } from "../utils/textUtils.js";
import DogHouse from "../images/DogHouse.jpeg";

export default function Vet() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
        const response = await fetch(`/api/vet-clinics`);
        const result = await response.json();

        if (response.ok) {
          let clinicsData = (result.data || []).map((clinic, index) => ({
            ...clinic,
            isFavorite: false,
            originalIndex: index
          }));

          if (owner_id) {
            try {
              const favResponse = await fetch(`/api/favorites/owner/${owner_id}`);
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
        await fetch(`/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner_id, clinic_id })
        });
      } else {
        const response = await fetch(`/api/favorites`, {
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

  const filteredClinics = clinics.filter((clinic) => {
    const searchKeyword = search.toLowerCase();
    const matchName = clinic.clinic_name?.toLowerCase().includes(searchKeyword);
    const matchAddress = clinic.clinic_address?.toLowerCase().includes(searchKeyword);

    return matchName || matchAddress;
  });

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const indexOfLastClinic = currentPage * itemsPerPage;
  const indexOfFirstClinic = indexOfLastClinic - itemsPerPage;
  const currentClinics = filteredClinics.slice(indexOfFirstClinic, indexOfLastClinic);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const navigate = useNavigate();

  return (
    <Flex direction="column" minH="100vh" p="20px">
      <Text pt="20px" pb="20px" fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
        Vet
      </Text>

      <Flex direction="column" gap={5}>
        <InputGroup w="100%" mb="10px">
          <Input placeholder="Search vet..." value={search} onChange={(e) => setSearch(removeEmojis(e.target.value))} border="1px" borderColor="Primary.900" borderRadius="20px" />
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
          ) : currentClinics.length > 0 ? (
            currentClinics.map((clinic, index) => {
              const absoluteIndex = indexOfFirstClinic + index;

              const showFavoriteHeader = absoluteIndex === 0 && clinic.isFavorite;
              const showDividerAndOtherHeader = !clinic.isFavorite && absoluteIndex > 0 && filteredClinics[absoluteIndex - 1].isFavorite;
              const showAllClinicsHeader = absoluteIndex === 0 && !clinic.isFavorite;

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
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="Primary.900" isTruncated>
                          {clinic.clinic_name}
                        </Text>
                        {clinic.distance_km && (
                          <Flex align="center" gap={1} mt={1}>
                            <MdLocationOn size={16} color="var(--chakra-colors-Primary-900)" />
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
          ) : (
            <Flex align="center" justify="center" mt={4}>
              <Text color="Primary.900" fontWeight="bold">Tidak ada klinik yang ditemukan.</Text>
            </Flex>
          )}
        </Flex>

        {/* === Antarmuka Pagination Diperbarui === */}
        {totalPages > 1 && (
          <Flex justify="space-between" align="center" mt={6} pb={4}>

            {/* Kelompok Tombol Kiri */}
            <Flex gap={2}>
              <Button
                onClick={() => setCurrentPage(1)}
                isDisabled={currentPage === 1}
                bg="Primary.800"
                color="white"
                borderRadius="20px"
                _hover={{ bg: "Primary.900" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: "gray.400" }}
                size="sm"
              >
                &lt;&lt;
              </Button>
              <Button
                onClick={handlePrevPage}
                isDisabled={currentPage === 1}
                bg="Primary.800"
                color="white"
                borderRadius="20px"
                _hover={{ bg: "Primary.900" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: "gray.400" }}
                size="sm"
              >
                Prev
              </Button>
            </Flex>

            {/* Teks Informasi Halaman */}
            <Text fontFamily="heading" fontWeight="bold" color="Primary.900" fontSize="sm" textAlign="center">
              Page {currentPage} of {totalPages}
            </Text>

            {/* Kelompok Tombol Kanan */}
            <Flex gap={2}>
              <Button
                onClick={handleNextPage}
                isDisabled={currentPage === totalPages}
                bg="Primary.800"
                color="white"
                borderRadius="20px"
                _hover={{ bg: "Primary.900" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: "gray.400" }}
                size="sm"
              >
                Next
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                isDisabled={currentPage === totalPages}
                bg="Primary.800"
                color="white"
                borderRadius="20px"
                _hover={{ bg: "Primary.900" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: "gray.400" }}
                size="sm"
              >
                &gt;&gt;
              </Button>
            </Flex>

          </Flex>
        )}
      </Flex>
    </Flex>
  );
}