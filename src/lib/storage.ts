// Sistema de storage para persistência de dados financeiros

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  type: 'income' | 'expense';
  status: 'paid' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface FinancialData {
  transactions: Transaction[];
  categories: Category[];
}

const STORAGE_KEY = 'financial-control-data';

// Categorias padrão
const defaultCategories: Category[] = [
  // Receitas
  { id: '1', name: 'Salário', color: '#10b981', icon: 'Briefcase', type: 'income' },
  { id: '2', name: 'Freelance', color: '#3b82f6', icon: 'Laptop', type: 'income' },
  { id: '3', name: 'Investimentos', color: '#8b5cf6', icon: 'TrendingUp', type: 'income' },
  { id: '4', name: 'Outros', color: '#6b7280', icon: 'Plus', type: 'income' },
  
  // Despesas
  { id: '5', name: 'Alimentação', color: '#ef4444', icon: 'UtensilsCrossed', type: 'expense' },
  { id: '6', name: 'Transporte', color: '#f59e0b', icon: 'Car', type: 'expense' },
  { id: '7', name: 'Moradia', color: '#ec4899', icon: 'Home', type: 'expense' },
  { id: '8', name: 'Saúde', color: '#06b6d4', icon: 'Heart', type: 'expense' },
  { id: '9', name: 'Educação', color: '#8b5cf6', icon: 'GraduationCap', type: 'expense' },
  { id: '10', name: 'Lazer', color: '#14b8a6', icon: 'Gamepad2', type: 'expense' },
  { id: '11', name: 'Compras', color: '#f97316', icon: 'ShoppingBag', type: 'expense' },
  { id: '12', name: 'Contas', color: '#64748b', icon: 'FileText', type: 'expense' },
];

// Inicializar dados se não existirem
const initializeData = (): FinancialData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erro ao ler dados:', error);
    }
  }
  
  return {
    transactions: [],
    categories: defaultCategories,
  };
};

// Salvar dados
const saveData = (data: FinancialData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

// Obter todos os dados
export const getData = (): FinancialData => {
  return initializeData();
};

// Transações
export const getTransactions = (): Transaction[] => {
  return getData().transactions;
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
  const data = getData();
  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  data.transactions.push(newTransaction);
  saveData(data);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  const data = getData();
  const index = data.transactions.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  data.transactions[index] = {
    ...data.transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveData(data);
  return data.transactions[index];
};

export const deleteTransaction = (id: string): boolean => {
  const data = getData();
  const index = data.transactions.findIndex(t => t.id === id);
  
  if (index === -1) return false;
  
  data.transactions.splice(index, 1);
  saveData(data);
  return true;
};

// Categorias
export const getCategories = (): Category[] => {
  return getData().categories;
};

export const addCategory = (category: Omit<Category, 'id'>): Category => {
  const data = getData();
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
  };
  
  data.categories.push(newCategory);
  saveData(data);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const data = getData();
  const index = data.categories.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  data.categories[index] = {
    ...data.categories[index],
    ...updates,
  };
  
  saveData(data);
  return data.categories[index];
};

export const deleteCategory = (id: string): boolean => {
  const data = getData();
  const index = data.categories.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  // Verificar se há transações usando esta categoria
  const hasTransactions = data.transactions.some(t => t.categoryId === id);
  if (hasTransactions) {
    throw new Error('Não é possível excluir categoria com transações associadas');
  }
  
  data.categories.splice(index, 1);
  saveData(data);
  return true;
};

// Exportar dados
export const exportData = (): string => {
  return JSON.stringify(getData(), null, 2);
};

// Importar dados
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.transactions || !data.categories) {
      throw new Error('Formato inválido');
    }
    saveData(data);
    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
};

// Limpar todos os dados
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
