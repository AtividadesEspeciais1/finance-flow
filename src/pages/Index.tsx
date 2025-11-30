import { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, BarChart3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { FilterPanel, FilterOptions } from '@/components/FilterPanel';
import { ChartsPanel } from '@/components/ChartsPanel';
import { ExpensesView } from '@/components/ExpensesView';
import { 
  getTransactions, 
  getCategories, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  Transaction,
  Category 
} from '@/lib/storage';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    categoryId: '',
    type: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transaction);
      toast.success('Transação atualizada com sucesso!');
      setEditingTransaction(undefined);
    } else {
      addTransaction(transaction);
      toast.success('Transação adicionada com sucesso!');
    }
    loadData();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success('Transação excluída com sucesso!');
    loadData();
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransaction(undefined);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro de mês
      const transactionDate = new Date(transaction.date);
      if (
        transactionDate.getMonth() !== selectedMonth.getMonth() ||
        transactionDate.getFullYear() !== selectedMonth.getFullYear()
      ) {
        return false;
      }

      // Filtro de busca
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filtro de categoria
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      // Filtro de tipo
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all' && transaction.status !== filters.status) {
        return false;
      }

      // Filtro de valor mínimo
      if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) {
        return false;
      }

      // Filtro de valor máximo
      if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) {
        return false;
      }

      return true;
    });
  }, [transactions, selectedMonth, filters]);

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthName = selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                Controle Financeiro
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas finanças de forma profissional e inteligente
              </p>
            </div>
            <Button 
              onClick={() => setFormOpen(true)}
              size="lg"
              className="gradient-primary shadow-medium hover:shadow-strong transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Transação
            </Button>
          </div>

          {/* Seletor de Mês */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold capitalize min-w-[200px] text-center">
              {monthName}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dashboard */}
          <Dashboard 
            transactions={filteredTransactions}
            categories={categories}
            selectedMonth={selectedMonth}
          />
        </motion.div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ExpensesView
              transactions={transactions}
              categories={categories}
              selectedMonth={selectedMonth}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <FilterPanel 
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
            />
            
            <TransactionList
              transactions={filteredTransactions}
              categories={categories}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsPanel
              transactions={transactions}
              categories={categories}
              selectedMonth={selectedMonth}
            />
          </TabsContent>
        </Tabs>

        {/* Form Modal */}
        <TransactionForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={handleAddTransaction}
          categories={categories}
          transaction={editingTransaction}
        />
      </div>
    </div>
  );
};

export default Index;
