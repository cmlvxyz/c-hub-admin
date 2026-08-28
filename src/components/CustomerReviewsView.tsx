import React, { useState } from 'react';
import {
  Users,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  Package,
  Award
} from 'lucide-react';
import { Review, Order } from '../types';
import { formatPHP } from '../utils';

interface CustomerReviewsViewProps {
  reviews: Review[];
  orders: Order[];
  onReplyReview: (reviewId: string, replyText: string) => void;
}

export const CustomerReviewsView: React.FC<CustomerReviewsViewProps> = ({
  reviews,
  orders,
  onReplyReview
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'customers'>('reviews');
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  // Extract unique customers from orders
  const customerMap = new Map<string, any>();
  orders.forEach(o => {
    const cust = o.customer;
    if (!customerMap.has(cust.email)) {
      customerMap.set(cust.email, {
        ...cust,
        ordersCount: 1,
        totalSpent: o.total,
        lastOrderDate: o.date
      });
    } else {
      const existing = customerMap.get(cust.email);
      existing.ordersCount += 1;
      existing.totalSpent += o.total;
    }
  });
  const customers = Array.from(customerMap.values());

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
    return true;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleSendReply = (reviewId: string) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) return;
    onReplyReview(reviewId, text);
    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Customer CRM & Product Reviews</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer lifetime value (LTV), moderate ratings, and dispatch verified merchant responses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`px-4 py-3 text-xs font-medium transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Product Reviews & Moderation ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-3 text-xs font-medium transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'customers'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Customer Directory & LTV ({customers.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: REVIEWS MODERATION */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          {/* Review KPI Banner */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex flex-col items-center justify-center font-bold">
                <span className="text-xl leading-none">{avgRating}</span>
                <span className="text-[10px]">★★★★★</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Customer Satisfaction Score
                </h4>
                <p className="text-xs text-slate-400">
                  Based on {reviews.length} verified customer product reviews
                </p>
              </div>
            </div>

            {/* Filter by stars */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  ratingFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                All
              </button>
              {[5, 4, 3].map(stars => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    ratingFilter === stars
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {stars} ★
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map(review => {
              return (
                <div
                  key={review.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {review.customerName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {review.customerName}
                          </p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified Buyer
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono">
                      Product: {review.productName} • Ref: {review.orderId}
                    </p>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Merchant Reply Section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {review.adminReply ? (
                      <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                          <span>C-HUB Official Response</span>
                          <span className="text-slate-400">{review.adminReply.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {review.adminReply.comment}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write official merchant response..."
                          value={replyInput[review.id] || ''}
                          onChange={e =>
                            setReplyInput({ ...replyInput, [review.id]: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleSendReply(review.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CUSTOMER DIRECTORY & LTV */}
      {activeSubTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Customer Name & Email</th>
                  <th className="px-4 py-3.5">Phone & City</th>
                  <th className="px-4 py-3.5">Loyalty Tier</th>
                  <th className="px-4 py-3.5">Total Orders</th>
                  <th className="px-4 py-3.5">Lifetime Value (LTV)</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {cust.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{cust.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{cust.city}</p>
                      <p className="text-[10px] text-slate-400">{cust.phone}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          cust.tier === 'VIP'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : cust.tier === 'Platinum'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : cust.tier === 'Gold'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {cust.tier}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono font-medium">{cust.ordersCount} orders</td>

                    <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPHP(cust.totalSpent)}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span className="text-emerald-600 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Buyer
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
