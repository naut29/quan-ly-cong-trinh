import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAppBasePath } from '@/lib/appMode';
import { useSession } from '@/app/session/useSession';
import { useCompany } from '@/app/context/CompanyContext';
import { createSupabaseRepo } from '@/data/supabaseRepo';
import type { Project } from '@/data/repo';
import { signOut } from '@/auth/supabaseAuth';

const AppTopbarApp: React.FC = () => {
  const { user } = useSession();
  const { companyName, role, companyId } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let isActive = true;
    if (!companyId) {
      setProjects([]);
      return;
    }
    const repo = createSupabaseRepo(companyId);
    repo.listProjects()
      .then((data) => {
        if (isActive) setProjects(data);
      })
      .catch(() => {
        if (isActive) setProjects([]);
      });
    return () => {
      isActive = false;
    };
  }, [companyId]);

  const handleLogout = () => {
    signOut();
    navigate(`${basePath}/login`);
  };

  const getInitials = (value: string) => {
    return value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="TÃ¬m kiáº¿m dá»± Ã¡n, váº­t tÆ°, há»£p Ä‘á»“ng..." 
            className="w-80 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-[150px]">
            {companyName || 'Cong ty'}
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 h-9 px-3">
              <span className="text-sm">Chá»n dá»± Ã¡n</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {projects.length}
              </Badge>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="p-3 border-b border-border">
              <Input placeholder="TÃ¬m dá»± Ã¡n..." className="h-8" />
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">KhÃ´ng cÃ³ dá»± Ã¡n nÃ o</p>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}
                    className="w-full p-3 hover:bg-muted/50 flex items-start gap-3 text-left border-b border-border last:border-0 transition-colors"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      project.status === 'active' && "bg-success",
                      project.status === 'paused' && "bg-warning",
                      project.status === 'completed' && "bg-muted-foreground",
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.email ? getInitials(user.email) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {role ?? ''}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{user?.email}</p>
                <p className="text-xs font-normal text-muted-foreground">{companyName}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              ThÃ´ng tin cÃ¡ nhÃ¢n
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              CÃ i Ä‘áº·t
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              ÄÄƒng xuáº¥t
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppTopbarApp;
