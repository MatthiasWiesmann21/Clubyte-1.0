import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/sign-in");
  };

  return (
    <button onClick={handleSignOut}>
      Sign out
    </button>
  );
};

export default SignOutButton;
