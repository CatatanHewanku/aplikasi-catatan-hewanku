import { Flex, Box, Text } from "@chakra-ui/react";
import { MdHome, MdPets, MdLocalHospital, MdCalendarMonth} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { label: "Home", icon: MdHome, path: "/" },
  { label: "MyPet", icon: MdPets, path: "/mypet" },
  { label: "Vet", icon: MdLocalHospital, path: "/vet" },
  { label: "Calendar", icon: MdCalendarMonth, path: "/calendar" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.includes("/medication-form")) {
    return null;
  }

  return (
    <Flex position="fixed" bottom="20px" left="0" right="0" justify="center" px="20px" zIndex="1000" pointerEvents="none" opacity={0.7}>
            <Box pointerEvents="auto" w="100%" maxW="400px" h="70px" borderRadius="35px" bg="Neutral.100" border="1px" borderColor="Primary.900" backdropFilter="blur(10px)" boxShadow="lg" px={4}>
        <Flex h="100%" align="center" justify="space-between" >
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Flex key={i} direction="column" align="center" justify="center" flex="1" gap="4px" cursor="pointer" onClick={() => navigate(item.path)}>
                <Box w="36px" h="36px" display="flex" alignItems ="center" justifyContent="center" borderRadius="full" bg={active ? "Primary.900" : "transparent"} transition="0.2s" _hover={{ transform: "scale(1.08)" }}>
                  <Icon size={20} color={active ? "white" : "#9c5b2e"} />
                </Box>

                <Text
                  fontSize="xs"
                  color={active ? "Primary.900" : "Primary.800"}
                >
                  {item.label}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Box>
    </Flex>
  );
}