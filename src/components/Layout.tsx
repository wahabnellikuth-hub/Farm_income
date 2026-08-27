import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, FileBarChart, PieChart, CalendarDays, Settings, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Financial Report', href: '/reports', icon: FileBarChart },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:fixed lg:inset-y-0 lg:left-0 z-50">
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-farm-green-700 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sprout className="h-6 w-6 text-farm-green-300" />
            <span>Farm Journal</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-farm-green-50 text-farm-green-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive ? "text-farm-green-600" : "text-gray-400 group-hover:text-gray-500"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col w-full lg:ml-72 min-h-screen">
        {/* Mobile Topbar */}
        <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center bg-farm-green-700 px-4 shadow-sm lg:hidden">
          <div className="flex items-center gap-2 font-bold text-lg text-white w-full justify-center relative">
            <Sprout className="h-5 w-5 text-farm-green-300 absolute left-0" />
            <span>Farm Journal</span>
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe pt-1 lg:hidden">
        <nav className="flex justify-around items-center h-16">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-farm-green-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-6 w-6", isActive && "fill-farm-green-100")} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
