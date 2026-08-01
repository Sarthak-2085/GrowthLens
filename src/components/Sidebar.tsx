'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Lightbulb,
  FileBarChart,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeVariant?: 'primary' | 'warning' | 'positive';
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'nav-analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    id: 'nav-insights',
    label: 'Campaign Insights',
    href: '/campaign-insights',
    icon: Lightbulb,
    badge: 'AI',
    badgeVariant: 'warning',
  },
  {
    id: 'nav-upload',
    label: 'Upload Data',
    href: '/upload-data',
    icon: UploadCloud,
  },
  {
    id: 'nav-reports',
    label: 'Reports',
    href: '/reports',
    icon: FileBarChart,
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  currentPath: string;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  currentPath,
}: SidebarProps) {
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col border-r border-border bg-card
          transition-all duration-300 ease-in-out flex-shrink-0
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AppLogo size={32} className="flex-shrink-0" />
            {!collapsed && (
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-gradient-primary text-sm font-bold tracking-tight truncate">
                  GrowthLens
                </span>
                <span className="text-2xs text-muted-foreground truncate">
                  AI Marketing Intelligence
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nav section */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {/* Main nav */}
          <div className="mb-2">
            {!collapsed && (
              <p className="mb-2 px-2 text-2xs font-600 uppercase tracking-widest text-muted-foreground">
                Main
              </p>
            )}
            {navItems.slice(0, 5).map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={isActive(item.href)}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          {/* System nav */}
          <div>
            {!collapsed && (
              <p className="mb-2 px-2 text-2xs font-600 uppercase tracking-widest text-muted-foreground">
                System
              </p>
            )}
            {navItems.slice(5).map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </nav>

        {/* AI Status indicator */}
        {!collapsed && (
          <div className="mx-2 mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                <Zap size={12} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-600 text-foreground">AI Engine</p>
                <p className="text-2xs text-positive truncate">● Active</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs font-500">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card
          transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="text-gradient-primary text-sm font-bold">GrowthLens</span>
          </div>
          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => (
            <NavItemComponent
              key={`mobile-${item.id}`}
              item={item}
              collapsed={false}
              active={isActive(item.href)}
              onClick={onMobileClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}

function NavItemComponent({ item, collapsed, active, onClick }: NavItemComponentProps) {
  const Icon = item.icon;

  const badgeColors = {
    primary: 'bg-primary/20 text-primary',
    warning: 'bg-warning/20 text-warning',
    positive: 'bg-positive/20 text-positive',
  };

  return (
    <div className="relative group">
      <Link
        href={item.href}
        onClick={onClick}
        className={`
          flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-500
          transition-all duration-150
          ${
            active
              ? 'sidebar-item-active'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <Icon size={18} className={`flex-shrink-0 ${active ? 'text-primary' : ''}`} />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <span
            className={`
              rounded-full px-1.5 py-0.5 text-2xs font-600
              ${item.badgeVariant ? badgeColors[item.badgeVariant] : 'bg-muted text-muted-foreground'}
            `}
          >
            {item.badge}
          </span>
        )}
      </Link>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-500 text-foreground shadow-card opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {item.label}
          {item.badge && (
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-2xs font-600 ${item.badgeVariant ? badgeColors[item.badgeVariant] : 'bg-muted text-muted-foreground'}`}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
