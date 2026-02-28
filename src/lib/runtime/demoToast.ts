import { toast } from "@/hooks/use-toast";

export const DEMO_MODE_MESSAGE = "Demo mode - data is not saved.";

export const showDemoModeToast = () =>
  toast({
    title: "Demo mode",
    description: DEMO_MODE_MESSAGE,
  });

export const showDemoBlockedToast = (reason: string) =>
  toast({
    title: "Demo mode",
    description: `${reason}. ${DEMO_MODE_MESSAGE}`,
    variant: "destructive",
  });
