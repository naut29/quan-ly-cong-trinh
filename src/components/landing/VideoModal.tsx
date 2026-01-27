import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  videoSrc: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ open, onOpenChange, title, videoSrc }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <video
              src={videoSrc}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
