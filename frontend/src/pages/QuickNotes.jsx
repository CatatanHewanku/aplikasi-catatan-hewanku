import { Flex, Box, Text, Input, Textarea, Select, Button, Image } from "@chakra-ui/react";
import { MdArrowBack, MdOutlinePhotoCamera} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DefaultPet from "../images/defaultPet.jpeg";

export default function QuickNotes(){
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);

  const [selectedPet, setSelectedPet] = useState("");

  const [isNewPet, setIsNewPet] = useState(false);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [typePet, setTypePet] = useState("");
  const [gender, setGender] = useState("");
  const [petImage, setPetImage] = useState("");

  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [vet, setVet] = useState("");
  const [clinic, setClinic] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const savedPets =
      JSON.parse(localStorage.getItem("pets")) || [];

    setPets(savedPets);

  }, []);

  const handlePetChange = (value) => {

    setSelectedPet(value);

    if(value === "new"){
      setIsNewPet(true);
    } else {
      setIsNewPet(false);
    }
  };

  const handlePetImage = (e) => {

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPetImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handlePhoto = (e) => {

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {

    if(!date || !type) return;

    let petId = selectedPet;

    if(isNewPet){

      if(!name) return;

      const allPets =
        JSON.parse(localStorage.getItem("pets")) || [];

      const newPet = {
        id: Date.now().toString(),
        name,
        dob,
        type: typePet,
        gender,
        image: petImage || DefaultPet
      };

      allPets.push(newPet);

      localStorage.setItem(
        "pets",
        JSON.stringify(allPets)
      );

      petId = newPet.id;
    }

    const allLogs =
      JSON.parse(localStorage.getItem("medicationLogs")) || {};

    const newLog = {
      id: Date.now(),
      date,
      type,
      weight,
      temperature,
      vet,
      clinic,
      note,
      photo
    };

    if(!allLogs[petId]){
      allLogs[petId] = [];
    }

    allLogs[petId].push(newLog);

    localStorage.setItem(
      "medicationLogs",
      JSON.stringify(allLogs)
    );
    navigate(`/mypet/${petId}`);
  };

  return(
    <Flex direction="column" p="20px" gap={4} minH="100vh" pb="120px" >
      <Flex justify="flex-end">
        <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)} >
          <MdArrowBack size="28px"/>
        </Box>
      </Flex>

      <Text fontSize="2xl" fontWeight="medium" color="Primary.800">
        Quick Notes
      </Text>

      <Select bg="white" borderColor="Primary.800" color="Primary.800" value={selectedPet} onChange={(e) => handlePetChange(e.target.value)}>
        <option value="">
          My Pet
        </option>
        {pets.map((pet) => (
          <option
            key={pet.id}
            value={pet.id}
          >
            {pet.name}
          </option>
        ))}
        <option value="new">
          + Add New Pet
        </option>
      </Select>

        {isNewPet && (
        <Flex direction="column" gap={4}>
          <Flex align="center" gap={3}>
            <Box as="label">
              <Input type="file" accept="image/*" display="none" onChange={handlePetImage}/>
              <Flex w="70px" h="70px" borderRadius="full" overflow="hidden" bg="Primary.100" align="center" justify="center">
                {petImage ? (
                  <Image src={petImage} w="100%" h="100%" objectFit="cover"/>
                ) : (
                  <MdOutlinePhotoCamera size="28px"/>
                )}
              </Flex>
            </Box>
            <Text color="Primary.800">
              Upload Pet Photo
            </Text>
          </Flex>

          <Box>
            <Text mb="6px" color="Primary.800" fontSize="sm" >
              Pet Name
            </Text>
            <Input bg="white" borderColor="Primary.800" value={name} onChange={(e) => setName(e.target.value)} />
          </Box>

          <Box>
            <Text mb="6px" color="Primary.800" fontSize="sm" >
              DOB
            </Text>

            <Input type="date" bg="white" borderColor="Primary.800" value={dob} onChange={(e) => setDob(e.target.value)}/>
          </Box>

          <Select bg="white" borderColor="Primary.800" color="Primary.800" value={typePet} onChange={(e) => setTypePet(e.target.value)}>
            <option value="">
              Pet Type
            </option>
            <option value="Cat">
              Cat
            </option>
            <option value="Dog">
              Dog
            </option>
          </Select>

          <Select bg="white" borderColor="Primary.800" color="Primary.800" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">
              Gender
            </option>
            <option value="Male">
              Male
            </option>
            <option value="Female">
              Female
            </option>
          </Select>
        </Flex>
        )}

      <Select bg="white" borderColor="Primary.800" color="Primary.800" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">
          Consultation Type
        </option>
        <option value="Vaccination">
          Vaccination
        </option>
        <option value="General Check Up">
          General Check Up
        </option>
        <option value="Dental Care">
          Dental Care
        </option>
        <option value="Parasite Control">
          Parasite Control
        </option>
        <option value="Nutrition">
          Nutrition
        </option>
      </Select>

      <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
        <Text mb="6px" color="Primary.800" fontSize="sm">
          Examination Date
        </Text>
        <Input type="date" bg="Primary.100"  color="Primary.800" value={date} onChange={(e) => setDate(e.target.value)} />
      </Box>

      <Flex gap={4}>
        <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
          <Text mb="6px" color="Primary.800">
            Weight
          </Text>
          <Input bg="Primary.100" border="none" value={weight} onChange={(e) => setWeight(e.target.value)}/>
        </Box>

        <Box bg="Primary.200" p="12px" borderRadius="10px" flex="1">
          <Text mb="6px" color="Primary.800">
            Temperature
          </Text>
          <Input bg="Primary.100" border="none" value={temperature} onChange={(e) => setTemperature(e.target.value)}/>
        </Box>
      </Flex>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Veterinarian
        </Text>
        <Input bg="Primary.100" border="none" value={vet} onChange={(e) => setVet(e.target.value)}/>
      </Box>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Veterinary Clinic
        </Text>
        <Input bg="Primary.100" border="none"value={clinic} onChange={(e) => setClinic(e.target.value)} />
      </Box>

      <Box bg="Primary.200" p="12px" borderRadius="10px">
        <Text mb="6px" color="Primary.800">
          Medical Note
        </Text>
        <Textarea bg="Primary.100" border="none" resize="none" h="180px" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        <Flex justify="flex-end">
          <Text fontSize="sm" color="Primary.800">
            {note.length}/1000
          </Text>
        </Flex>
      </Box>
      <Flex align="center" gap={3}>
        <Box as="label" cursor="pointer">
          <Input type="file" accept="image/*" display="none" onChange={handlePhoto}/>
          <Flex w="50px" h="50px" borderRadius="10px" border="1px" borderColor="Primary.800" bg="white" align="center" justify="center" color="Primary.800">
            <MdOutlinePhotoCamera size="24px"/>
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

      <Button mt="4" bg="Primary.800" color="white" borderRadius="30px" h="50px" fontSize="xl" _hover={{opacity: 0.9}}onClick={handleSubmit}>
        Submit
      </Button>
    </Flex>
  )
}