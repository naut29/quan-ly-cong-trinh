import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">Quan Ly Cong Trinh</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bang gia
          </Link>
          <Link
            to="/demo/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Demo
          </Link>
          <a
            href="mailto:contact@quanlycongtrinh.com"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Lien he
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/app/login">
            <Button variant="ghost">Dang nhap</Button>
          </Link>
          <Link to="/pricing">
            <Button>Xem bang gia</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
