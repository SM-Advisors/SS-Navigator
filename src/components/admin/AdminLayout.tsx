import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'react-router-dom';
import { Database, FlaskConical, BarChart3, GitCompare, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { label: 'Knowledge Base', href: '/admin/knowledge-base', icon: Database },
  { label: 'RAG Test Console', href: '/admin/rag-test', icon: FlaskConical },
  { label: 'Eval Harness', href: '/admin/eval', icon: BarChart3 },
  { label: 'Run Comparison', href: '/admin/eval/compare', icon: GitCompare },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">SS Navigator Admin</span>
          <Badge variant="outline" className="text-xs">Beta</Badge>
          <Separator orientation="vertical" className="h-4 mx-2" />
          <nav className="flex gap-1">
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button variant={active ? 'default' : 'ghost'} size="sm" className="gap-1.5 text-xs">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
