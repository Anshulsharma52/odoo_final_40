import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  ClipboardCheck,
  FileSpreadsheet,
  ShoppingBag,
  PackageCheck,
  Truck,
  Wrench,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Receipt,
  UserCheck,
  PlusCircle,
  QrCode
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';

  const getNavItems = () => {
    switch (role) {
      case 'Sales':
        return [
          { to: '/dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
          { to: '/enquiries', label: 'Customer Enquiries', icon: FileQuestion },
          { to: '/surveys', label: 'Survey Reports', icon: ClipboardCheck },
          { to: '/quotations', label: 'Solar Quotations', icon: FileSpreadsheet },
          { to: '/orders', label: 'Confirmed Orders', icon: ShoppingBag }
        ];

      case 'Technician':
      case 'Field Technician':
      case 'Survey Technician':
      case 'Installation Technician':
        return [
          { to: '/dashboard', label: 'Technician Dashboard', icon: LayoutDashboard },
          { to: '/surveys', label: 'Site Surveys', icon: ClipboardCheck },
          { to: '/installations', label: 'Installation Jobs', icon: Wrench },
          { to: '/enquiries', label: 'Customer Leads', icon: FileQuestion },
          { to: '/orders', label: 'Order Specs & BOM', icon: ShoppingBag }
        ];

      case 'Warehouse':
        return [
          { to: '/dashboard', label: 'Warehouse Dashboard', icon: LayoutDashboard },
          { to: '/inventory', label: 'Products & Inventory', icon: PackageCheck },
          { to: '/dispatches', label: 'Dispatch Orders', icon: Truck },
          { to: '/orders', label: 'Order BOM Lists', icon: ShoppingBag }
        ];

      case 'Service & Support':
        return [
          { to: '/dashboard', label: 'Service Dashboard', icon: LayoutDashboard },
          { to: '/service-tickets', label: 'Service Tickets', icon: Headphones },
          { to: '/warranties', label: 'Verify Serial Warranty', icon: ShieldCheck }
        ];

      case 'Customer':
        return [
          { to: '/dashboard', label: 'Customer Portal', icon: LayoutDashboard },
          { to: '/enquiries/new', label: 'Submit Solar Enquiry', icon: PlusCircle },
          { to: '/quotations', label: 'My Quotations', icon: FileSpreadsheet },
          { to: '/orders', label: 'Order & Installation', icon: ShoppingBag },
          { to: '/warranties', label: 'Warranty Certificates', icon: ShieldCheck },
          { to: '/payments', label: 'Invoices & Payments', icon: Receipt },
          { to: '/service-tickets', label: 'Raise Service Ticket', icon: Headphones }
        ];

      case 'Director':
      case 'Admin':
      default:
        return [
          { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
          { to: '/users', label: 'Users & Roles Admin', icon: Users },
          { to: '/director', label: 'Director P&L Analytics', icon: TrendingUp },
          { to: '/enquiries', label: 'Enquiries', icon: FileQuestion },
          { to: '/surveys', label: 'Site Surveys', icon: ClipboardCheck },
          { to: '/quotations', label: 'Quotations', icon: FileSpreadsheet },
          { to: '/orders', label: 'Orders & BOM', icon: ShoppingBag },
          { to: '/inventory', label: 'Warehouse & Stock', icon: PackageCheck },
          { to: '/dispatches', label: 'Dispatches', icon: Truck },
          { to: '/installations', label: 'Installations', icon: Wrench },
          { to: '/warranties', label: 'Warranties', icon: ShieldCheck },
          { to: '/service-tickets', label: 'Service & Support', icon: Headphones },
          { to: '/payments', label: 'Payments & Invoices', icon: Receipt }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col pt-14 lg:pt-0`}
      >
        <div className="p-4 border-b border-slate-100 hidden lg:block">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Active Environment
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800">{role} Workspace</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>SunPower OS v2.4</span>
            <span className="font-mono text-emerald-600 font-semibold">Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
