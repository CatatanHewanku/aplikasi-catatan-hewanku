import { Flex, Box, Text, Input, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useState } from "react";
import { MdAdd, MdAddAlert, MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";
  
export default function Calendar() {
const today = new Date();

const [month, setMonth] = useState(today.getMonth());
const [year, setYear] = useState(today.getFullYear());
const [events, setEvents] = useState({});
const [selectedDate, setSelectedDate] = useState(null);

const [isOpen, setIsOpen] = useState(false);
const [inputText, setInputText] = useState("");
const [inputTime, setInputTime] = useState("");

const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

const daysInMonth = new Date(year, month + 1, 0).getDate();
const firstDay = new Date(year, month, 1).getDay();

const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

const formatDate = (day) => {
    return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
};

const handleNextMonth = () => {
    if (month === 11) {
    setMonth(0);
    setYear(year + 1);
    } else {
    setMonth(month + 1);
    }
};

const handlePrevMonth = () => {
    if (month === 0) {
    setMonth(11);
    setYear(year - 1);
    } else {
    setMonth(month - 1);
    }
};

const saveEvent = () => {
    if (!inputText || !inputTime || !selectedDate) return;

    const newEvent = `${inputText} - ${inputTime}`;

    setEvents((prev) => ({
    ...prev,
    [selectedDate]: [...(prev[selectedDate] || []), newEvent]
    }));

    setInputText("");
    setInputTime("");
    setIsOpen(false);
};

const removeEvent = (date, index) => {
    setEvents((prev) => {
    const updated = [...prev[date]];
    updated.splice(index, 1);

    const newData = { ...prev };
    if (updated.length === 0) {
        delete newData[date];
    } else {
        newData[date] = updated;
    }
    return newData;
    });
};
  
const selectedEvents = selectedDate ? events[selectedDate] || [] : [];
  
    return (
      <Flex direction="column" minH="100vh" p="20px">
  
        <Text pt="20px" pb="20px" fontSize="xl" color="Primary.900">
          Calendar
        </Text>
  
        <Flex direction="column" align="center" gap={4}>
  
          <Box w="340px" h="300px" borderRadius={10} bg="Primary.200" display="flex" flexDirection="column" p="10px">

            <Flex justify="space-between" align="center" px="30px" pb={3} color="Primary.900">
              <Box cursor="pointer" onClick={handlePrevMonth}>
                <MdChevronLeft size={25}/>
              </Box>
              <Text fontSize="xl" fontWeight="medium">
                {monthNames[month]} {year}
              </Text>
              <Box cursor="pointer" onClick={handleNextMonth}>
                <MdChevronRight size={25}/>
              </Box>
            </Flex>
  
            <Box flex="1" bg="Primary.100" borderRadius={10} p="6px" color="Primary.800">
              <Flex justify="space-between" px={2} pb={1}>
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <Text key={d} fontSize="xs">{d}</Text>
                ))}
              </Flex>
  
              <Flex wrap="wrap" gap={1}>
  
                {Array.from({ length: firstDay }).map((_, i) => (
                  <Box key={"e"+i} w="calc(100% / 7 - 4px)" />
                ))}
  
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = formatDate(day);
  
                  const hasEvent = events[key];
                  const isSelected = selectedDate === key;
                  const isToday = key === todayKey;
  
                  return (
                    <Box key={i} w="calc(100% / 7 - 4px)" display="flex" justifyContent="center" alignItems="center" cursor="pointer"onClick={() => setSelectedDate(key)}>
                      <Box w="28px" h="28px" display="flex" justifyContent="center" alignItems="center" borderRadius="full" bg={ hasEvent ? "Primary.900" : isSelected ? "Primary.700" : isToday   ? "Primary.300"   : "transparent" }>
                        <Text fontSize="sm" color={hasEvent || isSelected ? "Neutral.100" : "Primary.900"}>{day}</Text>
                      </Box>
                    </Box>
                  );
                })}
  
              </Flex>
            </Box>
          </Box>
  
          <Box w="340px" h="260px" borderRadius={10} bg="Primary.200" p="10px" overflowY="auto"display="flex" flexDirection="column" position="relative" >
            <Text textAlign="center" fontWeight="medium" mb="8px" color="Primary.900">
              Upcoming Activity
            </Text>

  
            {selectedDate && (
              <Text textAlign="center" fontSize="sm" mb="5px" color="Primary.800">
                {selectedDate}
              </Text>
            )}
  
            {!selectedDate ? (
              <Text textAlign="center" fontSize="sm" color="Primary.900">
                Choose Dates 
              </Text>
            ) : selectedEvents.length === 0 ? (
              <Box flex="1" display="flex" justifyContent="center" alignItems="center">
              <Text fontSize="md" color="Primary.900">
                No events 
              </Text>
          
              </Box>
            ) : (
              selectedEvents.map((item, idx) => (
                <Flex key={idx} justify="space-between" align="center" mt={3}>
                  <Text fontSize="md" color="Primary.800">{item}</Text>
                  <Text fontSize="md" color="Primary.800" onClick={() => removeEvent(selectedDate, idx)}>
                    <MdClose/>
                  </Text>
                </Flex>
              ))
            )}
            <Box position="absolute" bottom="10px" right="10px">
            <Button w="40px" h="40px" minW="0px" p={0} borderRadius="100%" bg="Primary.800" isDisabled={!selectedDate} onClick={() => setIsOpen(true)} _hover={{}}>
                <Box color="Neutral.100">
                    <MdAdd size="20px"/>
                </Box>
            </Button>

            </Box>
          </Box>
  
        </Flex>
  
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered >0
          <ModalOverlay />
          <ModalContent borderRadius="16px">
  
            <ModalHeader fontFamily="body" color="Primary.800">Add Event</ModalHeader>
  
            <ModalBody>
              <Flex direction="column" gap={3}>
                <Input placeholder="Event name" value={inputText} onChange={(e) => setInputText(e.target.value)}/>
  
                <Input type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)}/>
              </Flex>
            </ModalBody>
  
            <ModalFooter>
              <Button mr={3} fontFamily="body" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button bg="Primary.800" color="Neutral.100" fontFamily="body" onClick={saveEvent}>
                Save
              </Button>
            </ModalFooter>
  
          </ModalContent>
        </Modal>
  
      </Flex>
    );
  }