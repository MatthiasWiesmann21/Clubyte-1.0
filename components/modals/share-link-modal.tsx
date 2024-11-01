"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/check-language";
import { usePathname } from "next/navigation";

export const ShareLinkModal = ({ id }: { id: string | number }) => {
  const { isOpen, onClose, type, data } = useModal();
  const currentLanguage = useLanguage();
  const isModalOpen = isOpen && type === "invite";
  const pathname = usePathname();

  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}${pathname}/${id}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent className="overflow-hidden p-0">
        <AlertDialogHeader className="px-6 pt-8">
          <AlertDialogTitle className="text-center text-2xl font-bold">
            {currentLanguage.chat_modal_invite_title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="p-6">
          <Label className="text-xs font-bold uppercase">
            {currentLanguage.chat_modal_invite_link_label}
          </Label>
          <div className="mt-2 flex items-center gap-x-2">
            <Input
              disabled={true}
              className="ring-offset-0"
              value={inviteUrl}
              readOnly
            />
            <Button disabled={true} onClick={onCopy} size="icon">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <AlertDialogFooter className="px-6 py-4">
          <AlertDialogCancel>
            {currentLanguage.descriptionModal_DialogCancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
