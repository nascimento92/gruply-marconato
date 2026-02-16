import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { useAppState } from '../../../app/AppStateContext'
import { useTheme } from '../../../app/ThemeContext'

export function SalesOverviewChart() {
  const { stockMovements } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const axisColor = isDark ? '#cbd5f5' : '#4b5563'
  const tooltipBackground = isDark ? '#020617' : '#ffffff'
  const tooltipBorder = isDark ? '#1e293b' : '#e5e7eb'
  const tooltipText = isDark ? '#e5e7eb' : '#111827'

  const salesData = useMemo(() => {
    // 1. Filter sales
    const sales = stockMovements.filter((m) => m.type === 'out')

    // 2. Generate all days of current month
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const allDaysOfMonth = Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(year, month, i + 1)
    })

    return allDaysOfMonth.map((date) => {
      const key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

      const daySales = sales.filter(s => {
        const sDate = new Date(s.date)
        return sDate.getDate() === date.getDate() &&
          sDate.getMonth() === date.getMonth() &&
          sDate.getFullYear() === date.getFullYear()
      })

      const paid = daySales.reduce((sum, s) => sum + (s.isPaid !== false ? (s.totalValue || 0) : 0), 0)
      const pending = daySales.reduce((sum, s) => sum + (s.isPaid === false ? (s.totalValue || 0) : 0), 0)

      return {
        date: key,
        paid,
        pending
      }
    })
  }, [stockMovements])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: axisColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBackground,
              borderColor: tooltipBorder,
              borderRadius: 8,
              fontSize: 12,
              color: tooltipText,
            }}
            itemStyle={{ color: tooltipText }}
            formatter={(value: number | undefined, name: string | undefined) => [
              `R$ ${value ? value.toFixed(2) : '0.00'}`,
              name === 'paid' ? 'Recebido' : 'Pendente (Fiado)'
            ]}
          />
          <Area
            type="monotone"
            dataKey="paid"
            stackId="1"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#paid)"
            name="paid"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stackId="1"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#pending)"
            name="pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
