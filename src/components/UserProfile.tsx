import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"; // Assuming you have these components
import router, { useRouter } from "next/navigation";

export default function UserProfile() {
const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Remove the access token from cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Redirect to the main route
    router.push("/");
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
        </div>
      )}
    </div>
  );
}
