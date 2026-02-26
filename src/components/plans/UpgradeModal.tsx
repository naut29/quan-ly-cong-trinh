import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  reason?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onOpenChange,
  featureName,
  reason,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nang cap goi de tiep tuc</DialogTitle>
          <DialogDescription>
            {featureName
              ? `Tinh nang ${featureName} vuot gioi han goi hien tai.`
              : "Tai khoan da vuot gioi han goi hien tai."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-muted-foreground">
          {reason && <p>{reason}</p>}
          <p>Email : contact@quanlycongtrinh.com</p>
          <p>Dien thoai : 0988097621</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
