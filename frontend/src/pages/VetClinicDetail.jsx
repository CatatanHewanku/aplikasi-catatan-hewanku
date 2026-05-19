import { Flex, Box, Text, Button, Image, Icon, Divider, Stack } from "@chakra-ui/react";
import { MdArrowBack, MdLocationOn, MdPhone, MdMap } from "react-icons/md";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import DogHouse from "../images/defaultPet.jpeg";
const URL_Name = import.meta.env.VITE_API_URL

export default function VetClinicDetail() {
  const navigate = useNavigate();
  const { clinic_id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const distance = location.state?.distance_km || "N/A";

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

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        const response = await fetch(`${URL_Name}/api/vet-clinics/${clinic_id}`);
        const result = await response.json();

        if (response.ok) {
          setClinic(result.data);
        } else {
          showToast("Failed to load clinic details", "error");
        }
      } catch (error) {
        console.error("Error fetching clinic details:", error);
        showToast("Error loading clinic details", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (clinic_id) {
      fetchClinicDetails();
    }
  }, [clinic_id]);

  const handleOpenMap = () => {
    if (clinic?.google_map_url) {
      window.open(clinic.google_map_url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Flex direction="column" minH="100vh" p="20px" align="center" justify="center">
        <Text color="Primary.800">Loading clinic details...</Text>
      </Flex>
    );
  }

  if (!clinic) {
    return (
      <Flex direction="column" minH="100vh" p="20px">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)} mb="20px">
          <MdArrowBack size="28px" />
        </Box>
        <Text color="Primary.900">Clinic not found</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" minH="100vh" p="20px" pb="120px">

      {/* HEADER: Standardized centering */}
      <Flex justify="space-between" align="center" pt="20px" pb="20px">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)} _hover={{ transform: "scale(1.1)" }} transition="all 0.2s">
          <MdArrowBack size="28px" />
        </Box>
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
          Clinic Details
        </Text>
        <Box w="28px" />
      </Flex>

      {/* CLINIC IMAGE */}
      <Image
        src={clinic.clinic_photo_cloudinary_url || DogHouse}
        w="100%"
        h="220px"
        objectFit="cover"
        borderRadius="16px"
        mb="20px"
        boxShadow="md"
        fallbackSrc={DogHouse}
      />

      <Stack spacing={6}>
        {/* CLINIC NAME */}
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
          {clinic.clinic_name}
        </Text>

        <Box bg="Primary.200" p="20px" borderRadius="16px" boxShadow="sm">
          <Stack spacing={5}>
            {/* ADDRESS */}
            <Flex align="flex-start" gap={4}>
              <Box color="Primary.800" mt="2px">
                <MdLocationOn size={24} />
              </Box>
              <Flex direction="column">
                <Text fontFamily="heading" fontWeight="bold" color="Primary.900" mb="2px">
                  Address
                </Text>
                <Text color="Primary.800" fontSize="md">
                  {clinic.clinic_address}
                </Text>
              </Flex>
            </Flex>

            <Divider borderColor="Primary.300" />

            {/* DISTANCE */}
            <Flex align="center" gap={4}>
              <Box color="Primary.800">
                <Icon as={MdMap} size={24} />
              </Box>
              <Flex direction="column">
                <Text fontFamily="heading" fontWeight="bold" color="Primary.900" mb="2px">
                  Distance
                </Text>
                <Text color="Primary.800" fontSize="md">
                  {distance} km away
                </Text>
              </Flex>
            </Flex>

            <Divider borderColor="Primary.300" />

            {/* PHONE */}
            <Flex align="center" gap={4}>
              <Box color="Primary.800">
                <MdPhone size={24} />
              </Box>
              <Flex direction="column">
                <Text fontFamily="heading" fontWeight="bold" color="Primary.900" mb="2px">
                  Phone
                </Text>
                <Text color="Primary.800" fontSize="md">
                  {clinic.clinic_phone || "Not available"}
                </Text>
              </Flex>
            </Flex>
          </Stack>
        </Box>
      </Stack>

      {/* MAP BUTTON */}
      <Button
        mt="40px"
        w="100%"
        h="50px"
        bg="Primary.800"
        color="white"
        borderRadius="30px"
        fontWeight="bold"
        fontSize="lg"
        boxShadow="md"
        _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
        transition="all 0.2s"
        onClick={handleOpenMap}
        leftIcon={<MdMap />}
      >
        View on Google Maps
      </Button>
    </Flex>
  );
}