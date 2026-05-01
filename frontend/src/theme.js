import { color, extendTheme } from "@chakra-ui/react";

const theme=extendTheme({
    colors:{
        Primary:{
        100: "#FFF4E5",
        200: "#FCE8CF",
        300: "#FFDCB1",
        400: "#F9C788",
        500: "#F5B769",
        600: "#F5A574",
        700: "#E99969",
        800: "#C56E39",
        900: "#A7633D",
        },
        Neutral: {
        100: "#FFFFFF",
        200: "#000000",
        },
    },
    fonts: {
        "title": "Aclonica",
        "heading": "Inter",
        "body": "Inter",
    },
    fontSizes: {
        "sm": "12px",
        "md": "14px",
        "lg": "16px",
        "xl": "24px",
        "2xl": "32px",
        "3xl": "40px",
    },
    fontWeight: {
        "regular":"200",
        "medium": "400",
        "semibold": "600",
        "bold": "800",
    },
})
export default theme