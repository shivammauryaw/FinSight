import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddTransactionModal from '../components/AddTransactionModal';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  const getDates = (range) => {
    const end = new Date();
    let start = new Date();
    if (range === 'THIS_WEEK') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
    } else if (range === 'THIS_MONTH') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (range === 'LAST_3_MONTHS') {
      start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
    } else if (range === 'THIS_YEAR') {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      return { startDate: null, endDate: null };
    }
    return { 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDates(dateRange);
      let url = '/analytics';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await api.get(url);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <div className="p-8 text-center text-muted-text">Loading dashboard...</div>;
  if (!analytics) return <div className="p-8 text-center text-error">Failed to load data</div>;

  const categoryData = Object.entries(analytics.spendingByCategory || {}).map(([name, value]) => ({
    name,
    amount: value
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Hi, {user?.name || 'User'}!</h1>
          <p className="text-sm text-muted-text mt-1">Track and manage your financial health.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-surface border border-border text-sm font-medium text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2 cursor-pointer shadow-sm hover:bg-background transition-colors"
          >
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_3_MONTHS">Last 3 Months</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="ALL_TIME">All Time</option>
          </select>
          <Link
            to="/ai-insights"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-background hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            AI Insights
          </Link>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Income Card */}
        <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex justify-between items-start">
            <dt className="text-xs font-semibold text-muted-text uppercase tracking-wider">Total Income</dt>
            <div className="p-1.5 bg-success/10 rounded-md">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
          <dd className="mt-3 text-3xl font-bold text-text">₹{analytics.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
        </div>
        
        {/* Expenses Card */}
        <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex justify-between items-start">
            <dt className="text-xs font-semibold text-muted-text uppercase tracking-wider">Total Expenses</dt>
            <div className="p-1.5 bg-error/10 rounded-md">
              <TrendingDown className="w-4 h-4 text-error" />
            </div>
          </div>
          <dd className="mt-3 text-3xl font-bold text-text">₹{analytics.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
        </div>
        
        {/* Savings Card */}
        <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex justify-between items-start">
            <dt className="text-xs font-semibold text-muted-text uppercase tracking-wider">Net Savings</dt>
          </div>
          <dd className="mt-3 text-3xl font-bold text-text">₹{analytics.savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex justify-between items-start">
            <dt className="text-xs font-semibold text-muted-text uppercase tracking-wider">Savings Rate</dt>
          </div>
          <dd className="mt-3 text-3xl font-bold text-text">
            {analytics.savingsRate.toFixed(1)}%
          </dd>
          <div className="mt-2 w-full bg-border rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${analytics.savingsRate > 20 ? 'bg-success' : analytics.savingsRate > 0 ? 'bg-primary' : 'bg-error'}`} 
              style={{ width: `${Math.min(Math.max(analytics.savingsRate, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 mt-4">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-text">Expenses by Category</h3>
            <Link to="/transactions" className="text-sm font-medium text-primary hover:text-secondary flex items-center group">
              View all
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="h-[280px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-text)" 
                    tick={{ fill: 'var(--muted-text)', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--muted-text)" 
                    tick={{ fill: 'var(--muted-text)', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `₹${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--border)', opacity: 0.3 }}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                    labelStyle={{ color: 'var(--muted-text)', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase' }}
                    formatter={(value) => [`₹${value}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-text">
                No expense data for this period
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-primary text-surface shadow-lg hover:bg-secondary hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-40"
        title="Add Transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAnalytics();
        }}
      />
    </div>
  );
}
