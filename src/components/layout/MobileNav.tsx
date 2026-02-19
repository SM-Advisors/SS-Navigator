import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Sparkles, Users, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/resources', icon: BookOpen, label: 'Resources' },
  { to: '/sherpa', icon: Sparkles, label: 'Hope AI' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/contact', icon: Phone, label: 'Contact' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
              isActive ? 'text-ss-navy font-semibold' : 'text-gray-500 hover:text-ss-navy'
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
