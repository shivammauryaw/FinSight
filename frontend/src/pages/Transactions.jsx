import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Edit } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading transactions...</div>;

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  
  const groupedTransactions = sortedTransactions.reduce((acc, tx) => {
    if (!acc[tx.transactionDate]) acc[tx.transactionDate] = [];
    acc[tx.transactionDate].push(tx);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-text">Transactions</h1>
          <p className="mt-2 text-sm text-muted-text">
            A list of all your income and expenses.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        {transactions.length === 0 && !loading && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
            <p className="text-muted-text">No transactions found. Add one to get started!</p>
          </div>
        )}

        {Object.keys(groupedTransactions).map((date) => (
          <div key={date} className="mb-8">
            <h3 className="text-md font-medium text-muted-text mb-3 ml-2">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="bg-gradient-to-b from-surface to-background/50 backdrop-blur-md shadow-sm rounded-xl border border-white/5 overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background/30">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-text uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-text uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {groupedTransactions[date].map((tx) => (
                    <tr key={tx.id} className="hover:bg-background/20 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text">{tx.description}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-text">
                        {tx.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {tx.category.name}
                          </span>
                        ) : 'Uncategorized'}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-right ${tx.type === 'INCOME' ? 'text-success' : 'text-error'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <button 
                          className="text-secondary hover:text-primary mr-4 transition-colors"
                          onClick={() => {
                            setTransactionToEdit(tx);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-error hover:text-error/70 transition-colors"
                          onClick={() => deleteTransaction(tx.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setTransactionToEdit(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-primary text-surface shadow-lg hover:bg-secondary hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-40"
        title="Add Transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddTransactionModal 
        isOpen={isModalOpen}
        initialData={transactionToEdit}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTransactions();
        }}
      />
    </div>
  );
}
