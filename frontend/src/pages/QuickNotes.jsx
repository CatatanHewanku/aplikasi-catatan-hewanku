import { Flex, Box, Text, Input, Textarea, Button, Image, Modal, ModalOverlay, ModalContent, IconButton, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { MdArrowBack, MdOutlinePhotoCamera, MdClose, MdKeyboardArrowDown, MdPets, MdCameraAlt } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { CacheContext } from "../context/CacheContext.jsx";
import DefaultPet from "../images/defaultPet.jpeg";

const consultationOptions = [
  "Vaccination", "General Check Up", "Dental Care", "Parasite Control", 
  "Nutrition", "Illness/Treatment", "Surgery", "Prescription Refill", 
  "Follow-up", "Emergency"
];

export default function QuickNotes() {
  const navigate = useNavigate();
  const { getCachedData, updateCache } = useContext(CacheContext);
  
  const [ownerId, setOwnerId] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPet, setSelectedPet] = useState("");
  const [isNewPet, setIsNewPet] = useState(false);

  // New Pet States
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [typePet, setTypePet] = useState("");
  const [gender, setGender] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState("");

  // Record States
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [vet, setVet] = useState("");
  const [clinic, setClinic] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Zoom States
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState("");

  useEffect(() => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));
    if (!ownerData?.owner_id) return;
    setOwnerId(ownerData.owner_id);

    const fetchPets = async () => {
      try {
        const cachedPets = getCachedData('myPets');
        if (cachedPets && cachedPets.length > 0) {
          setPets(cachedPets);
        }

        const response = await fetch(`http://localhost:4000/api/pets/owner/${ownerData.owner_id}`);
        const result = await response.json();

        if (response.ok) {
          setPets(result.data || []);
          updateCache('myPets', result.data || []);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchPets();
  }, []);

  const handlePetChange = (value) => {
    setSelectedPet(value);
    setIsNewPet(value === "new");
  };

  const handlePetImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format! Please upload only JPG or PNG images.");
      e.target.value = null;
      return;
    }

    setPetImage(file);
    setPetImagePreview(URL.createObjectURL(file));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format! Please upload only JPG or PNG images.");
      e.target.value = null;
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const openZoom = (imageSrc) => {
    setZoomImageSrc(imageSrc);
    setIsZoomOpen(true);
  };

  const handleSubmit = async () => {
    // Validate pet selection
    if (!selectedPet) {
      alert("Please select a pet or create a new one!");
      return;
    }

    // Validate new pet fields (if creating new pet)
    if (isNewPet) {
      if (!name || !typePet || !gender) {
        alert("Please fill out the Name, Type, and Gender for the new pet.");
        return;
      }
    }

    // Validate medical record fields
    if (!date || !type) {
      alert("Please fill in the Examination Date and Consultation Type");
      return;
    }
    if (!vet || !clinic) {
      alert("Please fill in the Veterinarian and Veterinary Clinic");
      return;
    }
    if (!weight || !temperature) {
      alert("Please fill in the Weight and Temperature");
      return;
    }

    // Validate vaccination photo requirement
    if (type === "Vaccination" && !photo) {
      alert("A photo attachment is required for Vaccination records!");
      return;
    }

    setIsLoading(true);
    let finalPetId = selectedPet;

    try {
      // Create new pet if needed (now after ALL validations pass)
      if (isNewPet) {
        const petFormData = new FormData();
        petFormData.append('owner_id', ownerId);
        petFormData.append('pet_name', name);
        petFormData.append('pet_dob', dob);
        petFormData.append('pet_type', typePet);
        petFormData.append('pet_gender', gender);
        if (petImage) petFormData.append('pet_image', petImage);

        const petResponse = await fetch('http://localhost:4000/api/pets', {
          method: 'POST',
          body: petFormData
        });
        
        const petResult = await petResponse.json();
        if (!petResponse.ok) throw new Error(petResult.message || "Failed to save new pet");
        
        finalPetId = petResult.data.pet_id; 
        
        const updatedPets = [...pets, petResult.data];
        setPets(updatedPets);
        updateCache('myPets', updatedPets);
      }

      const recordFormData = new FormData();
      recordFormData.append('pet_id', finalPetId);
      recordFormData.append('record_visit_date', date);
      recordFormData.append('record_consultation_type', type);
      recordFormData.append('record_vet_name', vet);
      recordFormData.append('record_vet_clinic_name', clinic);
      recordFormData.append('record_pet_weight', weight);
      recordFormData.append('record_pet_temperature', temperature);
      if (note) recordFormData.append('record_note', note);
      if (photo) recordFormData.append('record_image', photo);

      const recordResponse = await fetch('http://localhost:4000/api/medical-records', {
        method: 'POST',
        body: recordFormData
      });

      const recordResult = await recordResponse.json();
      if (!recordResponse.ok) throw new Error(recordResult.message || "Failed to save medical record");

      alert("Quick Note saved successfully!");
      navigate(`/mypet/${finalPetId}`);

    } catch (error) {
      console.error("Submission Error:", error);
      alert(error.message || "An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPetDisplay = () => {
    if (selectedPet === "new") return "+ Add New Pet";
    const foundPet = pets.find(p => p.pet_id.toString() === selectedPet.toString());
    return foundPet ? foundPet.pet_name : "My Pet";
  };

  return (
    <Flex direction="column" p="20px" gap={4} minH="100vh" pb="120px" >
      
      <Flex justify="flex-end">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)} >
          <MdArrowBack size="28px" />
        </Box>
      </Flex>
      <Text fontSize="2xl" fontWeight="medium" color="Primary.800">
        Quick Notes
      </Text>

      <Menu matchWidth>
        <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
          <Flex justify="space-between" align="center" h="100%">
            <Text color="Primary.800" fontSize="md">
              {getSelectedPetDisplay()}
            </Text>
            <MdKeyboardArrowDown color="var(--chakra-colors-Primary-800)" size="20px" />
          </Flex>
        </MenuButton>
        <MenuList bg="white" borderColor="Primary.800" maxH="250px" overflowY="auto" zIndex={10} p={0} borderRadius="md" boxShadow="lg">
          {pets.map((pet) => (
            <MenuItem 
              key={pet.pet_id} 
              onClick={() => handlePetChange(pet.pet_id.toString())} 
              bg={selectedPet === pet.pet_id.toString() ? "Primary.100" : "white"} 
              _hover={{ bg: "Primary.50" }}
              color="Primary.800"
              fontWeight={selectedPet === pet.pet_id.toString() ? "bold" : "normal"}
              borderBottom="1px solid"
              borderColor="Primary.200" 
              py={2}
            >
              {pet.pet_name}
            </MenuItem>
          ))}
          <MenuItem 
            onClick={() => handlePetChange("new")} 
            bg={selectedPet === "new" ? "Primary.100" : "white"} 
            _hover={{ bg: "Primary.50" }}
            color="Primary.800"
            fontWeight="bold"
            py={2}
          >
            + Add New Pet
          </MenuItem>
        </MenuList>
      </Menu>

      {isNewPet && (
        <Flex direction="column" gap={4}>
          <Flex align="center" gap={3}>
            
            {/* NEW PET AVATAR: Fixed click overlap bug */}
            <Box position="relative">
              <Flex w="70px" h="70px" borderRadius="full" overflow="hidden" bg="Primary.100" align="center" justify="center">
                {petImagePreview ? (
                  <Image src={petImagePreview} w="100%" h="100%" objectFit="cover" cursor="pointer" onClick={() => openZoom(petImagePreview)} />
                ) : (
                  <Box color="Primary.800">
                    <MdPets size="32px" />
                  </Box>
                )}
              </Flex>
              {/* Only the camera icon triggers the file upload now! */}
              <Box as="label" position="absolute" bottom="-2px" right="-2px" cursor="pointer" _hover={{ transform: "scale(1.1)" }} transition="all 0.2s">
                <Input type="file" accept="image/*" display="none" onChange={handlePetImage} />
                <Flex bg="Primary.800" boxSize="28px" borderRadius="full" justify="center" align="center" color="white" boxShadow="sm" border="2px solid white">
                  <MdCameraAlt size="14px" />
                </Flex>
              </Box>
            </Box>

            <Text color="Primary.800">
              Upload Pet Photo
            </Text>
          </Flex>

          <Box>
            <Text mb="6px" color="Primary.800" fontSize="sm" >
              Pet Name
            </Text>
            <Input bg="white" border="1px solid" borderColor="Primary.800" value={name} onChange={(e) => setName(e.target.value)} />
          </Box>

          <Box>
            <Text mb="6px" color="Primary.800" fontSize="sm" >
              DOB
            </Text>
            <Input type="date" bg="white" border="1px solid" borderColor="Primary.800" color="Primary.800" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Box>

          <Menu matchWidth>
            <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
              <Flex justify="space-between" align="center" h="100%">
                <Text color={typePet ? "Primary.800" : "gray.500"} fontSize="md">{typePet || "Pet Type"}</Text>
                <MdKeyboardArrowDown color="var(--chakra-colors-Primary-800)" size="20px" />
              </Flex>
            </MenuButton>
            <MenuList bg="white" borderColor="Primary.800" zIndex={10} p={0} borderRadius="md" boxShadow="lg">
              {["Cat", "Dog"].map((opt, i) => (
                <MenuItem key={opt} onClick={() => setTypePet(opt)} bg={typePet === opt ? "Primary.100" : "white"} color="Primary.800" fontWeight={typePet === opt ? "bold" : "normal"} borderBottom={i === 0 ? "1px solid" : "none"} borderColor="Primary.200" py={2}>
                  {opt}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu matchWidth>
            <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
              <Flex justify="space-between" align="center" h="100%">
                <Text color={gender ? "Primary.800" : "gray.500"} fontSize="md">{gender || "Gender"}</Text>
                <MdKeyboardArrowDown color="var(--chakra-colors-Primary-800)" size="20px" />
              </Flex>
            </MenuButton>
            <MenuList bg="white" borderColor="Primary.800" zIndex={10} p={0} borderRadius="md" boxShadow="lg">
              {["Male", "Female"].map((opt, i) => (
                <MenuItem key={opt} onClick={() => setGender(opt)} bg={gender === opt ? "Primary.100" : "white"} color="Primary.800" fontWeight={gender === opt ? "bold" : "normal"} borderBottom={i === 0 ? "1px solid" : "none"} borderColor="Primary.200" py={2}>
                  {opt}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      )}

      <Menu matchWidth>
        <MenuButton as={Flex} w="100%" h="40px" bg="white" border="1px solid" borderColor="Primary.800" borderRadius="md" px="16px" cursor="pointer" alignItems="center">
          <Flex justify="space-between" align="center" h="100%">
            <Text color={type ? "Primary.800" : "gray.500"} fontSize="md">
              {type || "Consultation Type"}
            </Text>
            <MdKeyboardArrowDown color="var(--chakra-colors-Primary-800)" size="20px" />
          </Flex>
        </MenuButton>
        <MenuList bg="white" borderColor="Primary.800" maxH="250px" overflowY="auto" zIndex={10} p={0} borderRadius="md" boxShadow="lg">
          {consultationOptions.map((opt, index) => (
            <MenuItem 
              key={opt} 
              onClick={() => setType(opt)} 
              bg={type === opt ? "Primary.100" : "white"} 
              _hover={{ bg: "Primary.50" }}
              color="Primary.800"
              fontWeight={type === opt ? "bold" : "normal"}
              borderBottom={index !== consultationOptions.length - 1 ? "1px solid" : "none"}
              borderColor="Primary.200" 
              py={2}
            >
              {opt}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
        <Text mb="6px" color="Primary.800" fontSize="sm">
          Examination Date
        </Text>
        <Input type="date" bg="Primary.100" border="none" color="Primary.800" value={date} onChange={(e) => setDate(e.target.value)} />
      </Box>

      <Flex gap={4}>
        <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
          <Text mb="6px" color="Primary.800">
            Weight
          </Text>
          <Input bg="Primary.100" border="none" color="Primary.800" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Box>

        <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
          <Text mb="6px" color="Primary.800">
            Temperature
          </Text>
          <Input bg="Primary.100" border="none" color="Primary.800" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </Box>
      </Flex>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Veterinarian
        </Text>
        <Input bg="Primary.100" border="none" color="Primary.800" value={vet} onChange={(e) => setVet(e.target.value)} />
      </Box>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Veterinary Clinic
        </Text>
        <Input bg="Primary.100" border="none" color="Primary.800" value={clinic} onChange={(e) => setClinic(e.target.value)} />
      </Box>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Medical Note
        </Text>
        <Textarea bg="Primary.100" border="none" color="Primary.800" resize="none" h="180px" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        <Flex justify="flex-end">
          <Text fontSize="sm" color="Primary.800">
            {note.length}/1000
          </Text>
        </Flex>
      </Box>

      <Flex direction="column" gap={4}>
        <Flex align="center" gap={3}>
          <Box as="label" cursor="pointer">
            <Input type="file" accept="image/*" display="none" onChange={handlePhoto} />
            <Flex w="50px" h="50px" borderRadius="10px" border="1px" borderColor="Primary.800" bg="white" align="center" justify="center" color="Primary.800" _hover={{ transform: "scale(1.05)" }} transition="all 0.2s">
              <MdOutlinePhotoCamera size="24px" />
            </Flex>
          </Box>

          <Box>
            <Text fontSize="sm" color="Primary.800" fontWeight="medium">
              Required for Vaccination!
            </Text>
            <Text fontSize="sm" color="Primary.700">
              Please attach photo or sticker of vaccination
            </Text>
          </Box>
        </Flex>

        {/* MEDICAL ATTACHMENT WITH NEW "X" REMOVE BUTTON */}
        {photoPreview && (
          <Box position="relative" w="100px" h="100px">
            <Image src={photoPreview} alt="Attachment preview" objectFit="cover" w="100%" h="100%" borderRadius="10px" border="1px solid" borderColor="Primary.800" cursor="pointer" onClick={() => openZoom(photoPreview)} />
            
            {/* The new remove button! */}
            <IconButton 
              icon={<MdClose size="14px" />} 
              size="xs" 
              isRound 
              bg="red.500" 
              color="white" 
              position="absolute" 
              top="-8px" 
              right="-8px" 
              boxShadow="md"
              _hover={{ bg: "red.600", transform: "scale(1.1)" }}
              onClick={() => {
                setPhoto(null);
                setPhotoPreview("");
              }}
              aria-label="Remove photo"
            />
          </Box>
        )}
      </Flex>

      <Button mt="4" bg="Primary.800" color="white" borderRadius="30px" h="50px" fontSize="xl" _hover={{ opacity: 0.9 }} onClick={handleSubmit} isDisabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </Button>

      {/* --- IMAGE ZOOM MODAL --- */}
      <Modal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} isCentered size="xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" mx={4} position="relative">
          <IconButton 
            icon={<MdClose size="24px" />} 
            isRound 
            bg="white" 
            color="Primary.900" 
            size="md" 
            position="absolute"
            top="-50px"
            right="0"
            zIndex="10"
            onClick={() => setIsZoomOpen(false)} 
            aria-label="Close image"
            _hover={{ bg: "gray.200", transform: "scale(1.05)" }}
            transition="all 0.2s"
          />
          <Image src={zoomImageSrc} w="100%" maxH="80vh" objectFit="contain" borderRadius="md" />
        </ModalContent>
      </Modal>

    </Flex>
  );
}