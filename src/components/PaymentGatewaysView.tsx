import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RotateCcw,
  Send,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Settings,
  Lock
} from 'lucide-react';
import { PaymentGatewayConfig } from '../types';
import { formatPHP } from '../utils';

interface PaymentGatewaysViewProps {
  gateways: PaymentGatewayConfig[];
  onToggleGateway: (gatewayId: string) => void;
  onSendTestWebhook: (gatewayId: string) => void;
}

export const PaymentGatewaysView: React.FC<PaymentGatewaysViewProps> = ({
  gateways,
  onToggleGateway,
  onSendTestWebhook
}) => {
  const [testAmount, setTestAmount] = useState<number>(2500);
  const [selectedGatewayForCalc, setSelectedGatewayForCalc] = useState<string>('gcash');

  const selectedGw = gateways.find(g => g.id === selectedGatewayForCalc) || gateways[0];
  const calculatedFee = selectedGw
    ? selectedGw.feeFixed + (testAmount * selectedGw.feePercentage) / 100
    : 0;
  const netSettlement = testAmount - calculatedFee;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Payment Gateways & Settlement Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrated payment rails for GCash QR, Maya Wallet, 3D Secure Credit Cards, Cash on Delivery, Bank & BNPL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PCI-DSS Level 1 Encrypted</span>
          </span>
        </div>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gateways.map(gw => {
          return (
            <div
              key={gw.id}
              className={`p-5 rounded-xl border shadow-sm transition-all flex flex-col justify-between ${
                gw.enabled
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Header with status pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {gw.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{gw.type}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleGateway(gw.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gw.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        gw.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Gateway Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Success Rate
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {gw.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Fee Structure
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {gw.feePercentage}% {gw.feeFixed > 0 && `+ ₱${gw.feeFixed}`}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Daily Processed Vol:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPHP(gw.dailyVolume)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {gw.health.toUpperCase()}
                </span>

                <button
                  onClick={() => onSendTestWebhook(gw.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Simulate Instant Payment Webhook"
                >
                  <Send className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Test Webhook</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Settlement & Fee Calculator */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Merchant Payout & Gateway Fee Calculator
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate merchant take-home payout after payment processor deductions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Gateway
            </label>
            <select
              value={selectedGatewayForCalc}
              onChange={e => setSelectedGatewayForCalc(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {gateways.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.feePercentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Order Gross Amount (₱)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={e => setTestAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">
                Estimated Net Settlement
              </span>
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatPHP(netSettlement)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <span>Fee: -{formatPHP(calculatedFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
