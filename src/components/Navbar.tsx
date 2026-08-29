import React, { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import {
  Bell,
  RefreshCw,
  ShoppingBag,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { StockAlert, Order } from '../types';

interface NavbarProps {
  isConnected?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenStoreModal?: () => void;
  onOpenNewProductModal?: () => void;
  stockAlerts?: StockAlert[];
  orders?: Order[];
  onSelectTab?: (tab: string) => void;
  onSelectOrder?: (order: Order) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean) => void;
  searchGlobal?: string;
  setSearchGlobal?: (term: string) => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected = true,
  isLoading = false,
  onRefresh = () => {},
  onOpenStoreModal = () => {},
  onOpenNewProductModal = () => {},
  stockAlerts = [],
  orders = [],
  onSelectTab = (_tab: string) => {},
  onSelectOrder = (_order: Order) => {},
  isDarkMode = false,
  onToggleDarkMode = () => {},
  soundEnabled = true,
  setSoundEnabled = (_enabled: boolean) => {},
  searchGlobal = '',
  setSearchGlobal = (_term: string) => {},
  onToggleMobileSidebar = () => {},
  isMobileSidebarOpen = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = (stockAlerts || []).filter(a => a.severity === 'critical');
  const pendingOrders = (orders || []).filter(o => o.status === 'To Ship' || o.status === 'To Pay');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-sm">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Mobile Hamburger Menu Button & Brand */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Hamburger Menu Toggle Button (Visible on mobile & tablet) */}
          <button
            onClick={onToggleMobileSidebar}
            aria-label={isMobileSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shrink-0"
            title="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            )}
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <Box className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  C-HUB
                </span>
                <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider whitespace-nowrap">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="font-medium whitespace-nowrap hidden xs:inline">
                  {isConnected ? 'Real-Time Sync' : 'Connecting...'}
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
                <span className="font-mono text-[10px] hidden md:inline text-slate-400">{currentTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Quick Search (Hidden on small screens, responsive on lg+) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, SKUs, customers..."
              value={searchGlobal}
              onChange={e => setSearchGlobal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchGlobal && (
              <button
                onClick={() => setSearchGlobal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shrink-0"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              soundEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95 shrink-0"
            title="Refresh Server Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Stock Alerts & Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm shrink-0 active:scale-95"
              title="Notifications & Stock Warnings"
              aria-label="Open Notifications"
            >
              <Bell className="w-4 h-4" />
              {criticalAlerts.length + pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {criticalAlerts.length + pendingOrders.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Alerts & Warnings
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {stockAlerts.length} Alerts
                  </span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {stockAlerts.length === 0 && pendingOrders.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      All inventory healthy & no urgent tasks.
                    </div>
                  ) : (
                    <>
                      {criticalAlerts.map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setShowNotifications(false);
                            onSelectTab('alerts');
                          }}
                          className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 border border-red-200 dark:border-red-900/60 cursor-pointer hover:bg-red-100/80 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                              CRITICAL
                            </span>
                            <span className="text-[10px] font-mono text-red-700 dark:text-red-300 font-bold">
                              {alert.currentStock} left
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                            {alert.productName}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="h-1.5 flex-1 bg-red-200 dark:bg-red-900/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-600"
                                style={{ width: `${Math.min(100, Math.max(5, (alert.currentStock / alert.reorderPoint) * 100))}%` }}
                              />
                            </div>
                            <span className="ml-3 text-[10px] font-bold text-red-700 dark:text-red-300 whitespace-nowrap">
                              Est. {alert.estimatedDaysToOut}d left
                            </span>
                          </div>
                        </div>
                      ))}

                      {pendingOrders.slice(0, 3).map(order => (
                        <div
                          key={order.orderId}
                          onClick={() => {
                            setShowNotifications(false);
                            onSelectOrder(order);
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                              #{order.orderId}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                            {order.customer.name} • ₱{order.total.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onSelectTab('alerts');
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All Alerts →
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add SKU Button (Desktop / Tablet) */}
          <button
            onClick={onOpenNewProductModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Add SKU</span>
          </button>

          {/* Store Checkout Sandbox Button */}
          <button
            onClick={onOpenStoreModal}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 shrink-0"
            title="Open Customer Storefront Simulator"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline whitespace-nowrap">Store Simulator</span>
            <span className="xs:hidden">Store</span>
          </button>
        </div>
      </div>
    </header>
  );
};
