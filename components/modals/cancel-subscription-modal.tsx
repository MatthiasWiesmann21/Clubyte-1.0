"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useLanguage } from "@/lib/check-language";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const CancelSubscriptionModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const currentLanguage = useLanguage();

  const isModalOpen = isOpen && type === "cancelSubscription";

  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = "support@clubyte.live";

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    if (value !== "others") {
      setOtherReason("");
    }
  };

  const handleOtherReasonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReason(event.target.value);
  };

  // Handle form submission directly from the button click
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const reason = selectedReason === "others" ? otherReason : selectedReason;

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason }),
      });

      if (response.ok) {
        alert("Cancellation email sent successfully.");
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("Error processing cancellation:", error);
      alert("An error occurred while processing your cancellation request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setOtherReason("");
    onClose();
  };

  const reasons = [
    { value: "tooExpensive", label: `${currentLanguage.cancelSubscription_options_tooExpensive}` },
    { value: "noLongerNeeded", label: `${currentLanguage.cancelSubscription_options_noLongerNeeded}` },
    { value: "switchingCompetitor", label: `${currentLanguage.cancelSubscription_options_switchingCompetitor}` },
    { value: "others", label: `${currentLanguage.cancelSubscription_options_otherReason}` },
  ];

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center text-2xl">{currentLanguage.cancelSubscription_title}</DialogTitle>
          <DialogDescription>
            {currentLanguage.cancelSubscription_description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup
            onValueChange={handleReasonChange}
            value={selectedReason}
            className="space-y-2"
          >
            {reasons.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value}>{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedReason === "others" && (
            <div className="space-y-2">
              <Label htmlFor="otherReason">{currentLanguage.cancelSubscription_label_pleaseSpecifiy}</Label>
              <Textarea
                id="otherReason"
                value={otherReason}
                onChange={handleOtherReasonChange}
                placeholder="Enter your reason"
                className="min-h-[100px]"
              />
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
            >
              {currentLanguage.cancelSubscription_cancel}
            </Button>
            <Button
              type="button"  // Change the button type to "button"
              disabled={isSubmitting}
              className={cn(
                "bg-red-600 text-white hover:bg-red-700",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSubmit} // OnClick for form submission
            >
              {isSubmitting
                ? currentLanguage.cancelSubscription_submitting
                : currentLanguage.cancelSubscription_submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
