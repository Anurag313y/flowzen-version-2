import { useState, useEffect } from 'react';
import { Shield, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupportSessionStore, SupportSession } from '@/store/supportSessionStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SupportModeBannerProps {
  session: SupportSession;
}

export function SupportModeBanner({ session }: SupportModeBannerProps) {
  const { endSupportSession } = useSupportSessionStore();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(session.expiresAt);
      const diff = expires.getTime() - now.getTime();
      
      if (diff <= 0) {
        handleExit();
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const handleExit = () => {
    endSupportSession(session.id);
    // Close the tab or redirect
    window.close();
    // Fallback if window.close() doesn't work
    window.location.href = '/super-admin/support-access';
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 shadow-lg">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <span className="font-medium">
              Support Mode – Logged in as <strong>{session.clientName}</strong>
            </span>
            <span className="text-amber-100">
              ({session.role === 'admin' ? 'Restaurant Admin' : 'Waiter'})
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-600 px-3 py-1 rounded-full text-sm">
              <Clock className="h-4 w-4" />
              <span>{timeLeft} remaining</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-amber-600 hover:text-white"
              onClick={() => setShowExitDialog(true)}
            >
              <X className="h-4 w-4 mr-1" />
              Exit Support Mode
            </Button>
          </div>
        </div>
      </div>
      
      {/* Spacer to push content down */}
      <div className="h-12" />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Support Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to end the support session for {session.clientName}. 
              This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>
              Exit Support Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
