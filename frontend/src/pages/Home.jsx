import { Flex, Box, Text, Button, Image } from "@chakra-ui/react";
import { MdAccessTime, MdChevronRight, MdBolt, MdAdd, MdPets } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
const URL_Name = import.meta.env.VITE_API_URL

export default function Home() {
  const navigate = useNavigate();
  const [owner_name, setOwner_name] = useState("");
  const [owner_image_url, setOwner_image_url] = useState(null);
  const [closestReminder, setClosestReminder] = useState(null);
  const [timeUntilReminder, setTimeUntilReminder] = useState(null);
  const [timeUnitReminder, setTimeUnitReminder] = useState("days");
  const [isLoading, setIsLoading] = useState(true);
  const [nowReminderTime, setNowReminderTime] = useState(null);
  const [lastReminderId, setLastReminderId] = useState(null);

  useEffect(() => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));
    
    if (ownerData) {
      setOwner_name(ownerData.owner_name || "User");
      setOwner_image_url(ownerData.owner_image_url || null);
    }
  }, []);

  // Calculate and update time display
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

  // Fetch reminders and find the closest one
  useEffect(() => {
    const fetchClosestReminder = async () => {
      try {
        const ownerData = JSON.parse(localStorage.getItem("owner"));
        if (!ownerData?.owner_id) {
          setIsLoading(false);
          return;
        }

        const now = new Date();

        // Fetch upcoming reminders for next 90 days
        const response = await fetch(
          `${URL_Name}/api/reminder/upcoming?owner_id=${ownerData.owner_id}&days_ahead=90`
        );
        const result = await response.json();

        if (response.ok && result.data && result.data.length > 0) {
          let closestEvent = null;
          let minTimeMs = Infinity;

          // Find the closest reminder (including those within 5 minutes of NOW)
          for (const reminder of result.data) {
            // Skip completed reminders
            if (reminder.is_completed) {
              continue;
            }

            const reminderDate = new Date(reminder.reminder_date);
            const [hours, minutes] = reminder.reminder_time.split(":").map(Number);
            reminderDate.setHours(hours, minutes, 0, 0);

            const timeUntilMs = reminderDate - now;

            // Include reminders that are NOW or in the future (but allow 5 min grace period for "NOW" state)
            if (timeUntilMs < -5 * 60 * 1000) {
              continue;
            }

            // Found a valid reminder
            if (timeUntilMs < minTimeMs) {
              minTimeMs = timeUntilMs;
              closestEvent = reminder;
            }
          }

          setClosestReminder(closestEvent);
          setLastReminderId(closestEvent?.reminder_id || null);

          // Update time display
          if (closestEvent) {
            const reminderDate = new Date(closestEvent.reminder_date);
            const [hours, minutes] = closestEvent.reminder_time.split(":").map(Number);
            reminderDate.setHours(hours, minutes, 0, 0);
            updateTimeDisplay(closestEvent, reminderDate, now);
            
            // If showing "NOW", set timer to refresh after 5 minutes
            const timeUntilMs = reminderDate - now;
            if (timeUntilMs <= 0) {
              setNowReminderTime(now.getTime());
            }
          } else {
            setTimeUntilReminder(null);
            setTimeUnitReminder("days");
          }
        } else {
          setClosestReminder(null);
          setTimeUntilReminder(null);
          setTimeUnitReminder("days");
        }
      } catch (error) {
        console.error("Error fetching closest reminder:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClosestReminder();
  }, []);

  // Update countdown timer every 30 seconds to refresh minutes/hours display
  // and check if NOW state should be cleared after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!closestReminder) return;

      const now = new Date();

      // If in "NOW" state, check if 5 minutes have passed
      if (nowReminderTime && now.getTime() - nowReminderTime >= 5 * 60 * 1000) {
        // 5 minutes have passed, refresh to find next reminder
        setNowReminderTime(null);
        setLastReminderId(null);
        
        // Trigger a fresh fetch
        const fetchNextReminder = async () => {
          try {
            const ownerData = JSON.parse(localStorage.getItem("owner"));
            if (!ownerData?.owner_id) return;

            const nowTime = new Date();
            const response = await fetch(
              `${URL_Name}/api/reminder/upcoming?owner_id=${ownerData.owner_id}&days_ahead=90`
            );
            const result = await response.json();

            if (response.ok && result.data && result.data.length > 0) {
              let closestEvent = null;
              let minTimeMs = Infinity;

              for (const reminder of result.data) {
                // Skip completed reminders
                if (reminder.is_completed) {
                  continue;
                }

                const reminderDate = new Date(reminder.reminder_date);
                const [h, m] = reminder.reminder_time.split(":").map(Number);
                reminderDate.setHours(h, m, 0, 0);

                const timeUntilMs = reminderDate - nowTime;

                if (timeUntilMs < -5 * 60 * 1000) {
                  continue;
                }

                if (timeUntilMs < minTimeMs) {
                  minTimeMs = timeUntilMs;
                  closestEvent = reminder;
                }
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
        // Update time display every 30 seconds
        const reminderDate = new Date(closestReminder.reminder_date);
        const [h, m] = closestReminder.reminder_time.split(":").map(Number);
        reminderDate.setHours(h, m, 0, 0);
        updateTimeDisplay(closestReminder, reminderDate, now);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [closestReminder, nowReminderTime]);

  return (
    <Flex direction="column" minH="100vh" p="20px">
      {/* Standardized Header Spacing */}
      <Flex justify="space-between" align="center" pt="20px" pb="20px">
        <Text fontSize="xl" fontFamily="heading" fontWeight="medium" color="Primary.900">
          Welcome, {owner_name}
        </Text>

        <Flex 
          boxSize="50px" 
          borderRadius="full" 
          bg="Primary.200" 
          justify="center" 
          align="center" 
          boxShadow="md" 
          cursor="pointer" 
          overflow="hidden" 
          onClick={() => navigate("/user-profile")}
        >
          {owner_image_url ? (
            <Image src={owner_image_url} boxSize="50px" objectFit="cover" borderRadius="full" />
          ) : (
            <Box color="Primary.800" fontSize="26px">
              <MdPets />
            </Box>
          )}
        </Flex>
      </Flex>

      {/* Standardized Main Gap */}
      <Flex direction="column" gap={5}>
        <Box borderRadius="10px" bg="Primary.200" p="12px" boxShadow="md">
          <Flex justify="space-between" align="center" mb="10px">
            <Flex align="center" gap={2}>
              <Box color="Primary.900">
                <MdAccessTime size="20px" />
              </Box>
              <Text color="Primary.900" fontWeight="medium" fontSize="lg" fontFamily="heading">
                Reminder
              </Text>
            </Flex>
            <Box color="Primary.900" cursor="pointer" onClick={() => navigate("/calendar")}>
              <MdChevronRight size="24px" />
            </Box>
          </Flex>

          <Box bg="Primary.100" borderRadius="10px" p="20px" textAlign="center">
            {isLoading ? (
              <Text color="Primary.900" fontFamily="heading" fontSize="md" fontWeight="regular">
                Loading...
              </Text>
            ) : !closestReminder ? (
              <Text color="Primary.900" fontFamily="heading" fontSize="md" fontWeight="regular">
                No recent activity
              </Text>
            ) : (
              <>
                {closestReminder.reminder_category && (
                  <Box display="inline-block" px="12px" py="4px" borderRadius="8px" border="1px" borderColor="Primary.800" mb="10px" fontSize="sm">
                    {closestReminder.reminder_category}
                  </Box>
                )}

                <Text fontSize="lg" fontWeight="medium" color="Primary.900" fontFamily="body">
                  {closestReminder.reminder_title}
                </Text>

                <Flex justify="center" align="center" gap={1} mt="8px" mb="8px">
                  <MdAccessTime size={16} color="var(--chakra-colors-Primary-800)" />
                  <Text fontSize="md" color="Primary.800" fontFamily="body">
                    {closestReminder.reminder_time.slice(0, 5)}
                  </Text>
                </Flex>

                <Text fontSize="md" color="Primary.900" fontFamily="body">
                  {timeUnitReminder === "NOW" ? "" : "In"}
                </Text>

                {timeUntilReminder === "NOW" ? (
                  <Text fontSize="xl" fontWeight="bold" color="Primary.900" animation="pulse 1s infinite">
                    NOW
                  </Text>
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
            <Box color="Primary.900">
              <MdBolt size="20px" />
            </Box>
            <Text color="Primary.900" fontWeight="medium" fontSize="lg" fontFamily="heading">
              Quick Action
            </Text>
          </Flex>

          <Flex gap={4} bg="Primary.100" p="15px" borderRadius="12px">
            <Flex 
              direction="column" 
              align="center" 
              flex="1" 
              bg="Neutral.100" 
              borderRadius="10px" 
              p="15px" 
              textAlign="center" 
              boxShadow="md" 
              cursor="pointer" 
              onClick={() => navigate("/quick-notes")}
            >
              <Box color="Primary.800">
                <MdAdd size={30} />
              </Box>
              <Text mt="5px" color="Primary.800" fontFamily="heading" fontSize="lg">
                Add Notes
              </Text>
            </Flex>

            <Flex 
              direction="column" 
              align="center" 
              flex="1" 
              bg="Neutral.100" 
              borderRadius="10px" 
              p="15px" 
              textAlign="center" 
              boxShadow="md" 
              cursor="pointer" 
              onClick={() => navigate("/vet")}
            >
              <Box color="Primary.800">
                <MdPets size={30} />
              </Box>
              <Text mt="5px" color="Primary.800" fontFamily="heading" fontSize="lg">
                Find Vet
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}