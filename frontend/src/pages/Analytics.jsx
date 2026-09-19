import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('THIS_MONTH');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

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
    setLoading(true);
    try {
      const { startDate, endDate } = getDates(timeRange);
      let url = '/analytics';
      let txUrl = '/transactions';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
        // Note: For a real app, transactions endpoint should also filter by date, 
        // but since we get all, we can filter in memory or assume backend does it.
      }
      
      const [analyticsRes, txRes] = await Promise.all([
        api.get(url),
        api.get(txUrl)
      ]);
      
      setAnalytics(analyticsRes.data);
      processTrendData(txRes.data, startDate, endDate);
    } catch (error) {
      console.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const processTrendData = (transactions, start, end) => {
    // Filter transactions by date range
    let filtered = transactions;
    if (start && end) {
      filtered = transactions.filter(t => t.transactionDate >= start && t.transactionDate <= end);
    }

    // Group by month
    const grouped = filtered.reduce((acc, tx) => {
      const date = new Date(tx.transactionDate);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, Income: 0, Expenses: 0 };
      }
      
      if (tx.type === 'INCOME') {
        acc[monthYear].Income += tx.amount;
      } else {
        acc[monthYear].Expenses += tx.amount;
      }
      return acc;
    }, {});

    // Sort chronologically
    const sorted = Object.values(grouped).sort((a, b) => {
      return new Date(a.name) - new Date(b.name);
    });

    setTrendData(sorted);
  };

  if (loading && !analytics) return <div className="p-8 text-center">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-center text-error">Failed to load data</div>;

  const categoryData = Object.entries(analytics.spendingByCategory || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-text">Analytics</h1>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-border bg-surface text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
          >
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_3_MONTHS">Last 3 Months</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-surface p-6 shadow rounded-lg border border-border">
          <h3 className="text-lg leading-6 font-medium text-text mb-4">Category Breakdown</h3>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-text">
                No data for this period
              </div>
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-surface p-6 shadow rounded-lg border border-border flex flex-col justify-center">
          <h3 className="text-lg leading-6 font-medium text-text mb-6">Summary</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-text">Total Transactions</dt>
              <dd className="mt-1 text-2xl font-semibold text-text">{analytics.numberOfTransactions}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-text">Savings Rate</dt>
              <dd className="mt-1 text-2xl font-semibold text-accent">{analytics.savingsRate.toFixed(1)}%</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-text">Highest Spending Category</dt>
              <dd className="mt-1 text-xl font-semibold text-error">{analytics.highestSpendingCategory}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-text">Net Income</dt>
              <dd className="mt-1 text-3xl font-semibold text-success">₹{analytics.savings.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Trend Graph */}
        <div className="bg-surface p-6 shadow rounded-lg border border-border">
          <h3 className="text-lg leading-6 font-medium text-text mb-4">Income vs Expenses Trend</h3>
          <div className="h-80">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--muted-text)" tick={{ fill: 'var(--muted-text)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--muted-text)" tick={{ fill: 'var(--muted-text)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 500 }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="Expenses" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-text">
                No trend data for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
