import { Flex, Box, Text, Input, Textarea, Button } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function NotesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    // Backend fetch logic goes here
    navigate(`/mypet/${id}`);
  };

  return (
    <Flex direction="column" minH="100vh" p="20px" gap={5}>
      <Flex justify="space-between" align="center" pt="20px">
        <Box cursor="pointer" onClick={() => navigate(-1)}><MdArrowBack size="28px" /></Box>
        <Text fontSize="2xl" fontWeight="bold" color="Primary.900">Notes</Text>
        <Box w="28px" />
      </Flex>

      <Box bg="Primary.100" p="16px" borderRadius="16px">
        <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={2}>Content</Text>
        <Textarea bg="white" border="1px" borderColor="Primary.300" h="300px" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Box>

      <Button bg="Primary.800" color="white" borderRadius="30px" h="50px" onClick={handleSave}>
        Save Notes
      </Button>
    </Flex>
  );
}