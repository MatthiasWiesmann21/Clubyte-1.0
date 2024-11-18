"use client";

import { useState } from "react";

const UserList = ({
  initialUsers,
  usergroupId,
}: {
  initialUsers: any[];
  usergroupId: string;
}) => {
  // Local state to manage the list of users
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null); // To track loading status

  // Function to toggle membership status
  const handleToggleMembership = async (userId: string, isMember: boolean) => {
    setLoading(userId); // Indicate loading for the specific user
    try {
      // Optimistically update the UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isMember: !isMember } : user
        )
      );

      // Make the API request to update the user's membership status
      const response = await fetch(`/api/profile/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usergroupId: isMember ? null : usergroupId,
        }),
      });

      if (!response.ok) {
        // Roll back the UI change if the API call fails
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isMember: isMember } : user
          )
        );
        throw new Error("Failed to update membership status");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating membership status");
    } finally {
      setLoading(null); // Reset loading status
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">Users</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className="cursor-pointer p-2"
          onClick={() => handleToggleMembership(user.id, user.isMember)}
        >
          <p>{user.name}</p>
          <span className="text-xs">
            {user.isMember ? "Member of User Group" : "Not a Member"}
          </span>
          {loading === user.id && (
            <span className="text-xs text-gray-500">Updating...</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
