import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  AlertTriangle,
  CreditCard,
  FileBarChart2,
  Users,
  ShoppingBag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingOrdersCount?: number;
  criticalAlertsCount?: number;
  lowStockCount?: number;
  stockAlertsCount?: number;
  onOpenStoreModal?: () => void;
  onOpenStoreCheckout?: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount = 0,
  criticalAlertsCount = 0,
  lowStockCount = 0,
  stockAlertsCount = 0,
  onOpenStoreModal,
  onOpenStoreCheckout,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const handleOpenStore = onOpenStoreModal || onOpenStoreCheckout || (() => {});
  const displayAlertsCount = criticalAlertsCount || stockAlertsCount || 0;

  // Handle ESC key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && setIsMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const menuItems = [
    {
      id: 'dashboard',
      aliases: ['dashboard', 'analytics'],
      label: 'Live Analytics',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'orders',
      aliases: ['orders'],
      label: 'Orders & Pipeline',
      icon: Package,
      badge: pendingOrdersCount > 0 ? { text: `${pendingOrdersCount}`, type: 'warning' } : null
    },
    {
      id: 'inventory',
      aliases: ['inventory'],
      label: 'Multi-Channel Inventory',
      icon: Layers,
      badge: lowStockCount > 0 ? { text: `${lowStockCount}`, type: 'info' } : null
    },
    {
      id: 'alerts',
      aliases: ['alerts'],
      label: 'Stock Alerts & POs',
      icon: AlertTriangle,
      badge: displayAlertsCount > 0 ? { text: `${displayAlertsCount}`, type: 'danger' } : null
    },
    {
      id: 'gateways',
      aliases: ['gateways'],
      label: 'Payment Gateways',
      icon: CreditCard,
      badge: { text: 'Active', type: 'success' }
    },
    {
      id: 'reports',
      aliases: ['reports'],
      label: 'Custom Reports',
      icon: FileBarChart2,
      badge: null
    },
    {
      id: 'reviews',
      aliases: ['reviews', 'customers'],
      label: 'CRM & Reviews',
      icon: Users,
      badge: null
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const isTabActive = (item: typeof menuItems[0]) => {
    return item.aliases.includes(activeTab) || activeTab === item.id;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (Starts below navbar at top-16, z-35, below navbar z-50) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-16 bg-slate-950/60 backdrop-blur-sm z-35 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Component (Flush under navbar at top-16, full remaining viewport height) */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-72 max-w-[85vw]
          h-[calc(100vh-4rem)]
          z-40 lg:z-30
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out
          flex flex-col justify-between
          shadow-2xl lg:shadow-none
          shrink-0
        `}
      >
        {/* Top Section: Mobile Header (Inside drawer) & Navigation items */}
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* Mobile Drawer Header with Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
                <span>C</span>
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Navigation Menu
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Category Label */}
          <div className="hidden lg:flex items-center justify-between px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {!isCollapsed ? <span>Navigation & Hub</span> : <span className="mx-auto">• • •</span>}
            
            {/* Desktop Expand/Collapse Trigger */}
            {setIsCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Nav Items List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = isTabActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 lg:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all
                    ${isCollapsed ? 'lg:justify-center' : 'justify-between'}
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`
                        text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0
                        ${isCollapsed ? 'lg:hidden' : 'inline-block'}
                        ${item.badge.type === 'danger'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                          : item.badge.type === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                          : item.badge.type === 'success'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }
                      `}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Card / Storefront Shortcut */}
        <div className="p-3 lg:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div
            className={`
              p-3.5 rounded-xl bg-white dark:bg-slate-800/80
              border border-slate-200 dark:border-slate-700 shadow-sm
              ${isCollapsed ? 'lg:text-center lg:p-2' : ''}
            `}
          >
            <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
              <span
                className={`text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Multi-Platform Sync</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                Live
              </span>
            </div>

            <p
              className={`text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              Omnichannel auto inventory sync for Web, TikTok, Shopee & Lazada.
            </p>

            <button
              onClick={() => {
                handleOpenStore();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className={`
                mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95
                ${isCollapsed ? 'lg:p-2' : ''}
              `}
              title="Launch Customer Storefront Sandbox"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : ''}>Store Sandbox</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
