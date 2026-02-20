import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Users,
  Phone,
  Bookmark,
  User,
  Phone as PhoneIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTACT_PHONE } from '@/lib/constants';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tourId: 'nav-dashboard' },
  { to: '/resources', icon: BookOpen, label: 'Resources', tourId: 'nav-resources' },
  { to: '/resources/saved', icon: Bookmark, label: 'Saved Resources', tourId: 'nav-saved' },
  { to: '/sherpa', icon: Sparkles, label: 'Hope AI Sherpa', tourId: 'nav-sherpa' },
  { to: '/community', icon: Users, label: 'Community', tourId: 'nav-community' },
  { to: '/contact', icon: Phone, label: 'Contact Navigator', tourId: 'nav-contact' },
  { to: '/profile', icon: User, label: 'My Profile', tourId: 'nav-profile' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-ss-navy text-white shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-ss-teal flex items-center justify-center">
            <span className="text-white font-bold text-sm">SS</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">SS Navigator</p>
            <p className="text-white/50 text-xs">Sebastian Strong</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, tourId }) => (
            <li key={to}>
              <NavLink
                to={to}
                data-tour={tourId}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-ss-teal text-ss-navy'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Crisis number at bottom */}
      <div className="px-4 py-4 border-t border-white/10">
        <a
          href="tel:988"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <PhoneIcon className="h-3 w-3" />
          <span>Crisis: Call or text 988</span>
        </a>
        <a
          href={`tel:${CONTACT_PHONE}`}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors mt-1"
        >
          <PhoneIcon className="h-3 w-3" />
          <span>{CONTACT_PHONE}</span>
        </a>
      </div>
    </aside>
  );
}
