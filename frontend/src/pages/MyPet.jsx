import { Flex, Text, Box, InputRightElement, Input, InputGroup, Image, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, useDisclosure, Spinner } from "@chakra-ui/react";
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCameraAlt, MdPets, MdKeyboardArrowDown, MdWarning, MdDateRange } from "react-icons/md";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CacheContext } from "../utils/CacheContext.jsx";
import { removeEmojis } from "../utils/textUtils.js";
import api from "../services/authService.js";
import DefaultPet from "../images/defaultPet.jpeg";

export default function MyPet() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getCachedData, updateCache } = useContext(CacheContext);

  const [search, setSearch] = useState("");
  const [pets, setPets] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const [petToDelete, setPetToDelete] = useState(null);

  const [editingPetId, setEditingPetId] = useState(null);
  const [pet_name, setPet_name] = useState("");
  const [pet_dob, setPet_dob] = useState("");
  const [pet_type, setPet_type] = useState("");
  const [pet_gender, setPet_gender] = useState("");
  const [pet_image, setPet_image] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getLocalTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayString();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (message, status = "success") => {
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
    const fetchPets = async () => {
      setIsLoading(true);
      try {
        const cachedPets = getCachedData('myPets');
        if (cachedPets && cachedPets.length > 0) {
          setPets(cachedPets);
          setIsLoading(false);
          return;
        }

        const response = await api.get('/pets/owner');
        const petsData = response.data.data || [];

        setPets(petsData);
        updateCache('myPets', petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
        showToast("Gagal memuat data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid file format! Please upload only JPG or PNG images.", "error");
      e.target.value = null;
      return;
    }

    setPet_image(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openAddModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEditModal = (pet) => {
    setEditingPetId(pet.pet_id);
    setPet_name(pet.pet_name || "");
    const formattedDate = pet.pet_dob ? new Date(pet.pet_dob).toISOString().split('T')[0] : "";
    setPet_dob(formattedDate);
    setPet_type(pet.pet_type || "");
    setPet_gender(pet.pet_gender || "");
    setPet_image(null);
    setImagePreview(pet.pet_image || "");
    setIsOpen(true);
  };

  const savePet = async () => {
    if (!pet_name || !pet_type || !pet_gender) {
      showToast("Name, Type, and Gender are required!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pet_name', pet_name);
      formData.append('pet_dob', pet_dob);
      formData.append('pet_type', pet_type);
      formData.append('pet_gender', pet_gender);

      if (pet_image && pet_image instanceof File) {
        formData.append('pet_image', pet_image);
      }

      let response;
      if (editingPetId) {
        response = await api.patch(`/pets/${editingPetId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Pet updated successfully");
      } else {
        response = await api.post('/pets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Pet added successfully");
      }

      const updatedData = response.data.data;
      const responseList = await api.get('/pets/owner');
      const updatedPets = responseList.data.data;

      setPets(updatedPets);
      updateCache('myPets', updatedPets);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving pet:", error);
      showToast("Error saving pet", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePet = async () => {
    if (!petToDelete) return;
    try {
      await api.delete(`/pets/${petToDelete}`);
      const updated = pets.filter((pet) => pet.pet_id !== petToDelete);
      setPets(updated);
      updateCache('myPets', updated);
      showToast("Pet deleted successfully");
    } catch (error) {
      showToast("Failed to delete pet", "error");
    } finally {
      onCloseDelete();
      setPetToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingPetId(null);
    setPet_name("");
    setPet_dob("");
    setPet_type("");
    setPet_gender("");
    setPet_image(null);
    setImagePreview("");
  };

  const filteredPets = pets.filter((pet) =>
    pet?.pet_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Flex direction="column" minH="100vh" p="20px">
      <Text pt="20px" pb="20px" fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
        My Pet
      </Text>

      <InputGroup w="100%" mb="10px">
        <Input placeholder="Search pet..." value={search} onChange={(e) => setSearch(removeEmojis(e.target.value))} border="1px" borderColor="Primary.900" borderRadius="20px" />
        <InputRightElement pointerEvents="none">
          <Box color="Primary.900">
            <MdSearch />
          </Box>
        </InputRightElement>
      </InputGroup>

      <Flex direction="column" gap={4} mt={2}>
        {isLoading ? (
          <Flex justify="center" align="center" py="20px">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="Primary.800" size="xl" />
          </Flex>
        ) : (
          <Flex direction="column" gap={4} mt={2}>
            {filteredPets.map((pet) => (
              <Flex key={pet.pet_id} align="center" justify="space-between" w="100%">
                <Flex align="center" gap={4} cursor={isEdit ? "default" : "pointer"} onClick={() => !isEdit && navigate(`/mypet/${pet.pet_id}`)} flex="1" overflow="hidden">
                  <Image src={pet.pet_image || DefaultPet} boxSize="70px" minW="70px" borderRadius="full" objectFit="cover" />
                  <Flex direction="column" gap={0} flex="1" overflow="hidden">
                    <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="Primary.900" isTruncated>{pet.pet_name}</Text>
                    <Text fontFamily="body" fontSize="sm" color="Primary.800" isTruncated mt={1}>{pet.pet_type}</Text>
                  </Flex>
                </Flex>

                {isEdit && (
                  <Flex gap={2} pl={4}>
                    <IconButton icon={<MdEdit />} colorScheme="blue" size="sm" borderRadius="full" onClick={() => openEditModal(pet)} aria-label="Edit Pet" />
                    <IconButton icon={<MdDelete />} colorScheme="red" size="sm" borderRadius="full" aria-label="Delete Pet"
                      onClick={() => {
                        setPetToDelete(pet.pet_id);
                        onOpenDelete();
                      }}
                    />
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>

      <Flex direction="column" gap={4} pt="30px" pb="120px">
        {pets.length > 0 && (
          <Flex justify="center">
            <Button size="lg" h="40px" w="50%" bg="Primary.800" borderRadius="25px" color="white" onClick={() => setIsEdit(!isEdit)}>
              {isEdit ? "Done" : "Edit"}
            </Button>
          </Flex>
        )}

        {search === "" && (
          <Flex justify="center">
            <Button bg="Neutral.100" h="40px" w="50%" border="1px" borderColor="Primary.800" borderRadius="25px" gap={2} onClick={openAddModal}>
              <Box color="Primary.800"><MdAdd size="20px" /></Box>
              <Text color="Primary.800">Add More Pet</Text>
            </Button>
          </Flex>
        )}
      </Flex>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} isCentered closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="16px" p="10px" mx="20px">
          <ModalHeader textAlign="center" color="Primary.900" fontFamily="heading" fontSize="xl" fontWeight="bold">
            {editingPetId ? "Edit Pet Profile" : "Add Pet Profile"}
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Flex justify="center" mb={2}>
                <Box position="relative" cursor="pointer" transition="all 0.2s" _hover={{ transform: "scale(1.05)" }}>
                  <Flex boxSize="100px" borderRadius="full" bg="Primary.100" justify="center" align="center" overflow="hidden" boxShadow="sm" border="3px solid" borderColor="Primary.800">
                    {imagePreview ? (
                      <Image src={imagePreview} boxSize="100px" borderRadius="full" objectFit="cover" />
                    ) : (
                      <Box color="Primary.800" fontSize="40px"><MdPets /></Box>
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
                <Input placeholder="Name" value={pet_name} onChange={(e) => setPet_name(removeEmojis(e.target.value))} borderColor="Primary.800" focusBorderColor="Primary.900" />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Date of Birth</Text>
                <InputGroup>
                  <Input
                    type="date"
                    value={pet_dob}
                    max={todayStr}
                    textAlign="left"
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    onChange={(e) => setPet_dob(removeEmojis(e.target.value))}
                    borderColor="Primary.800"
                    focusBorderColor="Primary.900"
                    cursor="pointer"
                    sx={{
                      "::-webkit-calendar-picker-indicator": {
                        display: "none",
                      }
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <Box color="Primary.800">
                      <MdDateRange size="20px" />
                    </Box>
                  </InputRightElement>
                </InputGroup>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Type</Text>
                <Menu matchWidth>
                  <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
                    <Flex justify="space-between" align="center" h="100%">
                      <Text color={pet_type ? "black" : "gray.500"} fontSize="md">{pet_type || "Pet Type"}</Text>
                      <MdKeyboardArrowDown color="gray" size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList bg="white" borderColor="Primary.300" zIndex={1500} p={0} borderRadius="md" boxShadow="lg">
                    {["Cat", "Dog"].map((opt, index, arr) => {
                      const isSelected = pet_type === opt;
                      return (
                        <MenuItem key={opt} onClick={() => setPet_type(opt)} bg={isSelected ? "Primary.100" : "white"} _hover={{ bg: "Primary.50" }} color="Primary.900" fontWeight={isSelected ? "bold" : "medium"} borderBottom={index !== arr.length - 1 ? "1px solid" : "none"} borderColor="Primary.300" py={3}>
                          {opt}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Gender</Text>
                <Menu matchWidth>
                  <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
                    <Flex justify="space-between" align="center" h="100%">
                      <Text color={pet_gender ? "black" : "gray.500"} fontSize="md">{pet_gender || "Gender"}</Text>
                      <MdKeyboardArrowDown color="gray" size="20px" />
                    </Flex>
                  </MenuButton>
                  <MenuList bg="white" borderColor="Primary.300" zIndex={1500} p={0} borderRadius="md" boxShadow="lg">
                    {["Male", "Female"].map((opt, index, arr) => {
                      const isSelected = pet_gender === opt;
                      return (
                        <MenuItem key={opt} onClick={() => setPet_gender(opt)} bg={isSelected ? "Primary.100" : "white"} _hover={{ bg: "Primary.50" }} color="Primary.900" fontWeight={isSelected ? "bold" : "medium"} borderBottom={index !== arr.length - 1 ? "1px solid" : "none"} borderColor="Primary.300" py={3}>
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
            <Button mr={3} onClick={() => { setIsOpen(false); resetForm(); }} bg="Neutral.100" border="1px" borderColor="Primary.800" color="Primary.800">
              Cancel
            </Button>
            <Button bg="Primary.800" color="white" onClick={savePet} isDisabled={isLoading} _hover={{ opacity: 0.9 }}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- CONFIRMATION MODAL FOR DELETION --- */}
      <Modal isOpen={isDeleteOpen} onClose={onCloseDelete} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="24px" mx="20px" p={4} textAlign="center" boxShadow="2xl">
          <ModalBody>
            <Flex justify="center" mb={4}>
              <Flex boxSize="60px" borderRadius="full" bg="red.50" justify="center" align="center" color="red.500">
                <MdWarning size="32px" />
              </Flex>
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="Primary.900" mb={2}>Delete Pet Profile?</Text>
            <Text color="Primary.800" fontSize="sm" mb={4}>
              Are you absolutely sure you want to delete this pet? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter display="flex" gap={3} justifyContent="center" pt={0}>
            <Button flex="1" bg="Neutral.100" color="Primary.800" borderRadius="30px" onClick={onCloseDelete}>
              Cancel
            </Button>
            <Button flex="1" bg="red.500" color="white" borderRadius="30px" onClick={deletePet} _hover={{ bg: "red.600" }}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}