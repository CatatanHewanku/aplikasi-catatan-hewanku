import { Flex, Box, Text } from "@chakra-ui/react";
import { MdHome, MdPets, MdLocalHospital, MdCalendarMonth } from "react-icons/md";

const navbarItems = [
  { label: "Home", icon: MdHome },
  { label: "MyPet", icon: MdPets },
  { label: "Vet", icon: MdLocalHospital },
  { label: "Calendar", icon: MdCalendarMonth },
];

export default function Navbar() {
  return (
    <Flex minH="100vh" align="flex-end" justify="center">
      <Box
        w="335px"
        h="70px"
        borderRadius="35px"
        bg="Neutral.100"
        border="1px"
        borderColor="Primary.900"
        opacity="95%"
        mb={5}
        px={6}
      >
        <Flex h="100%" align="center" justify="space-between">
          {navbarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Flex
                key={index}
                direction="column"
                align="center"
                justify="center"
                flex="1"
                gap="4px"
                color="Primary.900"
              >

                <Box
                  w="24px"
                  h="24px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon size={22} />
                </Box>

                <Text
                  fontSize="lg"
                  lineHeight="1"
                  textAlign="center"
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