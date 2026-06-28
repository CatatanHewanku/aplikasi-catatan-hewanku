import { Flex, Box, Text, Button, Image } from "@chakra-ui/react";
import { MdAccessTime, MdChevronRight, MdBolt, MdAdd, MdPets } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSilentRefresh } from "../utils/useSilentRefresh.js";

export default function Home() {
  const navigate = useNavigate();
  const [owner_name, setOwner_name] = useState("");
  const [owner_image_url, setOwner_image_url] = useState(null);
  
  const [closestReminder, setClosestReminder] = useState(null);
  const [timeUntilReminder, setTimeUntilReminder] = useState(null);
  const [timeUnitReminder, setTimeUnitReminder] = useState("days");
  const [nowReminderTime, setNowReminderTime] = useState(null);
  const [lastReminderId, setLastReminderId] = useState(null);

  const { isLoading, loadingText, executeWithRetry } = useSilentRefresh();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));
    if (ownerData) {
      setOwner_name(ownerData.owner_name || "User");
      setOwner_image_url(ownerData.owner_image_url || null);
    }
  }, []);

  const updateTimeDisplay = (reminder, reminderDate, now) => {
    const timeUntilMs = reminderDate - now;
    if (timeUntilMs <= 0) {
      setTimeUntilReminder("NOW");
      setTimeUnitReminder("");
    } else if (timeUntilMs < 60 * 60 * 1000) {
      const minutesUntil = Math.ceil(timeUntilMs / (60 * 1000));
      setTimeUntilReminder(minutesUntil);
      setTimeUnitReminder("minutes");
    } else if (timeUntilMs < 24 * 60 * 60 * 1000) {
      const hoursUntil = Math.ceil(timeUntilMs / (1000 * 60 * 60));
      setTimeUntilReminder(hoursUntil);
      setTimeUnitReminder("hours");
    } else {
      const daysUntil = Math.floor(timeUntilMs / (1000 * 60 * 60 * 24));
      setTimeUntilReminder(daysUntil);
      setTimeUnitReminder("days");
    }
  };

  useEffect(() => {
    const fetchClosestReminder = async () => {
      const ownerData = JSON.parse(localStorage.getItem("owner"));
      if (!ownerData?.owner_id) return;

      await executeWithRetry(
        async () => {
          const response = await fetch(`/api/reminder/upcoming?owner_id=${ownerData.owner_id}&days_ahead=90`);
          if (!response.ok) {
            const err = new Error("Failed to fetch");
            err.status = response.status;
            throw err;
          }
          return response.json();
        },
        {
          defaultLoadingText: "Loading upcoming events...",
          onSuccess: (result) => {
            const now = new Date();
            if (result.data && result.data.length > 0) {
              let closestEvent = null;
              let minTimeMs = Infinity;

              for (const reminder of result.data) {
                if (reminder.is_completed) continue;

                const reminderDate = new Date(reminder.reminder_date);
                const [hours, minutes] = reminder.reminder_time.split(":").map(Number);
                reminderDate.setHours(hours, minutes, 0, 0);

                const timeUntilMs = reminderDate - now;

                if (timeUntilMs < -5 * 60 * 1000) continue;

                if (timeUntilMs < minTimeMs) {
                  minTimeMs = timeUntilMs;
                  closestEvent = reminder;
                }
              }

              setClosestReminder(closestEvent);
              setLastReminderId(closestEvent?.reminder_id || null);

              if (closestEvent) {
                const reminderDate = new Date(closestEvent.reminder_date);
                const [hours, minutes] = closestEvent.reminder_time.split(":").map(Number);
                reminderDate.setHours(hours, minutes, 0, 0);
                updateTimeDisplay(closestEvent, reminderDate, now);
                
                const timeUntilMs = reminderDate - now;
                if (timeUntilMs <= 0) setNowReminderTime(now.getTime());
              } else {
                setTimeUntilReminder(null);
                setTimeUnitReminder("days");
              }
            } else {
              setClosestReminder(null);
              setTimeUntilReminder(null);
              setTimeUnitReminder("days");
            }
          },
          onError: (error) => {
            console.error("Error fetching closest reminder:", error);
            setClosestReminder(null);
          }
        }
      );
    };

    fetchClosestReminder();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!closestReminder) return;
      const now = new Date();

      if (nowReminderTime && now.getTime() - nowReminderTime >= 5 * 60 * 1000) {
        setNowReminderTime(null);
        setLastReminderId(null);
        
        const fetchNextReminder = async () => {
          try {
            const ownerData = JSON.parse(localStorage.getItem("owner"));
            if (!ownerData?.owner_id) return;
            const nowTime = new Date();
            const response = await fetch(`/api/reminder/upcoming?owner_id=${ownerData.owner_id}&days_ahead=90`);
            const result = await response.json();

            if (response.ok && result.data && result.data.length > 0) {
              let closestEvent = null;
              let minTimeMs = Infinity;
              for (const reminder of result.data) {
                if (reminder.is_completed) continue;
                const reminderDate = new Date(reminder.reminder_date);
                const [h, m] = reminder.reminder_time.split(":").map(Number);
                reminderDate.setHours(h, m, 0, 0);
                const timeUntilMs = reminderDate - nowTime;
                if (timeUntilMs < -5 * 60 * 1000) continue;
                if (timeUntilMs < minTimeMs) { minTimeMs = timeUntilMs; closestEvent = reminder; }
              }
              setClosestReminder(closestEvent);
              setLastReminderId(closestEvent?.reminder_id || null);
              if (closestEvent) {
                const reminderDate = new Date(closestEvent.reminder_date);
                const [h, m] = closestEvent.reminder_time.split(":").map(Number);
                reminderDate.setHours(h, m, 0, 0);
                updateTimeDisplay(closestEvent, reminderDate, nowTime);
              }
            }
          } catch (error) {
            console.error("Error refreshing reminder:", error);
          }
        };
        fetchNextReminder();
      } else if (closestReminder) {
        const reminderDate = new Date(closestReminder.reminder_date);
        const [h, m] = closestReminder.reminder_time.split(":").map(Number);
        reminderDate.setHours(h, m, 0, 0);
        updateTimeDisplay(closestReminder, reminderDate, now);
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [closestReminder, nowReminderTime]);

  return (
    <Flex direction="column" minH="100vh" p="20px">
      <Flex justify="space-between" align="center" pt="20px" pb="20px" gap={4}>
        <Text fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900" flex="1" noOfLines={2}>
          Welcome, {owner_name}
        </Text>

        <Flex minW="50px" boxSize="50px" borderRadius="full" bg="Primary.200" justify="center" align="center" boxShadow="md" cursor="pointer" overflow="hidden" flexShrink={0} onClick={() => navigate("/user-profile")}>
          {owner_image_url ? (
            <Image src={owner_image_url} boxSize="50px" objectFit="cover" borderRadius="full" />
          ) : (
            <Box color="Primary.800" fontSize="26px"><MdPets /></Box>
          )}
        </Flex>
      </Flex>

      <Flex direction="column" gap={5}>
        <Box borderRadius="10px" bg="Primary.200" p="12px" boxShadow="md">
          <Flex justify="space-between" align="center" mb="10px">
            <Flex align="center" gap={2}>
              <Box color="Primary.900"><MdAccessTime size="20px" /></Box>
              <Text color="Primary.900" fontWeight="medium" fontSize="lg" fontFamily="heading">Reminder</Text>
            </Flex>
            <Box color="Primary.900" cursor="pointer" onClick={() => navigate("/calendar")}><MdChevronRight size="24px" /></Box>
          </Flex>

          <Box bg="Primary.100" borderRadius="10px" p="20px" textAlign="center">
            {isLoading ? (
              <Text color="Primary.900" fontFamily="heading" fontSize="md" fontWeight="regular" animation={loadingText !== "Loading upcoming events..." ? "pulse 1.5s infinite" : "none"}>
                {loadingText}
              </Text>
            ) : !closestReminder ? (
              <Text color="Primary.900" fontFamily="heading" fontSize="md" fontWeight="regular">No upcoming activity</Text>
            ) : (
              <>
                {closestReminder.reminder_category && (
                  <Box display="inline-block" px="12px" py="4px" borderRadius="8px" border="1px" borderColor="Primary.800" mb="10px" fontSize="sm">
                    {closestReminder.reminder_category}
                  </Box>
                )}
                <Text fontSize="lg" fontWeight="medium" color="Primary.900" fontFamily="body">{closestReminder.reminder_title}</Text>
                <Flex justify="center" align="center" gap={1} mt="8px" mb="8px">
                  <MdAccessTime size={16} color="var(--chakra-colors-Primary-800)" />
                  <Text fontSize="md" color="Primary.800" fontFamily="body">{closestReminder.reminder_time.slice(0, 5)}</Text>
                </Flex>
                <Text fontSize="md" color="Primary.900" fontFamily="body">{timeUnitReminder === "NOW" ? "" : "In"}</Text>
                {timeUntilReminder === "NOW" ? (
                  <Text fontSize="xl" fontWeight="bold" color="Primary.900" animation="pulse 1s infinite">NOW</Text>
                ) : (
                  <Text fontSize="lg" fontWeight="bold" color="Primary.900">
                    {timeUntilReminder} {timeUnitReminder === "hours" ? (timeUntilReminder === 1 ? "Hour" : "Hours") : timeUnitReminder === "minutes" ? (timeUntilReminder === 1 ? "Minute" : "Minutes") : (timeUntilReminder === 1 ? "Day" : "Days")}
                  </Text>
                )}
              </>
            )}
          </Box>
        </Box>

        <Box borderRadius="10px" bg="Primary.200" p="12px" boxShadow="md">
          <Flex align="center" gap={2} mb="10px">
            <Box color="Primary.900"><MdBolt size="20px" /></Box>
            <Text color="Primary.900" fontWeight="medium" fontSize="lg" fontFamily="heading">Quick Action</Text>
          </Flex>
          <Flex gap={4} bg="Primary.100" p="15px" borderRadius="12px">
            <Flex direction="column" align="center" flex="1" bg="Neutral.100" borderRadius="10px" p="15px" textAlign="center" boxShadow="md" cursor="pointer" onClick={() => navigate("/quick-notes")}>
              <Box color="Primary.800"><MdAdd size={30} /></Box>
              <Text mt="5px" color="Primary.800" fontFamily="heading" fontSize="lg">Add Notes</Text>
            </Flex>
            <Flex direction="column" align="center" flex="1" bg="Neutral.100" borderRadius="10px" p="15px" textAlign="center" boxShadow="md" cursor="pointer" onClick={() => navigate("/vet")}>
              <Box color="Primary.800"><MdPets size={30} /></Box>
              <Text mt="5px" color="Primary.800" fontFamily="heading" fontSize="lg">Find Vet</Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}