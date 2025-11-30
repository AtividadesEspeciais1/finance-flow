import { useMemo, useState } from 'react';
import { Transaction, Category } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Table2, BarChart3, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpensesViewProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
}

type ViewMode = 'expenses' | 'income' | 'all';
type FormatMode = 'table' | 'chart' | 'edit';

export const ExpensesView = ({ transactions, categories, selectedMonth }: ExpensesViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('expenses');
  const [formatMode, setFormatMode] = useState<FormatMode>('chart');

  const data = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd && t.status === 'paid';
    });

    const filteredTransactions = monthTransactions.filter(t => {
      if (viewMode === 'expenses') return t.type === 'expense';
      if (viewMode === 'income') return t.type === 'income';
      return true;
    });

    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = filteredTransactions.length;

    // Dados para gráfico diário
    const dailyData: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const day = date.getDate();
      const key = `${day.toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      dailyData[key] = (dailyData[key] || 0) + t.amount;
    });

    const chartData = Object.entries(dailyData)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => {
        const [dayA] = a.date.split('/').map(Number);
        const [dayB] = b.date.split('/').map(Number);
        return dayA - dayB;
      });

    return { total, count, chartData, monthStart, monthEnd };
  }, [transactions, selectedMonth, viewMode]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getViewLabel = () => {
    if (viewMode === 'expenses') return 'Gastos';
    if (viewMode === 'income') return 'Receitas';
    return 'Total';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-8 shadow-medium">
        {/* Header com seletor */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-medium">{getViewLabel()}</span>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expenses">Gastos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="all">Totais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Período */}
        <p className="text-sm text-muted-foreground mb-2">
          TOTAL {formatDate(data.monthStart).toUpperCase()} A {formatDate(data.monthEnd).toUpperCase()}
        </p>

        {/* Valor Total em destaque */}
        <h2 className="text-6xl font-bold mb-3 gradient-primary bg-clip-text text-transparent">
          {formatCurrency(data.total)}
        </h2>

        {/* Quantidade de transações */}
        <p className="text-sm text-muted-foreground mb-6">
          {data.count} transações
        </p>

        {/* Seletor de formato */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={formatMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setFormatMode('table')}
            className="h-9 w-9"
          >
            <Table2 className="h-4 w-4" />
          </Button>
          <Button
            variant={formatMode === 'chart' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setFormatMode('chart')}
            className="h-9 w-9"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant={formatMode === 'edit' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setFormatMode('edit')}
            className="h-9 w-9"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Gráfico */}
        {formatMode === 'chart' && data.chartData.length > 0 && (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Total de {viewMode === 'expenses' ? 'gastos' : viewMode === 'income' ? 'receitas' : 'movimentações'}
            </p>
          </div>
        )}

        {formatMode === 'table' && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Visualização em tabela disponível na aba "Transações"</p>
          </div>
        )}

        {formatMode === 'edit' && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Use o botão "Nova Transação" para adicionar ou editar</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
