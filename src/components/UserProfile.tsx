import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"; // Assuming you have these components
import router, { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import axios from "axios";
import { useAuth } from '../context/AuthContext'; // Import your Auth context or state management

export default function UserProfile() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth(); // Use context or state management to update auth status
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    disconnectUser();
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAuthenticated(false); // Update auth status
    router.push("/");
  };

  const handleAdmin = () => {
    router.push("/admin");
  };

  const disconnectUser = async () => {
    const cookies = parseCookies();
    const token = cookies.access_token;
    if (!token) throw new Error("No token found");
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userid = decodedToken.id;
    try {
      await axios.delete(`http://localhost:8080/active/${userid}`, {
        data: { userId: userid.toString() },
      });
    } catch (error) {
      console.error("Failed to disconnect user (but works):", error);
    }
  };

  return (
    <div className="relative">
      <Avatar onClick={handleAvatarClick} className="cursor-pointer">
        <AvatarImage alt="User" />
        <AvatarFallback>MS</AvatarFallback>
      </Avatar>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <button 
            onClick={handleLogout} 
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            Disconnect
          </button>
          <button 
            onClick={handleAdmin} 
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            Admin
          </button>
        </div>
      )}
    </div>
  );
}
