import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSession } from '@/contexts/SessionContext';

export default function SessionWarningDialog() {
  const { showWarning, extendSession, timeRemaining } = useSession();
  const minutes = Math.floor(timeRemaining / 60_000);
  const seconds = Math.floor((timeRemaining % 60_000) / 1000);

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')} due to inactivity.
            Click below to stay signed in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={extendSession} className="bg-ss-navy hover:bg-ss-navy/90">
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
