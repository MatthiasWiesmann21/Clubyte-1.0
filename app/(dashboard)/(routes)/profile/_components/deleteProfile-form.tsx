"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { useIsAdmin } from "@/lib/roleCheck";
import { isOwner } from "@/lib/owner";
import { useLanguage } from "@/lib/check-language";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface deleteProfileFormProps {
  profileId: string;
}

export const DeleteProfileForm = ({
  profileId,
}: deleteProfileFormProps) => {
  const isAdmin = useIsAdmin();
  const currentLanguage = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/profile/${profileId}`);

      toast.success("Profile deleted");
      router.push(`/auth/sign-in`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6 flex rounded-md border justify-between border-red-600 bg-slate-200 p-4 dark:bg-slate-700">
      <div className="flex items-center font-semibold text-lg text-red-600">
        {currentLanguage.user_DeleteProfileForm_title}
      </div>
      <div className="my-4 flex">
      <ConfirmModal dialogActionClass="bg-red-600 mt-2" onConfirm={onDelete}>
        <Button size="sm" variant="destructive" disabled={isLoading}>
          <Trash className="h-5 w-5" />
        </Button>
      </ConfirmModal>
      </div>
    </div>
  );
};
