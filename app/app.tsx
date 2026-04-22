import NavbarBottom from "@/components/navigation/NavbarBottom";
import { View, Text } from "react-native";

export default function App() {
  return (
    <View className="flex-1 bg-gray-100">
      
      {/* Contenu principal */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold">
          Mon App de Notes
        </Text>
      </View>

      {/* Navbar */}
      <NavbarBottom active="home" />
      
    </View>
  );
}