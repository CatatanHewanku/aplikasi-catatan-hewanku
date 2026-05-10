import { Flex, Box, Text, Input} from "@chakra-ui/react";
import { MdArrowBack} from "react-icons/md";
import { useNavigate, useParams} from "react-router-dom";
import { useState, useEffect } from "react";
  
export default function NotesForm(){
    const navigate = useNavigate();

    const { id } = useParams();
  
    const [notes, setNotes] = useState("");
  
    useEffect(() => {
  
      const savedNotes =
        JSON.parse(localStorage.getItem("petNotes")) || {};
  
      setNotes(savedNotes[id] || "");
  
    }, [id]);

    const handleSave = () => {
  
      const allNotes =
        JSON.parse(localStorage.getItem("petNotes")) || {};
  
      allNotes[id] = notes;
  
      localStorage.setItem(
        "petNotes",
        JSON.stringify(allNotes)
      );
  
      navigate(`/mypet/${id}`);
    };
  
    return(
      <Flex direction="column" minH="100vh" p="20px" pt="40px">
        <Flex justify="flex-end" mb="20px">
          <Box color="Primary.800" onClick={() => navigate(-1)} >
            <MdArrowBack size="28px"/>
          </Box>
        </Flex>
  
        <Box bg="Primary.200" borderRadius="10px" p="14px">
          <Flex justify="space-between" align="center"mb="12px">
            <Text color="Primary.800" fontWeight="medium" onClick={() => navigate(-1)}>
              Cancel
            </Text>
  
            <Text color="Primary.800"  fontWeight="medium" onClick={handleSave}>
              Save
            </Text>
          </Flex>
  
          <Box bg="white" borderRadius="12px" px="14px"py="10px" >
            <Input placeholder="Please type your input here" border="none" value={notes} onChange={(e) => setNotes(e.target.value)} _focus={{border: "none",boxShadow: "none"}}/>
          </Box>
        </Box>
      </Flex>
    )
  }