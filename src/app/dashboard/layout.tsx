import React from 'react';
import {
  LayoutDashboard, Calendar, Users, Scissors, Shirt,
  MapPin, PackageSearch, CreditCard, UserCircle, Settings,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sidebar Navigation
const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard', active: true },
  { name: 'Events', icon: Calendar, href: '/dashboard/events', badge: 12 },
  { name: 'Clients', icon: Users, href: '/dashboard/clients' },
];

const serviceItems = [
  { name: 'Alterations', icon: Scissors, href: '/dashboard/alterations', badge: 4 },
  { name: 'Dress Rentals', icon: Shirt, href: '/dashboard/rentals' },
  { name: 'Event Planning', icon: MapPin, href: '/dashboard/planning' },
];

const operationItems = [
  { name: 'Inventory', icon: PackageSearch, href: '/dashboard/inventory' },
  { name: 'Payments', icon: CreditCard, href: '/dashboard/payments', badgeRed: 3 },
  { name: 'Staff', icon: UserCircle, href: '/dashboard/staff' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Current date
  const today = new Date();
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(today);

  return (
    <div className="flex h-screen bg-[#F8F4F0] font-sans">
      {/* Sidebar - Desktop/Tablet */}
      <aside className="hidden sm:flex flex-col w-[210px] sm:w-[56px] lg:w-[210px] bg-[#FDF5F6] border-r border-rose-100 flex-shrink-0">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-rose-100">
          <div className="w-8 h-8 bg-[#C9697A] text-white flex items-center justify-center font-bold text-xl rounded">
            N
          </div>
          <span className="hidden lg:block ml-3 font-serif font-bold text-xl text-[#1C1012]">Novela</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <a key={item.name} href={item.href} className={cn(
              "flex items-center gap-3 h-13 lg:h-10 px-0 lg:px-3 rounded-md touch-manipulation group",
              item.active ? "bg-[#C9697A] text-white" : "text-[#1C1012] hover:bg-rose-50 lg:hover:bg-rose-50/50"
            )}>
              <div className="w-13 h-13 lg:w-auto lg:h-auto flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
                 <item.icon className="w-5 h-5" />
              </div>
              <span className="hidden lg:block flex-1 text-sm font-medium">{item.name}</span>
              {item.badge && <span className="hidden lg:flex items-center justify-center bg-rose-200 text-[#1C1012] text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </a>
          ))}

          <div className="hidden lg:block mt-6 mb-2 px-3 text-xs font-bold tracking-wider text-[#8B7355]">SERVICES</div>
          {serviceItems.map((item) => (
            <a key={item.name} href={item.href} className="flex items-center gap-3 h-13 lg:h-10 px-0 lg:px-3 rounded-md text-[#1C1012] hover:bg-rose-50 touch-manipulation">
              <div className="w-13 h-13 lg:w-auto lg:h-auto flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
                 <item.icon className="w-5 h-5" />
              </div>
              <span className="hidden lg:block flex-1 text-sm font-medium">{item.name}</span>
              {item.badge && <span className="hidden lg:flex items-center justify-center bg-rose-200 text-[#1C1012] text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </a>
          ))}

          <div className="hidden lg:block mt-6 mb-2 px-3 text-xs font-bold tracking-wider text-[#8B7355]">OPERATIONS</div>
          {operationItems.map((item) => (
             <a key={item.name} href={item.href} className="flex items-center gap-3 h-13 lg:h-10 px-0 lg:px-3 rounded-md text-[#1C1012] hover:bg-rose-50 touch-manipulation">
               <div className="w-13 h-13 lg:w-auto lg:h-auto flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
                 <item.icon className="w-5 h-5" />
              </div>
               <span className="hidden lg:block flex-1 text-sm font-medium">{item.name}</span>
               {item.badgeRed && <span className="hidden lg:flex items-center justify-center bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{item.badgeRed}</span>}
             </a>
          ))}
        </div>

        {/* Staff Profile Bottom */}
        <div className="p-3 border-t border-rose-100 mt-auto">
          <div className="flex items-center gap-3 lg:px-3 h-13 lg:h-10 cursor-pointer hover:bg-rose-50 rounded-md touch-manipulation">
            <div className="w-8 h-8 bg-[#8B7355] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mx-auto lg:mx-0">
              IM
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-semibold text-[#1C1012] leading-tight">Isabel M.</span>
              <span className="text-xs text-[#8B7355]">Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 sm:pb-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b bg-white border-rose-100 flex-shrink-0">
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-lg sm:text-xl text-[#1C1012]">Good morning, Isabel</h1>
            <p className="text-xs sm:text-sm text-[#8B7355]">
              {dateStr} • <span className="font-medium text-[#C9697A]">11 appointments today</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 h-13 w-13 sm:w-10 sm:h-10 flex items-center justify-center text-[#1C1012] hover:bg-rose-50 rounded-full touch-manipulation active:scale-[0.97]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="h-13 sm:h-10 px-5 bg-[#C9697A] text-white rounded-md text-base sm:text-sm font-medium hover:brightness-110 active:scale-[0.97] touch-manipulation transition-all flex items-center gap-2">
              <span className="text-xl leading-none -mt-1">+</span> New client
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#F8F4F0] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="flex sm:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-rose-100 z-50 justify-around items-center px-2">
        <a href="/dashboard" className="flex flex-col items-center justify-center w-16 h-13 text-[#C9697A] touch-manipulation">
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Overview</span>
        </a>
        <a href="/dashboard/events" className="flex flex-col items-center justify-center w-16 h-13 text-[#8B7355] touch-manipulation relative">
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Events</span>
          <span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>
        </a>
        <a href="/dashboard/clients" className="flex flex-col items-center justify-center w-16 h-13 text-[#8B7355] touch-manipulation">
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Clients</span>
        </a>
        <a href="/dashboard/inventory" className="flex flex-col items-center justify-center w-16 h-13 text-[#8B7355] touch-manipulation">
          <PackageSearch className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Inventory</span>
        </a>
        <a href="/dashboard/menu" className="flex flex-col items-center justify-center w-16 h-13 text-[#8B7355] touch-manipulation">
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">More</span>
        </a>
      </nav>
    </div>
  );
}
