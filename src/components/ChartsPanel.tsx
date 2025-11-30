import { useMemo } from 'react';
import { Transaction, Category } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartsPanelProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
}

export const ChartsPanel = ({ transactions, categories, selectedMonth }: ChartsPanelProps) => {
  const chartData = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd && t.status === 'paid';
    });

    // Dados para gráfico de pizza (despesas por categoria)
    const expensesByCategory: { [key: string]: number } = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
      });

    const pieData = Object.entries(expensesByCategory).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Outros',
        value: amount,
        color: category?.color || '#6b7280',
      };
    }).sort((a, b) => b.value - a.value);

    // Dados para gráfico de barras (receitas vs despesas)
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const barData = [
      { name: 'Receitas', value: totalIncome, fill: '#10b981' },
      { name: 'Despesas', value: totalExpense, fill: '#ef4444' },
    ];

    // Dados para gráfico de linha (últimos 6 meses)
    const lineData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - i, 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTrans = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= month && date <= monthEnd && t.status === 'paid';
      });

      const income = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      lineData.push({
        month: month.toLocaleDateString('pt-BR', { month: 'short' }),
        Receitas: income,
        Despesas: expense,
        Saldo: income - expense,
      });
    }

    return { pieData, barData, lineData };
  }, [transactions, categories, selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Adicione transações para visualizar os gráficos.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Pizza */}
      {chartData.pieData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráfico de Barras */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Receitas vs Despesas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de Linha */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Evolução dos Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
