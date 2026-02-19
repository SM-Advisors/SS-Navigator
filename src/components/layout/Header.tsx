import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleReplayTour = () => {
    window.dispatchEvent(new CustomEvent('restart-tour'));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.display_name || 'My Account';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
      <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
        <span className="font-bold text-ss-navy text-lg">SS Navigator</span>
      </Link>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <Button
          asChild
          size="sm"
          className="hidden sm:flex bg-ss-gold text-ss-dark hover:bg-ss-gold/90 font-semibold"
          data-tour="contact-navigator"
        >
          <Link to="/contact">Talk to a Navigator</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-ss-navy text-white text-xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm">{displayName}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReplayTour}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay Tour
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
