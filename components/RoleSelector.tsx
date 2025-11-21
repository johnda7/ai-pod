import React from 'react';
import { UserRole } from '../types';
import { Users, Baby, School } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl mx-4 mt-2 mb-4">
      {[
        { role: UserRole.TEEN, label: 'Подросток', icon: Baby },
        { role: UserRole.PARENT, label: 'Родитель', icon: Users },
        { role: UserRole.CURATOR, label: 'Куратор', icon: School },
      ].map((item) => {
        const isActive = currentRole === item.role;
        const Icon = item.icon;
        return (
          <button
            key={item.role}
            onClick={() => onRoleChange(item.role)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={14} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};