import { Outlet } from 'react-router-dom';
import CrisisBanner from './CrisisBanner';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SessionWarningDialog from './SessionWarningDialog';

export default function AppLayout() {
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
    </div>
  );
}
