import { useEffect, useState, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/contexts/AuthContext';
import { TOUR_STEPS } from './TourSteps';

export default function GuidedTour() {
  const { profile, updateProfile } = useAuth();
  const [run, setRun] = useState(false);
  const [steps] = useState<Step[]>(TOUR_STEPS);

  // Auto-start for new users who chose to take the tour
  useEffect(() => {
    if (profile && profile.onboarding_completed && !profile.tour_completed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Listen for replay event
  const handleRestartTour = useCallback(() => {
    setRun(true);
  }, []);

  useEffect(() => {
    window.addEventListener('restart-tour', handleRestartTour);
    return () => window.removeEventListener('restart-tour', handleRestartTour);
  }, [handleRestartTour]);

  const handleJoyrideCallback = useCallback(
    async (data: CallBackProps) => {
      const { status } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        if (profile && !profile.tour_completed) {
          await updateProfile({ tour_completed: true });
        }
      }
    },
    [profile, updateProfile]
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10233B',
          textColor: '#1D1C1C',
          backgroundColor: '#FFFFFF',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: '#FFFFFF',
          zIndex: 9999,
        },
        buttonNext: {
          backgroundColor: '#10233B',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 600,
        },
        buttonBack: {
          color: '#10233B',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#6B7280',
          fontSize: '13px',
        },
        tooltip: {
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '320px',
        },
        tooltipTitle: {
          color: '#10233B',
          fontSize: '15px',
          fontWeight: 700,
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#374151',
          padding: '0',
        },
        spotlight: {
          borderRadius: '8px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done!',
        next: 'Next',
        open: 'Open',
        skip: 'Skip tour',
      }}
    />
  );
}
