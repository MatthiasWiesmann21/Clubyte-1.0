"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/check-language";
import { Profile } from "@prisma/client";

interface NewPasswordFormProps {
  profileId: string;
  currentPassword: string;
};

const passwordStrengthSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain a number" });

const formSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old password is required" }),
  newPassword: passwordStrengthSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword !== data.oldPassword, {
  message: "New password must be different from the old password",
  path: ["newPassword"],
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const NewPasswordForm = ({
  profileId,
  currentPassword,
}: NewPasswordFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentLanguage = useLanguage();
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.oldPassword !== currentPassword) {
      toast.error("Old password is incorrect");
      return;
    }

    try {
      await axios.patch(`/api/profile/${profileId}`, { password: values.newPassword });
      toast.success("Password updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-200 dark:bg-slate-700 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {currentLanguage.profile_newPasswordForm_title}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>{currentLanguage.profile_newPasswordForm_cancel}</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {currentLanguage.profile_newPasswordForm_edit}
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className="text-sm mt-2">
          ••••••••
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={currentLanguage.profile_oldPassword_placeholder}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={currentLanguage.profile_newPasswordForm_placeholder}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={currentLanguage.profile_confirmPasswordForm_placeholder}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                onClick={()=>onSubmit(form.getValues())}
              >
                {currentLanguage.profile_newPasswordForm_save}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
