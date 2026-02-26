import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  videoSrc: string;
  fallbackText?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({
  open,
  onOpenChange,
  title,
  videoSrc,
  fallbackText,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <video src={videoSrc} controls autoPlay className="h-full w-full object-contain">
              {fallbackText ?? "Your browser does not support video playback."}
            </video>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
