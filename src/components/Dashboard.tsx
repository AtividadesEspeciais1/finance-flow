import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { Transaction, Category } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: Date;
}

export const Dashboard = ({ transactions, categories, selectedMonth }: DashboardProps) => {
  const metrics = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd && t.status === 'paid';
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const daysInMonth = monthEnd.getDate();
    const dailyAverage = totalExpense / daysInMonth;

    return {
      totalIncome,
      totalExpense,
      balance,
      dailyAverage,
      transactionCount: monthTransactions.length,
    };
  }, [transactions, selectedMonth]);

  const cards = [
    {
      title: 'Receitas',
      value: metrics.totalIncome,
      icon: TrendingUp,
      variant: 'success' as const,
      description: 'Total de entradas',
    },
    {
      title: 'Despesas',
      value: metrics.totalExpense,
      icon: TrendingDown,
      variant: 'destructive' as const,
      description: 'Total de saídas',
    },
    {
      title: 'Saldo',
      value: metrics.balance,
      icon: Wallet,
      variant: metrics.balance >= 0 ? 'primary' : 'destructive' as const,
      description: 'Balanço atual',
    },
    {
      title: 'Média Diária',
      value: metrics.dailyAverage,
      icon: Activity,
      variant: 'accent' as const,
      description: 'Gasto por dia',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.value >= 0;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    card.variant === 'success' ? 'text-success' :
                    card.variant === 'destructive' ? 'text-destructive' :
                    card.variant === 'accent' ? 'text-accent' :
                    'text-primary'
                  }`}>
                    {formatCurrency(card.value)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  card.variant === 'success' ? 'bg-success/10' :
                  card.variant === 'destructive' ? 'bg-destructive/10' :
                  card.variant === 'accent' ? 'bg-accent/10' :
                  'bg-primary/10'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    card.variant === 'success' ? 'text-success' :
                    card.variant === 'destructive' ? 'text-destructive' :
                    card.variant === 'accent' ? 'text-accent' :
                    'text-primary'
                  }`} />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
