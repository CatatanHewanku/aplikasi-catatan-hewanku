import { Flex, Box, Text, Input, Textarea, Button, Image, Modal, ModalOverlay, ModalContent, IconButton, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { MdArrowBack, MdOutlinePhotoCamera, MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const consultationOptions = [
  "Vaccination", "General Check Up", "Dental Care", "Parasite Control", 
  "Nutrition", "Illness/Treatment", "Surgery", "Prescription Refill", 
  "Follow-up", "Emergency"
];

export default function MedicationForm() {
  const navigate = useNavigate();
  const { id, logId } = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [record_visit_date, setRecord_visit_date] = useState("");
  const [record_consultation_type, setRecord_consultation_type] = useState("");
  const [record_vet_name, setRecord_vet_name] = useState("");
  const [record_vet_clinic_name, setRecord_vet_clinic_name] = useState("");
  const [record_pet_weight, setRecord_pet_weight] = useState("");
  const [record_pet_temperature, setRecord_pet_temperature] = useState("");
  const [record_note, setRecord_note] = useState("");
  const [record_image, setRecord_image] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the Image Zoom Modal
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  useEffect(() => {
    if (!logId) return;

    const fetchRecord = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/medical-records/${logId}`);
        const result = await response.json();

        if (response.ok) {
          setIsEditMode(true);
          setRecord_visit_date(result.data.record_visit_date?.split('T')[0] || "");
          setRecord_consultation_type(result.data.record_consultation_type || "");
          setRecord_vet_name(result.data.record_vet_name || "");
          setRecord_vet_clinic_name(result.data.record_vet_clinic_name || "");
          setRecord_pet_weight(result.data.record_pet_weight || "");
          setRecord_pet_temperature(result.data.record_pet_temperature || "");
          setRecord_note(result.data.record_note || "");
          if (result.data.record_image) {
            setRecord_image(result.data.record_image);
            setPhotoPreview(result.data.record_image);
          }
        }
      } catch (error) {
        console.error("Error fetching medical record:", error);
      }
    };

    fetchRecord();
  }, [logId]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format! Please upload only JPG or PNG images.");
      e.target.value = null;
      return;
    }

    setRecord_image(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!record_visit_date || !record_consultation_type || !record_vet_name || !record_vet_clinic_name || !record_pet_weight || !record_pet_temperature) {
      alert("Please fill in all required fields");
      return;
    }

    if (record_consultation_type === "Vaccination" && !record_image) {
      alert("Photo is required for Vaccination records");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pet_id', id);
      formData.append('record_visit_date', record_visit_date);
      formData.append('record_consultation_type', record_consultation_type);
      formData.append('record_vet_name', record_vet_name);
      formData.append('record_vet_clinic_name', record_vet_clinic_name);
      formData.append('record_pet_weight', record_pet_weight);
      formData.append('record_pet_temperature', record_pet_temperature);
      if (record_note) formData.append('record_note', record_note);
      if (record_image && record_image instanceof File) {
        formData.append('record_image', record_image);
      }

      const url = isEditMode
        ? `http://localhost:4000/api/medical-records/${logId}`
        : 'http://localhost:4000/api/medical-records';

      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert(isEditMode ? "Medical record updated successfully" : "Medical record created successfully");
        navigate(-1);
      } else {
        alert(result.message || "Failed to save medical record");
      }
    } catch (error) {
      console.error("Error saving medical record:", error);
      alert("Error saving medical record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this medical record?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/medical-records/${logId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        alert("Medical record deleted successfully");
        navigate(-1);
      } else {
        alert(result.message || "Failed to delete medical record");
      }
    } catch (error) {
      console.error("Error deleting medical record:", error);
      alert("Error deleting medical record");
    }
  };

  return (
    <Flex direction="column" p="20px" gap={4} minH="100vh" pb="120px">
      
      {/* STANDARD HEADER */}
      <Flex justify="space-between" align="center" pt="20px" pb="10px">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)}>
          <MdArrowBack size="28px" />
        </Box>
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="Primary.900">
          Medication Form
        </Text>
        <Box w="28px" /> 
      </Flex>

      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800" fontWeight="medium">
          Examination Date
        </Text>
        <Input type="date" bg="Primary.100" border="none" value={record_visit_date} onChange={(e) => setRecord_visit_date(e.target.value)} />
      </Box>

      {/* CHAKRA MENU DROPDOWN FIX */}
      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800" fontWeight="medium">
          Consultation Type
        </Text>
        <Menu matchWidth>
          <MenuButton 
            as={Flex} 
            w="100%" 
            h="40px" 
            bg="Primary.100" 
            borderRadius="md" 
            px="16px" 
            cursor="pointer"
            alignItems="center"
          >
            <Flex justify="space-between" align="center" h="100%">
              <Text color={record_consultation_type ? "black" : "gray.500"} fontSize="md">
                {record_consultation_type || "Select an Option"}
              </Text>
              <MdKeyboardArrowDown color="gray" size="20px" />
            </Flex>
          </MenuButton>
          
          {/* FIXED: Removed overflow="hidden" so scrolling works perfectly again */}
          <MenuList bg="Primary.100" borderColor="Primary.300" maxH="250px" overflowY="auto" zIndex={10} p={0} borderRadius="md" boxShadow="lg">
            {consultationOptions.map((opt, index) => {
              const isSelected = record_consultation_type === opt;
              
              return (
                <MenuItem 
                  key={opt} 
                  onClick={() => setRecord_consultation_type(opt)} 
                  bg={isSelected ? "Primary.300" : "Primary.100"} // Different background for selected
                  _hover={{ bg: "Primary.200" }}
                  color="Primary.900"
                  fontWeight={isSelected ? "bold" : "medium"} // Bold font for selected
                  borderBottom={index !== consultationOptions.length - 1 ? "1px solid" : "none"}
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

      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800" fontWeight="medium">
          Veterinarian
        </Text>
        <Input bg="Primary.100" border="none" value={record_vet_name} onChange={(e) => setRecord_vet_name(e.target.value)} />
      </Box>

      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800" fontWeight="medium">
          Veterinary Clinic
        </Text>
        <Input bg="Primary.100" border="none" value={record_vet_clinic_name} onChange={(e) => setRecord_vet_clinic_name(e.target.value)} />
      </Box>

      <Flex gap={4}>
        <Box bg="Primary.200" p="12px" borderRadius="14px" flex="1">
          <Text mb="6px" color="Primary.800" fontWeight="medium">
            Weight
          </Text>
          <Input bg="Primary.100" border="none" value={record_pet_weight} onChange={(e) => setRecord_pet_weight(e.target.value)} />
        </Box>
        <Box bg="Primary.200" p="12px" borderRadius="14px" flex="1">
          <Text mb="6px" color="Primary.800" fontWeight="medium">
            Temperature
          </Text>
          <Input bg="Primary.100" border="none" value={record_pet_temperature} onChange={(e) => setRecord_pet_temperature(e.target.value)} />
        </Box>
      </Flex>

      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800" fontWeight="medium">
          Medical Note
        </Text>
        <Textarea
          bg="Primary.100"
          border="none"
          resize="none"
          h="180px"
          maxLength={1000}
          value={record_note}
          onChange={(e) => setRecord_note(e.target.value)}
        />
        <Flex justify="flex-end">
          <Text fontSize="sm" color="Primary.800" mt="4px">
            {record_note.length}/1000
          </Text>
        </Flex>
      </Box>

      <Flex direction="column" gap={4}>
        <Flex align="center" gap={3}>
          <Box as="label" cursor="pointer">
            <Input
              type="file"
              accept=".jpg, .jpeg, .png, image/jpeg, image/png"
              display="none"
              onChange={handlePhoto}
            />
            <Flex
              w="50px"
              h="50px"
              borderRadius="12px"
              border="1px"
              borderColor="Primary.800"
              bg="white"
              align="center"
              justify="center"
              color="Primary.800"
            >
              <MdOutlinePhotoCamera size="24px" />
            </Flex>
          </Box>

          <Box>
            <Text fontSize="sm" color="Primary.800" fontWeight="medium">
              Required for Vaccination!
            </Text>
            <Text fontSize="xs" color="Primary.700">
              Please attach photo or sticker of vaccination
            </Text>
          </Box>
        </Flex>

        {photoPreview && (
          <Box position="relative" w="120px" h="120px" cursor="pointer" onClick={() => setIsImageZoomOpen(true)} _hover={{ opacity: 0.9 }}>
            <Image
              src={photoPreview}
              alt="Attachment preview"
              objectFit="cover"
              w="100%"
              h="100%"
              borderRadius="12px"
              border="2px solid"
              borderColor="Primary.800"
            />
          </Box>
        )}
      </Flex>

      {/* ACTION BUTTONS */}
      {isEditMode ? (
        <Flex direction="column" gap={3} mt="4">
          <Flex gap={4}>
            <Button
              flex="1"
              borderRadius="30px"
              h="50px"
              bg="white"
              border="1px"
              borderColor="Primary.800"
              color="Primary.800"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              flex="1"
              bg="Primary.800"
              color="white"
              borderRadius="30px"
              h="50px"
              _hover={{ opacity: 0.9 }}
              onClick={handleSubmit}
              isDisabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </Flex>
          <Button
            borderRadius="25px"
            bg="Neutral.100"
            border="1px"
            borderColor="Primary.800"
            color="red.500"
            fontWeight="medium"
            onClick={handleDelete}
          >
            Delete This Log
          </Button>
        </Flex>
      ) : (
        <Button
          mt="4"
          bg="Primary.800"
          color="white"
          borderRadius="30px"
          h="50px"
          fontSize="xl"
          onClick={handleSubmit}
          isDisabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      )}

      {/* --- IMAGE ZOOM MODAL --- */}
      <Modal isOpen={isImageZoomOpen} onClose={() => setIsImageZoomOpen(false)} isCentered size="xl">
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
            onClick={() => setIsImageZoomOpen(false)} 
            aria-label="Close image"
            _hover={{ bg: "gray.200", transform: "scale(1.05)" }}
            transition="all 0.2s"
          />
          <Image 
            src={photoPreview} 
            w="100%" 
            maxH="80vh" 
            objectFit="contain" 
            borderRadius="md" 
          />
        </ModalContent>
      </Modal>

    </Flex>
  );
}