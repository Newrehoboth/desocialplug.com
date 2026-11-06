'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  date?: string;
  description?: string;
  amount?: number;
  amountUSD?: number;
  currency?: string;
  status?: string;
  type?: string;
  reference?: string;
}

interface PaginationInfo {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number;
  nextPage?: number;
}

export default function TransactionsPage() {
  const { currency, formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    const fetchTransactions = async (pageNum: number = page) => {
      try {
        const res = await fetch(
          `/api/user/transactions?page=${pageNum}&limit=${limit}`,
        );
        const data = await res.json();

        if (data.success && data.transactions) {
          setTransactions(data.transactions);
          setPagination(data.pagination);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions(page);
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    if (!pagination) return null;
    const { page: currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages.map((p) => (
      <button
        key={p}
        onClick={() => handlePageChange(p)}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          p === currentPage
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        disabled={p === currentPage}
      >
        {p}
      </button>
    ));
  };

  const startItem = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.totalDocs)
    : 0;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              Transactions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              All account activity and payments.
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="py-2 sm:py-3 px-2 sm:px-4">Reference</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4">Date</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4">Description</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                    Amount
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="text-foreground">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">
                      {tx.reference || tx.id.slice(0, 8)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground">
                      {tx.description || tx.type || ''}
                    </td>
    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-foreground">
      {formatAmount(tx.amount || 0)}
      {/* Show the alternative currency as sub-text for additional context */}
      {currency === 'NGN' && tx.amountUSD && tx.amountUSD > 0 && (
        <p className="text-[10px] sm:text-xs text-muted-foreground font-normal mt-0.5">
          ≈ ${tx.amountUSD.toFixed(2)} USD
        </p>
      )}
      {currency === 'USD' && tx.amount && tx.amount > 0 && (
        <p className="text-[10px] sm:text-xs text-muted-foreground font-normal mt-0.5">
          ≈ ₦{(tx.amount).toLocaleString()} NGN
        </p>
      )}
    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                      <span
                        className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          tx.status === 'successful' ||
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {tx.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
                </tbody>
            </table>

            {/* Empty State / Loading State */}
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching transactions...</p>
              </div>
            ) : transactions.length === 0 && (
              <div className="p-6 text-center text-xs sm:text-sm text-muted-foreground">
                No transactions found.
              </div>
            )}
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {pagination.totalDocs}{' '}
                transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.prevPage ?? 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {renderPageNumbers()}
                </div>
                <button
                  onClick={() =>
                    handlePageChange(
                      pagination.nextPage ?? pagination.totalPages,
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
