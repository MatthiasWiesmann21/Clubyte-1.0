import { getSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ManageProfile = () => {
  const router = useRouter();

  useEffect(() => {
    // Function to handle the redirection logic
    const redirectToProfile = async () => {
      const session = await getSession();

      if (!session) {
        // Redirect to sign in page if not authenticated
        signIn();
      } else {
        // Redirect to profile management page if authenticated
        router.push("/profile/manageUsername");
      }
    };

    redirectToProfile();
  }, [router]);

  return null; // This component does not render anything
};

export default ManageProfile;
