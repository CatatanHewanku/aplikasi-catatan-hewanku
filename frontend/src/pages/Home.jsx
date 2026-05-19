import { Flex, Box, Text, Button, Image } from "@chakra-ui/react";
import { MdAccessTime, MdChevronRight, MdBolt, MdAdd, MdPets } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const getEvents = () => {
  const data = localStorage.getItem("events");
  return data ? JSON.parse(data) : {};
};

export default function Home() {
  const navigate = useNavigate();
  const events = getEvents();
  const [owner_name, setOwner_name] = useState("");
  const [owner_image_url, setOwner_image_url] = useState(null);

  useEffect(() => {
    const ownerData = JSON.parse(localStorage.getItem("owner"));
    
    if (ownerData) {
      setOwner_name(ownerData.owner_name || "User");
      setOwner_image_url(ownerData.owner_image_url || null);
    }
  }, []);

  const today = new Date();
  let closestEvent = null;
  let closestDate = null;
  let minDiff = Infinity;

  Object.keys(events).forEach((date) => {
    const eventDate = new Date(date);
    const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
      closestDate = date;
      closestEvent = events[date][0];
    }
  });

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
            {!closestEvent ? (
              <Text color="Primary.900" fontFamily="heading" fontSize="md" fontWeight="regular">
                No recent activity
              </Text>
            ) : (
              <>
                {closestEvent.tag && (
                  <Box display="inline-block" px="12px" py="4px" borderRadius="8px" border="1px" borderColor="Primary.800" mb="10px" fontSize="sm">
                    {closestEvent.tag}
                  </Box>
                )}

                <Text fontSize="lg" fontWeight="medium" color="Primary.900" fontFamily="body">
                  {closestEvent.text}
                </Text>

                <Text fontSize="md" color="Primary.900" fontFamily="body">
                  In
                </Text>

                <Text fontSize="lg" fontWeight="bold" color="Primary.900">
                  {minDiff} Days
                </Text>
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