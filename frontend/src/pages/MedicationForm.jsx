import { Flex, Box, Text, Input, Textarea, Select, Button } from "@chakra-ui/react";
import { MdArrowBack, MdOutlinePhotoCamera } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MedicationForm() {

  const navigate = useNavigate();

  const { id, logId } = useParams();

  const [isEditMode, setIsEditMode] = useState(false);

  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [vet, setVet] = useState("");
  const [clinic, setClinic] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    if (!logId) return;

    const allLogs =
      JSON.parse(localStorage.getItem("medicationLogs")) || {};

    const petLogs = allLogs[id] || [];

    const existingLog =
      petLogs.find(
        (log) => String(log.id) === String(logId)
      );

    if (existingLog) {

      setIsEditMode(true);

      setDate(existingLog.date || "");
      setType(existingLog.type || "");
      setVet(existingLog.vet || "");
      setClinic(existingLog.clinic || "");
      setWeight(existingLog.weight || "");
      setTemperature(existingLog.temperature || "");
      setNote(existingLog.note || "");
      setPhoto(existingLog.photo || "");
    }

  }, [id, logId]);


  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setPhoto(file); // Store the actual File object for FormData
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };


  const handleSubmit = async () => {
    if (!date || !type || !vet || !clinic || !weight || !temperature) return;
    
    // Photo is required for Vaccination
    if (type === "Vaccination" && !photo) {
      alert("Photo is required for Vaccination records");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pet_id', id);
      formData.append('record_visit_date', date);
      formData.append('record_consultation_type', type);
      formData.append('record_vet_name', vet);
      formData.append('record_vet_clinic_name', clinic);
      formData.append('record_pet_weight', weight);
      formData.append('record_pet_temperature', temperature);
      if (note) formData.append('record_note', note);
      if (photo && photo instanceof File) {
        formData.append('record_image', photo);
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
        navigate(`/mypet/${id}`);
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

  const handleDelete = () => {

    const allLogs =
      JSON.parse(localStorage.getItem("medicationLogs")) || {};

    const petLogs = allLogs[id] || [];


    const updatedLogs =
      petLogs.filter(
        (log) => String(log.id) !== String(logId)
      );


    allLogs[id] = updatedLogs;

    localStorage.setItem(
      "medicationLogs",
      JSON.stringify(allLogs)
    );


    navigate(`/mypet/${id}`);
  };

  return (

    <Flex direction="column" p="20px" gap={4} minH="100vh" pb="120px">
      <Flex justify="flex-end">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)}>
          <MdArrowBack size="28px" />
        </Box>
      </Flex>
      <Text fontSize="4xl" fontWeight="medium" color="Primary.800" mb="2">
        Medication Form
      </Text>
      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800">
          Examination Date
        </Text>
        <Input type="date" bg="Primary.100" border="none" value={date} onChange={(e) => setDate(e.target.value)} />
      </Box>
      <Box bg="Primary.200" p="12px" borderRadius="14px">
        <Text mb="6px" color="Primary.800">
          Consultation Type
        </Text>
        <Select bg="Primary.100" border="none" placeholder="Select an Option" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Vaccination">Vaccination</option>
          <option value="General Check Up">General Check Up</option>
          <option value="Dental Care">Dental Care</option>
          <option value="Parasite Control">Parasite Control</option>
          <option value="Nutrition">Nutrition</option>
          <option value="Illness/Treatment">Illness/Treatment</option>
          <option value="Surgery">Surgery</option>
          <option value="Prescription Refill">Prescription Refill</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Emergency">Emergency</option>
        </Select>
      </Box>
      <Box bg="Primary.200" p="12px" borderRadius="14px" >
        <Text mb="6px" color="Primary.800">
          Veterinarian
        </Text>
        <Input bg="Primary.100" border="none" value={vet} onChange={(e) => setVet(e.target.value)} />
      </Box>
      <Box bg="Primary.200" p="12px" borderRadius="14px" >
        <Text mb="6px" color="Primary.800">
          Veterinary Clinic
        </Text>
        <Input bg="Primary.100" border="none" value={clinic} onChange={(e) => setClinic(e.target.value)} />
      </Box>

      <Flex gap={4}>
        <Box bg="Primary.200" p="12px" borderRadius="14px" flex="1">
          <Text mb="6px" color="Primary.800">
            Weight
          </Text>
          <Input bg="Primary.100" border="none" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Box>
        <Box
          bg="Primary.200"
          p="12px"
          borderRadius="14px"
          flex="1"
        >

          <Text
            mb="6px"
            color="Primary.800"
          >
            Temperature
          </Text>

          <Input
            bg="Primary.100"
            border="none"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />

        </Box>

      </Flex>

      {/* 📝 NOTE */}
      <Box
        bg="Primary.200"
        p="12px"
        borderRadius="14px"
      >

        <Text
          mb="6px"
          color="Primary.800"
        >
          Medical Note
        </Text>

        <Textarea
          bg="Primary.100"
          border="none"
          resize="none"
          h="180px"
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Flex justify="flex-end">

          <Text
            fontSize="sm"
            color="Primary.800"
            mt="4px"
          >
            {note.length}/1000
          </Text>

        </Flex>

      </Box>


      <Flex
        align="center"
        gap={3}
      >

        <Box
          as="label"
          cursor="pointer"
        >

          <Input
            type="file"
            accept="image/*"
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

          <Text
            fontSize="sm"
            color="Primary.800"
            fontWeight="medium"
          >
            Required for Vaccination!
          </Text>

          <Text
            fontSize="xs"
            color="Primary.700"
          >
            Please attach photo or sticker of vaccination
          </Text>

        </Box>

      </Flex>


      {isEditMode ? (

        <Flex
          direction="column"
          gap={3}
          mt="4"
        >


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
            <Button flex="1" bg="Primary.800" color="white" borderRadius="30px" h="50px" _hover={{ opacity: 0.9 }} onClick={handleSubmit}>
              Save
            </Button>
          </Flex>
          <Button
            borderRadius="25px"
            bg="Neutral.100"
            border="1px"
            borderColor="Primary.800"
            color="red.500"
            fontWeight="medium"
            _hover="none"
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
        >
          Submit
        </Button>

      )}

    </Flex>
  )
}