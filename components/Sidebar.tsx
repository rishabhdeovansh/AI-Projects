
import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Logo } from './icons/Logo';
import { DashboardIcon, StudentsIcon, FeesIcon, SettingsIcon } from './icons/NavIcons';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: Dispatch<SetStateAction<Page>>;
}

const NavItem: React.FC<{
  icon: JSX.Element;
  label: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-text-secondary transition-colors duration-200 ${
        isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-card hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { icon: <DashboardIcon />, label: Page.DASHBOARD },
    { icon: <StudentsIcon />, label: Page.STUDENTS },
    { icon: <FeesIcon />, label: Page.FEES },
    { icon: <SettingsIcon />, label: Page.SETTINGS },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar p-4 flex flex-col">
      <div className="px-2 pt-2 pb-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-2">
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.label}
              onClick={() => setActivePage(item.label)}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 text-center text-xs text-gray-500">
        <p>&copy; 2024 CoachERP</p>
        <p>All rights reserved.</p>
      </div>
    </aside>
  );
};
