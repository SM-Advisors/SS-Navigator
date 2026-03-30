import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CrisisBanner from './CrisisBanner';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SessionWarningDialog from './SessionWarningDialog';
import HopeFAB from '@/components/ai-sherpa/HopeFAB';
import HopeSidePanel from '@/components/ai-sherpa/HopeSidePanel';

export default function AppLayout() {
  const [hopePanelOpen, setHopePanelOpen] = useState(false);
  const location = useLocation();

  // Don't show FAB on the dedicated sherpa page
  const isOnSherpaPage = location.pathname === '/sherpa';

  return (
    <div className="flex flex-col min-h-screen">
      <CrisisBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <Header />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <MobileNav />
      <SessionWarningDialog />
      {!isOnSherpaPage && !hopePanelOpen && (
        <HopeFAB onClick={() => setHopePanelOpen(true)} />
      )}
      <HopeSidePanel open={hopePanelOpen} onClose={() => setHopePanelOpen(false)} />
    </div>
  );
}
