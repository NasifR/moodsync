"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EmailVerificationModalProps {
  open: boolean;
  onProceed: () => void;
}



export default function EmailVerificationModal({
  open,
  onProceed
}: EmailVerificationModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="rounded-2xl p-6 shadow-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-black font-semibold text-center">
            Verify Your Email
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 text-center mb-4">
          We sent a verification link to your email.  
          Please verify your account before proceeding.
        </p>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={onProceed}
            className="px-6 py-2 text-white bg-purple-600 hover:bg-black hover:shadow-lg hover:shadow-purple-600 rounded-xl transition-all"
          >
            Proceed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
