import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Card } from '../components/ui/Card'
import { SalesOverviewChart } from '../components/charts/SalesOverviewChart'
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart'

export function DashboardPage() {
  const { customers, products, stockMovements } = useAppState()

  const totalStock = products.reduce((acc, product) => acc + product.stockQuantity, 0)
  const totalMovements = stockMovements.length

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card title="Clientes">
          <p className="text-2xl font-semibold text-emerald-400">
            {customers.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Cadastros ativos</p>
        </Card>

        <Card title="Produtos">
          <p className="text-2xl font-semibold text-emerald-400">
            {products.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Itens no catálogo</p>
        </Card>

        <Card title="Estoque total">
          <p className="text-2xl font-semibold text-emerald-400">
            {totalStock}
          </p>
          <p className="mt-1 text-xs text-slate-400">Unidades em estoque</p>
        </Card>

        <Card title="Movimentos de estoque">
          <p className="text-2xl font-semibold text-emerald-400">
            {totalMovements}
          </p>
          <p className="mt-1 text-xs text-slate-400">Entradas e saídas registradas</p>
        </Card>
      </section>

      <section className="space-y-4">
        <Card title="Vendas do mês (por dia)">
          <SalesOverviewChart />
        </Card>
        <Card title="Vendas por mês">
          <MonthlySalesChart />
        </Card>
      </section>

      {/* Top Debtors Section */}
      <section>
        <Card title="Clientes com pendências (Fiado)">
          <TopDebtorsChart />
        </Card>
      </section>
    </div>
  )
}

function TopDebtorsChart() {
  const { stockMovements, customers } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const axisColor = isDark ? '#cbd5f5' : '#4b5563'
  const tooltipBackground = isDark ? '#020617' : '#ffffff'
  const tooltipText = isDark ? '#e5e7eb' : '#111827'

  const data = useMemo(() => {
    // 1. Filter pending sales
    const pending = stockMovements.filter(m => m.type === 'out' && m.isPaid === false && m.customerId)

    // 2. Group by customer
    const grouped = pending.reduce((acc, sale) => {
      const cId = sale.customerId!
      if (!acc[cId]) acc[cId] = 0
      acc[cId] += sale.totalValue || 0
      return acc
    }, {} as Record<string, number>)

    // 3. Map to array
    const arr = Object.entries(grouped).map(([cId, total]) => ({
      name: customers.find(c => c.id === cId)?.name || 'Desconhecido',
      total
    }))

    // 4. Sort and take top 5
    return arr.sort((a, b) => b.total - a.total).slice(0, 5)
  }, [stockMovements, customers])

  const totalPending = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0)
  }, [data])

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Nenhuma pendência registrada.</p>
  }

  return (
    <div className="space-y-4">
      {/* Total Pending Amount - Compact */}
      <div className={`p-3 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Total em Aberto
            </p>
            <p className={`text-xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              R$ {totalPending.toFixed(2)}
            </p>
            <p className={`text-xs ${isDark ? 'text-amber-500/70' : 'text-amber-600/70'}`}>
              {data.length} cliente{data.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={`text-3xl ${isDark ? 'text-amber-400/30' : 'text-amber-600/30'}`}>
            ⚠️
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 80 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ backgroundColor: tooltipBackground, borderRadius: 8, color: tooltipText }}
              itemStyle={{ color: tooltipText }}
              formatter={(value?: number) => [`R$ ${value?.toFixed(2) ?? '0.00'}`, 'Pendente']}
            />
            <Bar dataKey="total" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
              <LabelList
                dataKey="total"
                position="right"
                formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                style={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
