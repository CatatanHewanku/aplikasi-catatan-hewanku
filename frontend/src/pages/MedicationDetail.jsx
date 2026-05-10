import { Flex, Box, Text, Image, Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Textarea, Input, Select} from "@chakra-ui/react";
import { MdArrowBack, MdNotes,MdMedicalServices, MdPets} from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
  
export default function MedicationDetail(){
    const { id } = useParams();
  
    const navigate = useNavigate();
  
    const [pet, setPet] = useState(null);
  
    const [notes, setNotes] = useState("");
    
    const [logs, setLogs] = useState([]);
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    const [tempNotes, setTempNotes] = useState("");
    const [editName, setEditName] = useState("");
    const [editDob, setEditDob] = useState("");
    const [editType, setEditType] = useState("");
    const [editGender, setEditGender] = useState("");
    const [editImage, setEditImage] = useState("");
  
    const [selectedLog, setSelectedLog] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {

        const pets =
          JSON.parse(localStorage.getItem("pets")) || [];
      
        const found =
          pets.find((p) => p.id === id);
      
        setPet(found);
      
        const savedNotes =
          JSON.parse(localStorage.getItem("petNotes")) || {};
      
        setNotes(savedNotes[id] || "");
      
        const savedLogs =
          JSON.parse(localStorage.getItem("medicationLogs")) || {};
      
        const petLogs = savedLogs[id] || [];
      
        const sortedLogs = petLogs.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      
        setLogs(sortedLogs);
      
      }, [id]);
  
    if(!pet){
      return null;
    }
    const handleOpenPetEdit = () => {

      setEditName(pet.name || "");
      setEditDob(pet.dob || "");
      setEditType(pet.type || "");
      setEditGender(pet.gender || "");
      setEditImage(pet.image || "");
    
      setIsOpen(true);
    };

    const handleImageUpload = (e) => {

      const file = e.target.files[0];
    
      if(!file) return;
    
      const reader = new FileReader();
    
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
    
      reader.readAsDataURL(file);
    };

    const handleSavePet = () => {

      const allPets =
        JSON.parse(localStorage.getItem("pets")) || [];
    
      const updatedPets =
        allPets.map((p) =>
    
          p.id === id
            ? {
                ...p,
                name: editName,
                dob: editDob,
                type: editType,
                gender: editGender,
                image: editImage
              }
            : p
        );
    
      localStorage.setItem(
        "pets",
        JSON.stringify(updatedPets)
      );
    
      setPet({
        ...pet,
        name: editName,
        dob: editDob,
        type: editType,
        gender: editGender,
        image: editImage
      });
    
      setIsOpen(false);
    };

    const handleOpenLog = (log) => {
  
      setSelectedLog(log);
  
      setIsOpen(true);
    };

    const handleSaveNotes = () => {

      const allNotes =
        JSON.parse(localStorage.getItem("petNotes")) || {};
    
      allNotes[id] = tempNotes;
    
      localStorage.setItem(
        "petNotes",
        JSON.stringify(allNotes)
      );
    
      setNotes(tempNotes);
    
      setIsNotesOpen(false);
    };
  
  
    return(
      <Flex direction="column" p="20px" gap={5} minH="100vh" pb="120px">  
        <Flex justify="flex-end">
          <Box cursor="pointer" color="Primary.800" onClick={() => navigate(-1)}>
            <MdArrowBack size="28px"/>
          </Box>
        </Flex>

            <Flex direction="column" gap={4}>
              <Flex justify="center" pb="15px">
                <Image src={pet.image} boxSize="130px" borderRadius="full" objectFit="cover" />
              </Flex>
              <Box position="relative" bg="Primary.200" pt="28px"pb="16px" px="16px" borderRadius="16px" boxShadow="md">
                <Box position="absolute" top="-14px" left="50%" transform="translateX(-50%)" bg="Primary.800" px="18px" py="4px" borderRadius="12px" whiteSpace="nowrap">
                  <Text color="Neutral.100" fontSize="lg" >
                    Personal Information
                  </Text>
                </Box>
                <Box color="Primary.900" position="absolute" top="-15px" left="20px" fontSize="28px">
                  <MdPets size="32px"/>
                </Box>
                  <Box bg="Primary.100" mt="5px" p="14px" borderRadius="12px" boxShadow="sm" cursor="pointer" onClick={handleOpenPetEdit} >
                    <Flex direction="column" gap={3}>
                      <Text color="Primary.800">
                        Name &nbsp;&nbsp;&nbsp;: {pet.name}
                      </Text> 
                      <Text color="Primary.800">
                        DOB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {pet.dob || "-"}
                      </Text>
                      <Text color="Primary.800">
                        Types &nbsp;&nbsp;&nbsp;: {pet.type || "-"}
                      </Text>
                      <Text color="Primary.800">
                        Gender : {pet.gender || "-"}
                      </Text>
                    </Flex>
                  </Box>
              </Box>
            </Flex>
              
        <Box bg="Primary.200" p="14px" borderRadius="10px">
            <Flex justify="space-between" align="center"mb="10px">
              <Flex align="center" gap={2}>
                <Icon as={MdNotes} color="Primary.800" />
                <Text color="Primary.800" fontWeight="medium" >
                  Notes
                </Text>
              </Flex>
  
            <Button size="xs" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800" onClick={() => { setTempNotes(notes); setIsNotesOpen(true); }} >
              Edit
            </Button>
  
          </Flex>
          <Box bg="Primary.100" borderRadius="10px" minH="140px" p="16px" overflowY="auto" >
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
              <Icon as={MdMedicalServices}color="Primary.800"/>
              <Text color="Primary.800" fontWeight="medium">
                Medication Log
              </Text>
            </Flex>
            <Button size="xs" borderRadius="20px" bg="white" border="1px" borderColor="Primary.800" color="Primary.800"  onClick={() => navigate(`/medication-form/${id}`)} >
              Add More
            </Button>
          </Flex>
  
          <Box bg="Primary.100" borderRadius="10px" p="14px" h="250px" overflowY="auto" >
            {logs.length === 0 ? (
              <Flex h="100%" align="center" justify="center">
                <Text color="Primary.700">
                  No medication log yet
                </Text>
              </Flex>
            ) : (
              <Flex direction="column">
                {logs.map((log, i) => (
                  <Flex key={i} justify="space-between" align="center" py="12px" borderBottom={ i !== logs.length - 1 ? "1px solid" : "none" } borderColor="Primary.300" onClick={() => navigate( `/medication-form/${id}/${log.id}` )} >
                    <Text color="Primary.800">
                      {new Date(log.date)
                        .toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                      }
                    </Text>
  
                    <Box border="1px" borderColor="Primary.800" borderRadius="8px" px="12px" py="3px" bg="white" minW="120px" textAlign="center">
                      <Text fontSize="xs" color="Primary.800" >
                        {log.type}
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
            <ModalContent bg="Primary.200"borderRadius="16px" mx="20px" boxShadow="xl">
              <ModalBody p="14px">
                <Flex justify="space-between" align="center" mb="12px" >

                  <Text color="Primary.800" cursor="pointer" fontWeight="medium" onClick={() => setIsNotesOpen(false)} >
                    Cancel
                  </Text>

                  <Text color="Primary.800" cursor="pointer" fontWeight="medium"onClick={handleSaveNotes}>
                    Save
                  </Text>
                </Flex>
                <Box bg="white" borderRadius="12px" px="14px" py="10px" >
                    <Textarea placeholder="Please type your input here" border="none" resize="none"  minH="120px" value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} _focus={{ border: "none", boxShadow: "none" }}/>
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentere>
             <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px)"/>
                <ModalContent borderRadius="16px" p="10px" mx="20px">
                  <ModalHeader textAlign="center" color="Primary.800" >
                      Pet Profile
                  </ModalHeader>
                    <ModalBody>  
                      <Flex direction="column" gap={4}>
                        <Input type="file" accept="image/*" onChange={handleImageUpload} />
                        <Input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value) } />
                        <Input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value) } />
                        <Select placeholder="Pet Type" value={editType} onChange={(e) => setEditType(e.target.value)} >
                          <option value="Cat (Junior)">
                            Cat (Junior)
                          </option>
                          <option value="Cat (Adult)">
                            Cat (Adult)
                          </option>
                          <option value="Cat (Senior)">
                            Cat (Senior)
                          </option>
                          <option value="Dog (Junior)">
                            Dog (Junior)
                          </option>
                          <option value="Dog (Adult)">
                            Dog (Adult)
                          </option>
                          <option value="Dog (Senior)">
                            Dog (Senior)
                          </option>
                        </Select>
                        <Select placeholder="Gender" value={editGender} onChange={(e) => setEditGender(e.target.value) } >
                          <option value="Male">
                            Male
                          </option>
                          <option value="Female">
                            Female
                          </option>
                        </Select>

                      </Flex>
                    </ModalBody>

                  <Flex gap={3} p="16px">
                    <Button flex="1" onClick={() => setIsOpen(false)} bg="white" border="1px" borderColor="Primary.800" >
                      Cancel
                    </Button>

                    <Button flex="1" bg="Primary.800" color="white" onClick={handleSavePet} >
                      Save
                    </Button>
                  </Flex>
                </ModalContent>
              </Modal>
      </Flex>
 )
}