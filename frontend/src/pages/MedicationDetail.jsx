import { Flex, Box, Text, Image, Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Textarea, Input, Select } from "@chakra-ui/react";
import { MdArrowBack, MdNotes, MdMedicalServices, MdPets } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState([]);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editType, setEditType] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editImage, setEditImage] = useState("");
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
    setEditName(pet.pet_name);
    setEditDob(pet.pet_dob);
    setEditType(pet.pet_type);
    setEditGender(pet.pet_gender);
    setEditImage(pet.pet_image || "");
    setIsOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePet = () => {
    const allPets = JSON.parse(localStorage.getItem("pets")) || [];

    const updatedPets = allPets.map((p) =>
      p.pet_id === parseInt(id)
        ? {
            ...p,
            pet_name: editName,
            pet_dob: editDob,
            pet_type: editType,
            pet_gender: editGender,
            pet_image: editImage
          }
        : p
    );

    localStorage.setItem("pets", JSON.stringify(updatedPets));

    setPet({
      ...pet,
      pet_name: editName,
      pet_dob: editDob,
      pet_type: editType,
      pet_gender: editGender,
      pet_image: editImage
    });

    setIsOpen(false);
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
      <Flex justify="flex-end">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)}>
          <MdArrowBack size="28px" />
        </Box>
      </Flex>

      <Flex direction="column" gap={4}>
        <Flex justify="center" pb="15px">
          <Image src={pet.pet_image} boxSize="130px" borderRadius="full" objectFit="cover" fallback={<Box boxSize="130px" bg="gray.200" borderRadius="full" />} />
        </Flex>
        <Box position="relative" bg="Primary.200" pt="28px" pb="16px" px="16px" borderRadius="16px" boxShadow="md">
          <Box position="absolute" top="-14px" left="50%" transform="translateX(-50%)" bg="Primary.800" px="18px" py="4px" borderRadius="12px" whiteSpace="nowrap">
            <Text color="Neutral.100" fontSize="lg">
              Personal Information
            </Text>
          </Box>
          <Box color="Primary.900" position="absolute" top="-15px" left="20px" fontSize="28px">
            <MdPets size="32px" />
          </Box>
          <Box bg="Primary.100" mt="5px" p="14px" borderRadius="12px" boxShadow="sm" cursor="pointer" onClick={handleOpenPetEdit}>
            <Flex direction="column" gap={3}>
              <Text color="Primary.800">
                Name &nbsp;&nbsp;&nbsp;: {pet.pet_name}
              </Text>
              <Text color="Primary.800">
                DOB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {pet.pet_dob ? new Date(pet.pet_dob).toISOString().split('T')[0] : "-"}
              </Text>
              <Text color="Primary.800">
                Type &nbsp;&nbsp;&nbsp;: {pet.pet_type} ({calculateAgeCategory(pet.pet_dob)})
              </Text>
              <Text color="Primary.800">
                Gender : {pet.pet_gender || "-"}
              </Text>
            </Flex>
          </Box>
        </Box>
      </Flex>

      <Box bg="Primary.200" p="14px" borderRadius="10px">
        <Flex justify="space-between" align="center" mb="10px">
          <Flex align="center" gap={2}>
            <Icon as={MdNotes} color="Primary.800" />
            <Text color="Primary.800" fontWeight="medium">
              Notes
            </Text>
          </Flex>
          <Button size="xs" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800" onClick={() => { setTempNotes(notes); setIsNotesOpen(true); }}>
            Edit
          </Button>
        </Flex>
        <Box bg="Primary.100" borderRadius="10px" minH="140px" p="16px" overflowY="auto">
          {notes ? (
            <Text color="Primary.800" whiteSpace="pre-wrap">
              {notes}
            </Text>
          ) : (
            <Text color="Primary.700">
              No notes yet
            </Text>
          )}
        </Box>
      </Box>

      <Box bg="Primary.200" p="14px" borderRadius="10px">
        <Flex justify="space-between" align="center" mb="10px">
          <Flex align="center" gap={2}>
            <Icon as={MdMedicalServices} color="Primary.800" />
            <Text color="Primary.800" fontWeight="medium">
              Medication Log
            </Text>
          </Flex>
          <Button size="xs" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800" onClick={() => navigate(`/medication-form/${id}`)}>
            Add More
          </Button>
        </Flex>

        <Box bg="Primary.100" borderRadius="10px" p="14px" h="250px" overflowY="auto">
          {logs.length === 0 ? (
            <Flex h="100%" align="center" justify="center">
              <Text color="Primary.700">
                No medication log yet
              </Text>
            </Flex>
          ) : (
            <Flex direction="column">
              {logs.map((log, i) => (
                <Flex key={log.record_id} justify="space-between" align="center" py="12px" borderBottom={i !== logs.length - 1 ? "1px solid" : "none"} borderColor="Primary.300" cursor="pointer" onClick={() => navigate(`/medication-form/${id}/${log.record_id}`)}>
                  <Text color="Primary.800">
                    {new Date(log.record_visit_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </Text>
                  <Box border="1px" borderColor="Primary.800" borderRadius="8px" px="12px" py="3px" bg="white" minW="120px" textAlign="center">
                    <Text fontSize="xs" color="Primary.800">
                      {log.record_consultation_type}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      </Box>

      <Modal isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px)" />
        <ModalContent bg="Primary.200" borderRadius="16px" mx="20px" boxShadow="xl">
          <ModalBody p="14px">
            <Flex justify="space-between" align="center" mb="12px">
              <Text color="Primary.800" cursor="pointer" fontWeight="medium" onClick={() => setIsNotesOpen(false)}>
                Cancel
              </Text>
              <Text color="Primary.800" cursor="pointer" fontWeight="medium" onClick={handleSaveNotes}>
                Save
              </Text>
            </Flex>
            <Box bg="white" borderRadius="12px" px="14px" py="10px">
              <Textarea placeholder="Please type your input here" border="none" resize="none" minH="120px" value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} _focus={{ border: "none", boxShadow: "none" }} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="16px" p="10px" mx="20px">
          <ModalHeader textAlign="center" color="Primary.800">
            Pet Profile
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              <Input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <Input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
              <Select placeholder="Pet Type" value={editType} onChange={(e) => setEditType(e.target.value)}>
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
              </Select>
              <Select placeholder="Gender" value={editGender} onChange={(e) => setEditGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </Flex>
          </ModalBody>
          <Flex gap={3} p="16px">
            <Button flex="1" onClick={() => setIsOpen(false)} bg="white" border="1px" borderColor="Primary.800">
              Cancel
            </Button>
            <Button flex="1" bg="Primary.800" color="white" onClick={handleSavePet}>
              Save
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
}