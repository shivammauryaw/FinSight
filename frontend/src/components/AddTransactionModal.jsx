import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setIsAddingCategory(false);
      setNewCategoryName('');
      if (initialData) {
        setDescription(initialData.description || '');
        setAmount(initialData.amount || '');
        setType(initialData.type || 'EXPENSE');
        setCategoryId(initialData.category?.id || '');
        setTransactionDate(initialData.transactionDate || new Date().toISOString().split('T')[0]);
      } else {
        // Reset form for new transaction
        setDescription('');
        setAmount('');
        setType('EXPENSE');
        setCategoryId('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    // Only reset category if we are not editing an existing transaction's initial load
    if (!initialData || (initialData && initialData.type !== type)) {
      setCategoryId('');
    }
  }, [type]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategoryLoading(true);
    try {
      const { data } = await api.post('/categories', {
        name: newCategoryName,
        type: type
      });
      setCategories([...categories, data]);
      setCategoryId(data.id);
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      console.error("Failed to create category", err);
      setError("Failed to create category");
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || null,
        transactionDate,
        paymentMethod: 'OTHER'
      };

      if (initialData && initialData.id) {
        await api.put(`/transactions/${initialData.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      
      // Reset form
      setDescription('');
      setAmount('');
      setType('EXPENSE');
      setCategoryId('');
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to save transaction. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-text">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button 
            onClick={onClose}
            className="text-muted-text hover:text-text focus:outline-none transition-colors rounded-full p-1 hover:bg-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-error text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border bg-background text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Amount</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-text sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-border bg-background text-text rounded-md py-2"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-border bg-background text-text rounded-md py-2 px-3"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-text">Category</label>
              {!isAddingCategory && (
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategory(true)}
                  className="text-xs text-primary hover:text-secondary font-medium"
                >
                  + New Category
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-border bg-background text-text rounded-md py-2 px-3"
                  placeholder="Category Name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={addingCategoryLoading}
                  className="px-3 py-2 bg-primary text-surface text-sm font-medium rounded-md hover:bg-secondary disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-2 bg-surface text-text text-sm font-medium rounded-md border border-border hover:bg-background"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border bg-background text-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">No Category</option>
                {categories.filter(c => c.type === type).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Date</label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-border bg-background text-text rounded-md py-2 px-3"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-surface bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
