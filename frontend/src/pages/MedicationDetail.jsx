import { Flex, Box, Text, Image, Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Input, Grid, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { MdArrowBack, MdNotes, MdMedicalServices, MdPets, MdEdit, MdCameraAlt, MdKeyboardArrowDown } from "react-icons/md";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CacheContext } from "../context/CacheContext";
import DefaultPet from "../images/defaultPet.jpeg"; // <-- Imported DefaultPet!

const calculateAgeCategory = (dobString) => {
  if (!dobString) {
    return null;
  }

  const dob = new Date(dobString);

  if (isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();

  let months = (today.getFullYear() - dob.getFullYear()) * 12;
  months += today.getMonth() - dob.getMonth();

  const years = Math.floor(months / 12);

  if (months < 18) {
    return "Junior";
  } else if (years < 7) {
    return "Adult";
  } else {
    return "Senior";
  }
};

export default function MedicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { updateCache } = useContext(CacheContext);

  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState([]);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  const [pet_name, setPet_name] = useState("");
  const [pet_dob, setPet_dob] = useState("");
  const [pet_type, setPet_type] = useState("");
  const [pet_gender, setPet_gender] = useState("");

  const [pet_image, setPet_image] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petResponse = await fetch(`http://localhost:4000/api/pets/${id}`);
        const petResult = await petResponse.json();

        if (petResponse.ok) {
          setPet(petResult.data);
          setNotes(petResult.data.pet_note || "");
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      }
    };

    const fetchMedicalRecords = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/medical-records/pet/${id}`);
        const result = await response.json();

        if (response.ok) {
          const sortedLogs = (result.data || []).sort(
            (a, b) => new Date(b.record_visit_date) - new Date(a.record_visit_date)
          );
          setLogs(sortedLogs);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
      }
    };

    fetchPetData();
    fetchMedicalRecords();
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return <Flex justify="center" align="center" minH="100vh"><Text>Loading...</Text></Flex>;
  }

  if (!pet) {
    return <Flex justify="center" align="center" minH="100vh"><Text>Pet not found</Text></Flex>;
  }

  const handleOpenPetEdit = () => {
    setPet_name(pet.pet_name || "");
    setPet_dob(pet.pet_dob ? new Date(pet.pet_dob).toISOString().split('T')[0] : "");
    setPet_type(pet.pet_type || "");
    setPet_gender(pet.pet_gender || "");

    setPet_image(null);
    setImagePreview(pet.pet_image || "");

    setIsOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format! Please upload only JPG or PNG images.");
      e.target.value = null;
      return;
    }

    setPet_image(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSavePet = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('pet_name', pet_name);
      formData.append('pet_dob', pet_dob);
      formData.append('pet_type', pet_type);
      formData.append('pet_gender', pet_gender);

      if (pet_image) {
        formData.append('pet_image', pet_image);
      }

      const response = await fetch(`http://localhost:4000/api/pets/${id}`, {
        method: 'PATCH',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // ADDED DefaultPet fallback here to match MyPet.jsx logic perfectly!
        const finalImageUrl = result.data?.pet_image || imagePreview || DefaultPet;

        const updatedPet = {
          ...pet,
          pet_name: pet_name,
          pet_dob: pet_dob,
          pet_type: pet_type,
          pet_gender: pet_gender,
          pet_image: finalImageUrl
        };

        setPet(updatedPet);

        const allPets = JSON.parse(localStorage.getItem("pets")) || [];
        const updatedPets = allPets.map((p) => p.pet_id === parseInt(id) ? updatedPet : p);
        localStorage.setItem("pets", JSON.stringify(updatedPets));

        updateCache('myPets', updatedPets);

        alert("Pet profile updated successfully!");
        setIsOpen(false);
      } else {
        alert(result.message || "Failed to update pet");
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("Error saving pet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/pets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pet_name: pet.pet_name,
          pet_dob: pet.pet_dob,
          pet_type: pet.pet_type,
          pet_gender: pet.pet_gender,
          pet_note: tempNotes
        })
      });

      const result = await response.json();

      if (response.ok) {
        setNotes(tempNotes);
        setIsNotesOpen(false);
        alert("Notes saved successfully");
      } else {
        alert(result.message || "Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Error saving notes");
    }
  };

  return (
    <Flex direction="column" p="20px" gap={5} minH="100vh" pb="120px">

      <Flex justify="space-between" align="center" pt="20px" pb="10px">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)}>
          <MdArrowBack size="28px" />
        </Box>
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
          Pet Details
        </Text>
        <Box w="28px" />
      </Flex>

      <Flex direction="column" gap={4}>
        <Flex justify="center" pb="15px">
          {/* CHANGED: Uses pet_image, but falls back to DefaultPet seamlessly! */}
          <Image src={pet.pet_image || DefaultPet} boxSize="130px" borderRadius="full" objectFit="cover" />
        </Flex>

        <Box position="relative" bg="Primary.200" pt="28px" pb="16px" px="16px" borderRadius="16px" boxShadow="md">
          <Box position="absolute" top="-14px" left="50%" transform="translateX(-50%)" bg="Primary.800" px="18px" py="4px" borderRadius="12px" whiteSpace="nowrap">
            <Text color="Neutral.100" fontSize="lg" fontWeight="medium">
              Personal Information
            </Text>
          </Box>

          <Box color="Primary.900" position="absolute" top="-15px" left="20px" fontSize="28px">
            <MdPets size="32px" />
          </Box>

          <Box
            color="Primary.800"
            position="absolute"
            top="-14px"
            right="20px"
            fontSize="20px"
            bg="white"
            p="6px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="Primary.800"
            boxShadow="sm"
            cursor="pointer"
            onClick={handleOpenPetEdit}
            _hover={{ bg: "gray.100" }}
          >
            <MdEdit />
          </Box>

          <Box bg="Primary.100" mt="5px" p="16px" borderRadius="12px" boxShadow="sm">
            <Grid templateColumns="65px 15px 1fr" gap={3} alignItems="center">
              <Text color="Primary.800" fontWeight="medium" fontSize="md">Name</Text>
              <Text color="Primary.800" fontSize="md">:</Text>
              <Text color="Primary.900" fontWeight="bold" fontSize="lg" isTruncated>{pet.pet_name}</Text>
              <Text color="Primary.800" fontWeight="medium" fontSize="md">DOB</Text>
              <Text color="Primary.800" fontSize="md">:</Text>
              <Text color="Primary.900" fontWeight="bold" fontSize="lg">{pet.pet_dob ? new Date(pet.pet_dob).toISOString().split('T')[0] : "-"}</Text>
              <Text color="Primary.800" fontWeight="medium" fontSize="md">Type</Text>
              <Text color="Primary.800" fontSize="md">:</Text>
              <Text color="Primary.900" fontWeight="bold" fontSize="lg">{pet.pet_type} ({calculateAgeCategory(pet.pet_dob)})</Text>
              <Text color="Primary.800" fontWeight="medium" fontSize="md">Gender</Text>
              <Text color="Primary.800" fontSize="md">:</Text>
              <Text color="Primary.900" fontWeight="bold" fontSize="lg">{pet.pet_gender || "-"}</Text>
            </Grid>
          </Box>
        </Box>
      </Flex>

      <Box bg="Primary.200" p="16px" borderRadius="16px" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="12px">
          <Flex align="center" gap={2}>
            <Icon as={MdNotes} color="Primary.900" boxSize="22px" />
            <Text color="Primary.900" fontWeight="bold" fontSize="lg">
              Notes
            </Text>
          </Flex>
          <Button size="sm" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800" onClick={() => { setTempNotes(notes); setIsNotesOpen(true); }} _hover={{ bg: "gray.50" }}>
            Edit
          </Button>
        </Flex>
        <Box bg="Primary.100" borderRadius="12px" minH="140px" p="16px" overflowY="auto" boxShadow="inner">
          {notes ? (
            <Text color="Primary.900" whiteSpace="pre-wrap" fontSize="md" fontWeight="medium">
              {notes}
            </Text>
          ) : (
            <Text color="Primary.700" fontStyle="italic">
              No notes yet...
            </Text>
          )}
        </Box>
      </Box>

      <Box bg="Primary.200" p="16px" borderRadius="16px" boxShadow="sm">
        <Flex justify="space-between" align="center" mb="12px">
          <Flex align="center" gap={2}>
            <Icon as={MdMedicalServices} color="Primary.900" boxSize="22px" />
            <Text color="Primary.900" fontWeight="bold" fontSize="lg">
              Medication Log
            </Text>
          </Flex>
          <Button size="sm" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800" onClick={() => navigate(`/medication-form/${id}`)} _hover={{ bg: "gray.50" }}>
            Add More
          </Button>
        </Flex>

        <Box bg="Primary.100" borderRadius="12px" p="12px" h="250px" overflowY="auto" boxShadow="inner">
          {logs.length === 0 ? (
            <Flex h="100%" align="center" justify="center">
              <Text color="Primary.700" fontStyle="italic">
                No medication log yet...
              </Text>
            </Flex>
          ) : (
            <Flex direction="column">
              {logs.map((log, i) => (
                <Flex key={log.record_id} justify="space-between" align="center" py="14px" px="8px" borderBottom={i !== logs.length - 1 ? "1px solid" : "none"} borderColor="Primary.300" cursor="pointer" onClick={() => navigate(`/medication-form/${id}/${log.record_id}`)} _hover={{ bg: "blackAlpha.50", borderRadius: "8px" }} transition="background 0.2s">
                  <Text color="Primary.900" fontWeight="bold" fontSize="md">
                    {new Date(log.record_visit_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </Text>
                  <Box border="1px" borderColor="Primary.800" borderRadius="8px" px="12px" py="4px" bg="white" minW="120px" textAlign="center" boxShadow="sm">
                    <Text fontSize="xs" fontWeight="bold" color="Primary.800" textTransform="uppercase">
                      {log.record_consultation_type}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      </Box>

      {/* NOTES MODAL */}
      <Modal isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent bg="Primary.200" borderRadius="16px" mx="20px" boxShadow="xl">
          <ModalBody p="16px">
            <Flex justify="space-between" align="center" mb="16px">
              <Text color="Primary.800" cursor="pointer" fontWeight="bold" onClick={() => setIsNotesOpen(false)}>
                Cancel
              </Text>
              <Text color="Primary.800" fontSize="lg" fontWeight="bold">Edit Notes</Text>
              <Text color="Primary.800" cursor="pointer" fontWeight="bold" onClick={handleSaveNotes}>
                Save
              </Text>
            </Flex>
            <Box bg="white" borderRadius="12px" px="14px" py="10px" boxShadow="sm">
              <Textarea placeholder="Please type your input here..." border="none" resize="none" minH="150px" value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} _focus={{ border: "none", boxShadow: "none" }} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* EDIT PET MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="16px" p="10px" mx="20px">
          <ModalHeader textAlign="center" color="Primary.900" fontFamily="heading" fontSize="xl" fontWeight="bold">
            Edit Pet Profile
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>

              <Flex justify="center" mb={2}>
                <Box position="relative" cursor="pointer" transition="all 0.2s" _hover={{ transform: "scale(1.05)" }}>
                  <Flex boxSize="100px" borderRadius="full" bg="Primary.100" justify="center" align="center" overflow="hidden" boxShadow="sm" border="3px solid" borderColor="Primary.800">
                    {imagePreview ? (
                      <Image src={imagePreview} boxSize="100px" borderRadius="full" objectFit="cover" />
                    ) : (
                      <Box color="Primary.800" fontSize="40px">
                        <MdPets />
                      </Box>
                    )}
                  </Flex>
                  <Flex position="absolute" bottom="-2px" right="-2px" bg="Primary.800" boxSize="32px" borderRadius="full" justify="center" align="center" color="white" boxShadow="sm" border="2px solid white">
                    <MdCameraAlt size="16px" />
                  </Flex>
                  <Input type="file" accept="image/*" position="absolute" top="0" left="0" w="100%" h="100%" opacity="0" cursor="pointer" onChange={handleImageUpload} />
                </Box>
              </Flex>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Name</Text>
                <Input placeholder="Name" value={pet_name} onChange={(e) => setPet_name(e.target.value)} borderColor="Primary.800" focusBorderColor="Primary.900" />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Date of Birth</Text>
                <Input type="date" value={pet_dob} onChange={(e) => setPet_dob(e.target.value)} borderColor="Primary.800" focusBorderColor="Primary.900" />
              </Box>

              {/* CUSTOM DROPDOWN: Pet Type */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Type</Text>
                <Menu matchWidth>
                  <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
                    <Flex justify="space-between" align="center" h="100%">
                      <Text color={pet_type ? "black" : "gray.500"} fontSize="md">
                        {pet_type || "Pet Type"}
                      </Text>
                      <MdKeyboardArrowDown color="gray" size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList bg="white" borderColor="Primary.300" zIndex={1500} p={0} borderRadius="md" boxShadow="lg">
                    {["Cat", "Dog"].map((opt, index, arr) => {
                      const isSelected = pet_type === opt;
                      return (
                        <MenuItem
                          key={opt}
                          onClick={() => setPet_type(opt)}
                          bg={isSelected ? "Primary.100" : "white"}
                          _hover={{ bg: "Primary.50" }}
                          color="Primary.900"
                          fontWeight={isSelected ? "bold" : "medium"}
                          borderBottom={index !== arr.length - 1 ? "1px solid" : "none"}
                          borderColor="Primary.300"
                          py={3}
                        >
                          {opt}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              </Box>

              {/* CUSTOM DROPDOWN: Gender */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Gender</Text>
                <Menu matchWidth>
                  <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
                    <Flex justify="space-between" align="center" h="100%">
                      <Text color={pet_gender ? "black" : "gray.500"} fontSize="md">
                        {pet_gender || "Gender"}
                      </Text>
                      <MdKeyboardArrowDown color="gray" size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList bg="white" borderColor="Primary.300" zIndex={1500} p={0} borderRadius="md" boxShadow="lg">
                    {["Male", "Female"].map((opt, index, arr) => {
                      const isSelected = pet_gender === opt;
                      return (
                        <MenuItem
                          key={opt}
                          onClick={() => setPet_gender(opt)}
                          bg={isSelected ? "Primary.100" : "white"}
                          _hover={{ bg: "Primary.50" }}
                          color="Primary.900"
                          fontWeight={isSelected ? "bold" : "medium"}
                          borderBottom={index !== arr.length - 1 ? "1px solid" : "none"}
                          borderColor="Primary.300"
                          py={3}
                        >
                          {opt}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              </Box>

            </Flex>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" mt={4}>
            <Button mr={3} onClick={() => setIsOpen(false)} bg="Neutral.100" border="1px" borderColor="Primary.800" color="Primary.800">
              Cancel
            </Button>
            <Button bg="Primary.800" color="white" onClick={handleSavePet} isDisabled={isSaving} _hover={{ opacity: 0.9 }}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}