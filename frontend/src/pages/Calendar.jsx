import { 
  Flex, Box, Text, Input, Button, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, Select, Popover, PopoverTrigger, 
  PopoverContent, PopoverBody, useToast, useDisclosure 
} from "@chakra-ui/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { MdAdd, MdChevronLeft, MdChevronRight, MdClose, MdAccessTime, MdWarning, MdKeyboardArrowDown } from "react-icons/md";
const URL_Name = import.meta.env.VITE_API_URL

// --- CUSTOM ALARM/CLOCK WHEEL COMPONENT ---
const ScrollWheel = ({ items, selectedValue, onSelect }) => {
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const index = items.indexOf(selectedValue);
      if (index !== -1) {
        containerRef.current.scrollTop = index * 40;
      }
    }
  }, [selectedValue, items]);

  const handleScroll = (e) => {
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const index = Math.round(e.target.scrollTop / 40);
      if (items[index] && items[index] !== selectedValue) {
        onSelect(items[index]);
      }
    }, 150); 
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      h="120px"
      overflowY="auto"
      sx={{
        scrollSnapType: "y mandatory",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      <Box h="40px" /> 
      {items.map((item) => (
        <Flex
          key={item}
          h="40px"
          align="center"
          justify="center"
          sx={{ scrollSnapAlign: "center" }}
          color={selectedValue === item ? "Primary.900" : "gray.400"}
          fontSize={selectedValue === item ? "xl" : "md"}
          fontWeight={selectedValue === item ? "bold" : "medium"}
          cursor="pointer"
          onClick={() => onSelect(item)}
          transition="all 0.2s"
        >
          {item}
        </Flex>
      ))}
      <Box h="40px" /> 
    </Box>
  );
};

