import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="border-t border-border py-8 px-6 bg-background">
    <div className="container mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Quản lý Công trình</span>
        </Link>
        <div className="text-sm text-muted-foreground">
          <span>Email: </span>
          <a
            href="mailto:contact@quanlycongtrinh.com"
            className="text-primary hover:underline"
          >
            contact@quanlycongtrinh.com
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
