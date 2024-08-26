"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
const ManageProfile = () => {
  const router = useRouter();

  useEffect(() => {
    // Function to handle the redirection logic
    const redirectToProfile = async () => {
      router.push("/profile/manageUsername");
    };

    redirectToProfile();
  }, [router]);

  return null; // This component does not render anything
};

export default ManageProfile;
