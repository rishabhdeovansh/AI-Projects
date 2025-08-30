
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
  colorClass: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};