export default function Calendar() {
  const toast = useToast();
  const today = new Date();
  
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [reminders, setReminders] = useState({});
  
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [selectedTag, setSelectedTag] = useState("");
  const [editingReminderId, setEditingReminderId] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen: isDeleteEventOpen, onOpen: onOpenDeleteEvent, onClose: onCloseDeleteEvent } = useDisclosure();
  const [eventToDelete, setEventToDelete] = useState(null);

  const tags = ["", "Vaccination", "General Check Up", "Dental Care", "Parasite Control", "Nutrition", "Illness/Treatment", "Surgery", "Prescription Refill", "Follow-up", "Emergency"];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const formatDate = (day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

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

  const fetchReminders = async (date) => {
    try {
      const ownerData = JSON.parse(localStorage.getItem("owner"));
      if (!ownerData?.owner_id) return;

      const response = await fetch(`${URL_Name}/api/reminder?owner_id=${ownerData.owner_id}&reminder_date=${date}`);
      const result = await response.json();

      if (response.ok) {
        setReminders((prev) => ({
          ...prev,
          [date]: result.data || []
        }));
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const fetchAllRemindersForMonth = async () => {
    try {
      const ownerData = JSON.parse(localStorage.getItem("owner"));
      if (!ownerData?.owner_id) return;

      const response = await fetch(
        `${URL_Name}/api/reminder/month?owner_id=${ownerData.owner_id}&year=${year}&month=${month + 1}`
      );
      const result = await response.json();

      if (response.ok && result.data) {
        const remindersByDate = {};
        result.data.forEach((reminder) => {
          const dateStr = reminder.reminder_date;
          if (!remindersByDate[dateStr]) remindersByDate[dateStr] = [];
          remindersByDate[dateStr].push(reminder);
        });
        setReminders((prev) => ({ ...prev, ...remindersByDate }));
      }
    } catch (error) {
      console.error("Error fetching month reminders:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchReminders(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchAllRemindersForMonth();
  }, [month, year]);

  const saveEvent = async () => {
    if (!inputText || !inputTime || !selectedDate) {
      showToast("Please fill in all details", "error");
      return;
    }

    setIsLoading(true);
    try {
      const ownerData = JSON.parse(localStorage.getItem("owner"));
      if (!ownerData?.owner_id) {
        showToast("User not found", "error");
        setIsLoading(false);
        return;
      }

      const payload = {
        reminder_title: inputText,
        reminder_time: inputTime,
        reminder_category: selectedTag || null
      };

      if (!editingReminderId) {
        payload.owner_id = ownerData.owner_id;
        payload.reminder_date = selectedDate;
      }

      const url = editingReminderId 
        ? `${URL_Name}/api/reminder/${editingReminderId}`
        : `${URL_Name}/api/reminder`;

      const method = editingReminderId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(`Reminder ${editingReminderId ? "updated" : "saved"}!`, "success");
        await fetchReminders(selectedDate);
        setInputText("");
        setInputTime("");
        setSelectedTag("");
        setEditingReminderId(null);
        setIsOpen(false);
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to save reminder", "error");
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      showToast("Error saving reminder", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const response = await fetch(`${URL_Name}/api/reminder/${eventToDelete.reminder_id}`, { method: "DELETE" });

      if (response.ok) {
        showToast("Reminder deleted", "success");
        await fetchReminders(eventToDelete.date);
      } else {
        showToast("Failed to delete reminder", "error");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      showToast("Error deleting reminder", "error");
    } finally {
      onCloseDeleteEvent();
      setEventToDelete(null);
    }
  };

  const selectedEvents = selectedDate ? reminders[selectedDate] || [] : [];
  const currentHour = inputTime ? inputTime.split(":")[0] : "08";
  const currentMinute = inputTime ? inputTime.split(":")[1] : "00";

  return (
    <Flex direction="column" minH="100vh" py={6} px={4} align="center" pb="120px">
      <Box w="100%" maxW="400px">
        <Text pb={4} fontSize="2xl" color="Primary.900" fontFamily="heading" fontWeight="bold">
          Calendar
        </Text>

        <Flex direction="column" align="center" gap={5}>
          <Box w="100%" borderRadius="xl" bg="Primary.200" display="flex" flexDirection="column" p={4} boxShadow="sm">
            <Flex justify="space-between" align="center" px={2} pb={4} color="Primary.900">
              <Box cursor="pointer" onClick={handlePrevMonth}>
                <MdChevronLeft size={28} />
              </Box>

              {/* SINGLE COMBINED MONTH/YEAR DROPDOWN */}
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Flex align="center" gap={1} cursor="pointer" _hover={{ opacity: 0.8 }}>
                    <Text fontSize="lg" fontWeight="bold">
                      {monthNames[month]} {year}
                    </Text>
                    <MdKeyboardArrowDown size={22} />
                  </Flex>
                </PopoverTrigger>
                <PopoverContent w="240px" maxW="90vw" bg="white" borderColor="Primary.800" overflow="hidden" boxShadow="xl">
                  <PopoverBody p={0}>
                    <Flex>
                      <Box flex={1} borderRight="1px solid" borderColor="gray.100">
                        <ScrollWheel items={monthNames} selectedValue={monthNames[month]} onSelect={(m) => setMonth(monthNames.indexOf(m))} />
                      </Box>
                      <Box flex={1}>
                        <ScrollWheel items={yearOptions} selectedValue={year} onSelect={(y) => setYear(y)} />
                      </Box>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              <Box cursor="pointer" onClick={handleNextMonth}>
                <MdChevronRight size={28} />
              </Box>
            </Flex>

            <Box flex="1" bg="Primary.100" borderRadius="lg" p={2} color="Primary.800">
              <Flex justify="space-between" px={2} pb={2}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <Text key={d} fontSize="xs" fontWeight="bold" opacity={0.7}>{d}</Text>
                ))}
              </Flex>

              <Flex wrap="wrap" gap={1} justify="flex-start">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <Box key={"e" + i} w="calc(100% / 7 - 4px)" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = formatDate(day);
                  const hasEvent = reminders[key] && reminders[key].length > 0;
                  const isSelected = selectedDate === key;
                  const isToday = key === todayKey;

                  return (
                    <Box key={i} w="calc(100% / 7 - 4px)" display="flex" justifyContent="center" alignItems="center" cursor="pointer" onClick={() => setSelectedDate(key)} py={1}>
                      <Box w="32px" h="32px" display="flex" justifyContent="center" alignItems="center" borderRadius="full" bg={hasEvent ? "Primary.900" : isSelected ? "Primary.700" : isToday ? "Primary.300" : "transparent"} transition="background 0.2s">
                        <Text fontSize="sm" fontWeight={isSelected || isToday ? "bold" : "medium"} color={hasEvent || isSelected ? "white" : "Primary.900"}>
                          {day}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          </Box>

          <Box w="100%" minH="250px" borderRadius="xl" bg="Primary.200" p={4} display="flex" flexDirection="column" position="relative" boxShadow="sm">
            <Text textAlign="center" fontWeight="bold" mb={2} color="Primary.900" fontSize="lg">
              Upcoming Activity
            </Text>

            {selectedDate && (
              <Text textAlign="center" fontSize="sm" mb={4} color="Primary.800" opacity={0.8} fontWeight="medium">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            )}

            {!selectedDate ? (
              <Text textAlign="center" fontSize="sm" color="Primary.900" mt={6}>
                Choose a date to view activities.
              </Text>
            ) : selectedEvents.length === 0 ? (
              <Flex flex="1" justify="center" align="center" minH="100px">
                <Text fontSize="md" color="Primary.800" opacity={0.6}>
                  No events scheduled.
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap={3} pb={12}>
                {selectedEvents.map((item, idx) => (
                  <Flex key={idx} justify="space-between" align="center" bg="Primary.100" p={3} borderRadius="lg" cursor="pointer" transition="transform 0.1s" _active={{ transform: "scale(0.98)" }}
                    onClick={() => {
                      setEditingReminderId(item.reminder_id);
                      setInputText(item.reminder_title);
                      setInputTime(item.reminder_time.slice(0, 5));
                      setSelectedTag(item.reminder_category || "");
                      setIsOpen(true);
                    }}
                  >
                    <Flex direction="column">
                      {item.reminder_category && (
                        <Box fontSize="xs" fontWeight="bold" color="Primary.700" mb={1} textTransform="uppercase" letterSpacing="wide">
                          {item.reminder_category}
                        </Box>
                      )}
                      <Text fontSize="md" fontWeight="medium" color="Primary.900">
                        {item.reminder_title}
                      </Text>
                      <Flex align="center" gap={1} mt={1} color="Primary.800" opacity={0.8}>
                        <MdAccessTime size="14px" />
                        <Text fontSize="sm">{item.reminder_time.slice(0, 5)}</Text>
                      </Flex>
                    </Flex>

                    <Flex boxSize="30px" align="center" justify="center" borderRadius="full" color="red.400" _hover={{ bg: "red.50" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToDelete({ ...item, date: selectedDate });
                        onOpenDeleteEvent();
                      }}
                    >
                      <MdClose size="20px" />
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}

            <Button position="absolute" bottom={4} right={4} w="46px" h="46px" minW="0px" p={0} borderRadius="full" bg="Primary.800" boxShadow="md" isDisabled={!selectedDate} _hover={{ bg: "Primary.700", transform: "translateY(-2px)" }} transition="all 0.2s"
              onClick={() => {
                setInputText("");
                setInputTime("");
                setSelectedTag("");
                setEditingReminderId(null);
                setIsOpen(true);
              }}
            >
              <Box color="white"><MdAdd size="24px" /></Box>
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* --- ADD/EDIT EVENT MODAL --- */}
      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditingReminderId(null); }} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader fontFamily="heading" color="Primary.900">
            {editingReminderId !== null ? "Edit Event" : "Add Event"}
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Event Name</Text>
                <Input bg="white" placeholder="E.g., Vet Appointment" value={inputText} onChange={(e) => setInputText(e.target.value)} border="1px" borderColor="Primary.300" focusBorderColor="Primary.800" />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Time</Text>
                <Popover placement="bottom-start" matchWidth isLazy>
                  <PopoverTrigger>
                    <Flex bg="white" border="1px solid" borderColor="Primary.300" borderRadius="md" p={2} px={4} justify="space-between" align="center" cursor="pointer" _hover={{ borderColor: "Primary.500" }}>
                      <Text color={inputTime ? "Primary.900" : "gray.400"}>
                        {inputTime || "Select Time"}
                      </Text>
                      <MdAccessTime color="var(--chakra-colors-Primary-800)" />
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent bg="white" borderColor="Primary.800" overflow="hidden" boxShadow="lg">
                    <PopoverBody p={0}>
                      <Flex>
                        <Box flex={1} borderRight="1px solid" borderColor="gray.100">
                          <ScrollWheel items={hours} selectedValue={currentHour} onSelect={(h) => setInputTime(`${h}:${currentMinute}`)} />
                        </Box>
                        <Box flex={1}>
                          <ScrollWheel items={minutes} selectedValue={currentMinute} onSelect={(m) => setInputTime(`${currentHour}:${m}`)} />
                        </Box>
                      </Flex>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="Primary.800" mb={1}>Category</Text>
                <Select bg="white" placeholder="No Category" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} border="1px" borderColor="Primary.300" focusBorderColor="Primary.800">
                  {tags.filter(t => t !== "").map((tag, i) => (
                    <option key={i} value={tag}>{tag}</option>
                  ))}
                </Select>
              </Box>
            </Flex>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100" mt={2}>
            <Button mr={3} onClick={() => { setIsOpen(false); setEditingReminderId(null); }} bg="Neutral.100" color="Primary.800" borderRadius="30px">
              Cancel
            </Button>
            <Button bg="Primary.800" color="white" onClick={saveEvent} isDisabled={isLoading} borderRadius="30px" _hover={{ opacity: 0.9 }}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- CONFIRMATION MODAL FOR DELETING AN EVENT --- */}
      <Modal isOpen={isDeleteEventOpen} onClose={onCloseDeleteEvent} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="24px" mx="20px" p={4} textAlign="center" boxShadow="2xl">
            <ModalBody>
                <Flex justify="center" mb={4}>
                    <Flex boxSize="60px" borderRadius="full" bg="red.50" justify="center" align="center" color="red.500">
                        <MdWarning size="32px" />
                    </Flex>
                </Flex>
                <Text fontSize="xl" fontWeight="bold" color="Primary.900" mb={2}>Delete Event?</Text>
                <Text color="Primary.800" fontSize="sm" mb={4}>
                    Are you sure you want to cancel this event?
                </Text>
            </ModalBody>
            <ModalFooter display="flex" gap={3} justifyContent="center" pt={0}>
                <Button flex="1" bg="Neutral.100" color="Primary.800" borderRadius="30px" onClick={onCloseDeleteEvent}>
                    Back
                </Button>
                <Button flex="1" bg="red.500" color="white" borderRadius="30px" onClick={confirmDeleteEvent} _hover={{ bg: "red.600" }}>
                    Delete
                </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}