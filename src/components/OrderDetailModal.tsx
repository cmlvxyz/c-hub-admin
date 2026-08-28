import React, { useState } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Printer,
  Copy,
  Check,
  CreditCard,
  User,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Plus,
  Send,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus, CarrierName } from '../types';
import { formatPHP, statusColors } from '../utils';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onOpenPrintWaybillModal: (order: Order) => void;
}

const statusOrderList: OrderStatus[] = [
  'To Pay',
  'To Ship',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'To Review',
  'Completed'
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onOpenPrintWaybillModal
}) => {
  const [copied, setCopied] = useState(false);
  const [timelineNote, setTimelineNote] = useState('');
  const [carrier, setCarrier] = useState<CarrierName>(order?.fulfillment?.carrier || 'J&T Express');

  // ✅ If no order, don't render
  if (!order) return null;

  // ✅ Safe access with fallbacks
  const currentStatusConfig = statusColors[order.status] || statusColors['To Ship'];
  const currentStep = currentStatusConfig?.step || 0;

  // ✅ Safe tracking number
  const trackingNumber = order.fulfillment?.trackingNumber || 'N/A';
  const carrierName = order.fulfillment?.carrier || 'N/A';
  const estimatedDelivery = order.fulfillment?.estimatedDelivery || 'N/A';
  const timeline = order.fulfillment?.timeline || [];

  const handleCopyTracking = () => {
    if (trackingNumber && trackingNumber !== 'N/A') {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAdvanceStatus = (nextStatus: OrderStatus) => {
    onUpdateStatus(order.orderId, nextStatus, timelineNote || `Fulfillment milestone reached: ${nextStatus}`);
    setTimelineNote('');
  };

  // ✅ Safe customer data
  const customerName = order.customer?.name || 'N/A';
  const customerPhone = order.customer?.phone || 'N/A';
  const customerEmail = order.customer?.email || 'N/A';
  const customerAddress = order.customer?.address || 'N/A';
  const customerCity = order.customer?.city || 'N/A';
  const customerProvince = order.customer?.province || 'N/A';
  const customerPostal = order.customer?.postalCode || 'N/A';
  const customerTier = order.customer?.tier || 'Standard';

  // ✅ Safe payment data
  const paymentMethod = order.payment?.method || 'N/A';
  const paymentTransactionId = order.payment?.transactionId || 'N/A';
  const paymentFee = order.payment?.fee || 0;
  const paymentStatus = order.payment?.status || 'N/A';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  #{order.orderId || 'N/A'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                  {order.channel || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created: {order.date || 'N/A'} • Last updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintWaybillModal(order)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Thermal AWB Waybill</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Visual 7-Step Progress Stepper */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Fulfillment Progress
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
              >
                Current: {order.status || 'Unknown'}
              </span>
            </div>

            <div className="relative flex items-center justify-between">
              {statusOrderList.map((st, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={st} className="flex flex-col items-center flex-1 relative z-10">
                    <button
                      onClick={() => handleAdvanceStatus(st)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                      title={`Click to switch status to ${st}`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </button>
                    <span
                      className={`text-[9px] sm:text-[10px] mt-1.5 font-medium text-center leading-tight max-w-[60px] truncate ${
                        isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Customer & Delivery Details */}
            <div className="space-y-6">
              {/* Customer Dossier */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Customer & Consignee Info
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {customerName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Tier: {customerTier}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {customerPhone}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {customerEmail}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      {customerAddress}, {customerCity}, {customerProvince} {customerPostal}
                    </span>
                  </p>
                </div>
              </div>

              {/* Courier & Shipping Waybill */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Courier & Tracking Dispatch
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Carrier:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {carrierName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Airway Bill (AWB):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                        {trackingNumber}
                      </span>
                      {trackingNumber !== 'N/A' && (
                        <button
                          onClick={handleCopyTracking}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700"
                          title="Copy tracking number"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Est. Delivery:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {estimatedDelivery}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Settlement Breakdown */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Payment & Gateway Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway Ref:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {paymentTransactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway Fee:</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      ₱{paymentFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>{formatPHP(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Fee:</span>
                      <span>+{formatPHP(order.shipping || 0)}</span>
                    </div>
                    {(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount ({order.discountCode || 'N/A'}):</span>
                        <span>-{formatPHP(order.discount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                      <span>Total Amount:</span>
                      <span>{formatPHP(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items & Milestone Timeline */}
            <div className="space-y-6">
              {/* Order Items List */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Order Items ({order.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {(order.items || []).map((item, idx) => (
                    <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image || ''}
                          alt={item.name || 'Item'}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="44" height="44"%3E%3Crect width="44" height="44" fill="%23e2e8f0"/%3E%3Ctext x="22" y="22" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3ENo%20Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.name || 'Unknown Item'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            SKU: {item.sku || 'N/A'} {item.size && `• Size: ${item.size}`}{' '}
                            {item.color && `• Color: ${item.color}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatPHP((item.price || 0) * (item.qty || 0))}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatPHP(item.price || 0)} × {item.qty || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Timeline Checkpoints */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Fulfillment History & Timeline
                </h4>
                <div className="space-y-3 pl-2 border-l-2 border-indigo-200 dark:border-indigo-900 ml-2">
                  {timeline.length > 0 ? (
                    timeline.map((event, idx) => (
                      <div key={idx} className="relative pl-4 space-y-0.5">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {event.status || 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-400">{event.time || 'N/A'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{event.note || 'N/A'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-4">
                      No timeline events yet.
                    </div>
                  )}
                </div>

                {/* Add timeline milestone note */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add fulfillment note (e.g. Courier picked up package)..."
                    value={timelineNote}
                    onChange={e => setTimelineNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (!timelineNote.trim()) return;
                      onUpdateStatus(order.orderId, order.status, timelineNote);
                      setTimelineNote('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(order.orderId, 'Cancelled', 'Cancelled by admin')}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors"
            >
              Cancel Order
            </button>
            <button
              onClick={() => onUpdateStatus(order.orderId, 'Refunded', 'Payment refunded via gateway')}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Issue Refund
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            {order.status === 'To Pay' && (
              <button
                onClick={() => handleAdvanceStatus('To Ship')}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Verify Payment & Move to Pick/Pack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === 'To Ship' && (
              <button
                onClick={() => handleAdvanceStatus('Shipped')}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Dispatch & Mark as Shipped</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === 'Shipped' && (
              <button
                onClick={() => handleAdvanceStatus('Out for Delivery')}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Assign Rider (Out for Delivery)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {order.status === 'Out for Delivery' && (
              <button
                onClick={() => handleAdvanceStatus('Delivered')}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Doorstep Delivery</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};