import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Truck,
  CreditCard,
  CheckCircle2,
  Printer,
  Download,
  CheckSquare,
  Square,
  ShoppingBag,
  Eye,
  PackageCheck,
  Trash2
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatPHP, statusColors, exportToCSV, getImageUrl } from '../utils';

interface OrdersViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onBulkUpdateStatus: (orderIds: string[], status: OrderStatus) => void;
  onOpenPrintWaybillModal: (order: Order) => void;
  onOpenStoreModal: () => void;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  onDeleteOrder: (orderId: string) => Promise<void>; // ✅ IDAGDAG ITO
}

const statusTabs: Array<{ id: 'all' | 'ordered'; label: string; icon: any }> = [
  { id: 'all', label: 'All Orders', icon: Package },
  { id: 'ordered', label: '📦 Completed / Cancelled', icon: PackageCheck }
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  onSelectOrder,
  onUpdateStatus,
  onBulkUpdateStatus,
  onOpenPrintWaybillModal,
  onOpenStoreModal,
  searchFilter = '',
  setSearchFilter,
  onDeleteOrder // ✅ IDAGDAG ITO
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'ordered'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatusToApply, setBulkStatusToApply] = useState<OrderStatus>('To Ship');

  // ✅ FILTERED ORDERS - para sa table display
  const filteredOrders = useMemo(() => {
    const safeOrders = orders || [];
    
    let filtered = safeOrders.filter(order => {
      if (!order) return false;
      
      if (selectedStatusTab === 'all') {
        return order.status !== 'Cancelled' && order.status !== 'Completed';
      }
      
      if (selectedStatusTab === 'ordered') {
        return order.status === 'Completed' || order.status === 'Cancelled';
      }
      
      return true;
    });

    if (selectedChannel !== 'all') {
      filtered = filtered.filter(order => order.channel === selectedChannel);
    }

    if (selectedPayment !== 'all') {
      filtered = filtered.filter(order => 
        order.payment?.method?.toLowerCase().includes(selectedPayment.toLowerCase())
      );
    }

    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter(order => {
        const matchesId = order.orderId?.toLowerCase().includes(query) || false;
        const matchesName = order.customer?.name?.toLowerCase().includes(query) || false;
        const matchesPhone = order.customer?.phone?.toLowerCase().includes(query) || false;
        const matchesTracking = order.fulfillment?.trackingNumber?.toLowerCase().includes(query) || false;
        const matchesItems = (order.items || []).some(
          i => i?.name?.toLowerCase().includes(query) || i?.sku?.toLowerCase().includes(query)
        );
        return matchesId || matchesName || matchesPhone || matchesTracking || matchesItems;
      });
    }

    return filtered;
  }, [orders, selectedStatusTab, selectedChannel, selectedPayment, searchFilter]);

  // ✅ COUNTS - GAMIT ANG ORIGINAL ORDERS, HINDI FILTERED
  const safeOrders = orders || [];
  const totalOrders = safeOrders.length;
  const activeOrders = safeOrders.filter(o => o?.status !== 'Cancelled' && o?.status !== 'Completed').length;
  const completedOrders = safeOrders.filter(o => o?.status === 'Completed').length;
  const cancelledOrders = safeOrders.filter(o => o?.status === 'Cancelled').length;
  const orderedCount = completedOrders + cancelledOrders;
  const isOrderedTab = selectedStatusTab === 'ordered';

  const handleToggleSelectAll = () => {
    if (selectedStatusTab === 'ordered') return;
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o?.orderId).filter(Boolean));
    }
  };

  const handleToggleOrderSelect = (orderId: string) => {
    if (selectedStatusTab === 'ordered') return;
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleExecuteBulkUpdate = () => {
    if (selectedOrderIds.length === 0) return;
    onBulkUpdateStatus(selectedOrderIds, bulkStatusToApply);
    setSelectedOrderIds([]);
  };

  const handleExportCSV = () => {
    const rows = filteredOrders.map(o => ({
      'Order ID': o?.orderId || 'N/A',
      Date: o?.date || 'N/A',
      Customer: o?.customer?.name || 'N/A',
      Email: o?.customer?.email || 'N/A',
      Phone: o?.customer?.phone || 'N/A',
      City: o?.customer?.city || 'N/A',
      Channel: o?.channel || 'N/A',
      Items: (o?.items || []).map(i => `${i?.name || 'Unknown'} (x${i?.qty || 0})`).join('; '),
      Subtotal: o?.subtotal || 0,
      Shipping: o?.shipping || 0,
      Discount: o?.discount || 0,
      Total: o?.total || 0,
      PaymentMethod: o?.payment?.method || 'N/A',
      PaymentStatus: o?.payment?.status || 'N/A',
      TransactionID: o?.payment?.transactionId || 'N/A',
      OrderStatus: o?.status || 'N/A',
      Carrier: o?.fulfillment?.carrier || 'N/A',
      TrackingNumber: o?.fulfillment?.trackingNumber || 'N/A'
    }));
    exportToCSV(`CHUB_Orders_${new Date().toISOString().split('T')[0]}`, rows);
  };

  // ✅ HANDLE DELETE - PERMANENT DELETE, WALANG CONFIRMATION
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await onDeleteOrder(orderId);
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Omnichannel Orders & Fulfillment</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-stage order lifecycle, generate courier waybills, and track end-to-end customer delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenStoreModal}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Test New Order</span>
          </button>
        </div>
      </div>

      {/* Admin Status Tabs */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {statusTabs.map(tab => {
            const Icon = tab.icon;
            // ✅ TAMA NA ANG COUNT - GAMIT ANG ORIGINAL ORDERS
            const count = tab.id === 'all' ? activeOrders : orderedCount;
            const isActive = selectedStatusTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      {!isOrderedTab && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, name, tracking..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sales Channel Filter */}
            <div>
              <select
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">All Sales Channels</option>
                <option value="Online Store">Online Store</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Shopee">Shopee</option>
                <option value="Lazada">Lazada</option>
                <option value="In-Store POS">In-Store POS</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={selectedPayment}
                onChange={e => setSelectedPayment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">All Payment Gateways</option>
                <option value="GCash">GCash</option>
                <option value="Maya">Maya</option>
                <option value="Card">Cards (Visa/Mastercard)</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Billease">Billease BNPL</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 font-semibold px-2">
              <span>Showing {filteredOrders.length} of {totalOrders} orders</span>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedOrderIds.length > 0 && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {selectedOrderIds.length} order(s) selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bulkStatusToApply}
                  onChange={e => setBulkStatusToApply(e.target.value as OrderStatus)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="Pending">Move to: Pending</option>
                  <option value="To Ship">Move to: To Ship</option>
                  <option value="Shipped">Move to: Shipped</option>
                  <option value="Out for Delivery">Move to: Out for Delivery</option>
                  <option value="Delivered">Move to: Delivered</option>
                  <option value="To Review">Move to: To Review</option>
                  <option value="Completed">Move to: Completed</option>
                  <option value="Refunded">Move to: Refunded</option>
                  <option value="Returned">Move to: Returned</option>
                  <option value="Cancelled">Move to: Cancelled</option>
                </select>

                <button
                  onClick={handleExecuteBulkUpdate}
                  className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm"
                >
                  Apply Bulk Update
                </button>

                <button
                  onClick={() => setSelectedOrderIds([])}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                {!isOrderedTab && (
                  <th className="px-3 py-2.5 w-8">
                    <button onClick={handleToggleSelectAll} className="flex items-center">
                      {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-3 py-2.5">Order ID & Date</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Items & SKUs</th>
                <th className="px-3 py-2.5">Total & Payment</th>
                <th className="px-3 py-2.5">Carrier & Tracking</th>
                <th className="px-3 py-2.5">Status</th>
                {!isOrderedTab && (
                  <th className="px-3 py-2.5 text-right">Quick Action</th>
                )}
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={isOrderedTab ? 8 : 9} className="px-6 py-16 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No orders found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isOrderedTab 
                        ? 'No completed or cancelled orders yet.' 
                        : 'All active orders are displayed here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  if (!order) return null;
                  
                  const isSelected = selectedOrderIds.includes(order.orderId);
                  const statusConfig = statusColors[order.status] || statusColors['To Ship'];

                  return (
                    <tr
                      key={order.orderId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {!isOrderedTab && (
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => handleToggleOrderSelect(order.orderId)}
                            className="flex items-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Order ID & Date */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-1">
                          {isOrderedTab ? (
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                              #{order.orderId}
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="font-mono font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group"
                            >
                              <span>#{order.orderId}</span>
                              <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                              {order.channel || 'N/A'}
                            </span>
                            <span className="text-[9px] text-slate-400">{order.date || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {order.customer?.name || 'Unknown'}
                            </span>
                            {order.customer?.tier === 'VIP' && (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 break-words max-w-[120px]">
                            {order.customer?.city || 'N/A'} • {order.customer?.phone || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Items with Product Images */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 shrink-0">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx}
                                className="w-6 h-6 rounded-md overflow-hidden border-2 border-white dark:border-slate-900 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                              >
                                {item?.image ? (
                                  <img
                                    src={item.image}  // ✅ Directly use item.image (already has full URL from server)
                                    alt={item?.name || 'Item'}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback image
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                ) : (
                                  <Package className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                            ))}
                            {(order.items || []).length > 3 && (
                              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-900 shadow-sm">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 break-words max-w-[120px]">
                              {order.items?.[0]?.name || 'No items'}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {(order.items || []).length} item(s) • Qty: {(order.items || []).reduce((s, i) => s + (i?.qty || 0), 0)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 dark:text-white block">
                            {formatPHP(order.total || 0)}
                          </span>
                          <div className="flex flex-wrap items-center gap-1 text-[9px]">
                            <span className="text-slate-500">{order.payment?.method || 'N/A'}</span>
                            <span
                              className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                                order.payment?.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {order.payment?.status || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-500" />
                            {order.fulfillment?.carrier || 'N/A'}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 block break-words max-w-[100px]">
                            {order.fulfillment?.trackingNumber || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.badgeBg}`} />
                          {order.status || 'Unknown'}
                        </span>
                      </td>

                      {/* Quick Action */}
                      {!isOrderedTab && (
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <select
                              value={order.status || 'To Ship'}
                              onChange={e => onUpdateStatus(order.orderId, e.target.value as OrderStatus)}
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="To Ship">To Ship</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="To Review">To Review</option>
                              <option value="Completed">Completed</option>
                              <option value="Refund Requested">Refund Requested</option>
                              <option value="Refunded">Refunded</option>
                              <option value="Return Requested">Return Requested</option>
                              <option value="Returned">Returned</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                              onClick={() => onSelectOrder(order)}
                              className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold rounded-md transition-colors text-[10px]"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Delete Button - Walang confirmation */}
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.orderId)}
                          className="p-1.5 rounded-md text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-900/50 hover:border-red-500 transition-all duration-150"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};