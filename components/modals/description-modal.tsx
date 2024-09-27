"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/check-language";
import { EventPreview } from "../event-preview";
import { DescriptionPreview } from "../description-preview";

interface ConfirmModalProps {
  children: React.ReactNode;
  description: string;
};

export const DescriptionModal = ({
  description,
  children,
}: ConfirmModalProps) => {
  const currentLanguage = useLanguage();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{currentLanguage.descriptionModal_DialogHeader}</AlertDialogTitle>
          <AlertDialogDescription>
          <DescriptionPreview
              value={description}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
        <AlertDialogCancel>{currentLanguage.descriptionModal_DialogCancel}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
