import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppState } from '../../../app/AppStateContext'
import { useTheme } from '../../../app/ThemeContext'

export function MonthlySalesChart() {
  const { stockMovements } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const axisColor = isDark ? '#cbd5f5' : '#4b5563'
  const tooltipBackground = isDark ? '#020617' : '#ffffff'
  const tooltipBorder = isDark ? '#1e293b' : '#e5e7eb'
  const tooltipText = isDark ? '#e5e7eb' : '#111827'

  const monthlyData = useMemo(() => {
    // 1. Filter sales
    const sales = stockMovements.filter((m) => m.type === 'out')

    // 2. Generate months for the current year (Jan-Dec)
    const currentYear = new Date().getFullYear()
    const monthsOfYear = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(currentYear, i, 1)
      return d
    })

    return monthsOfYear.map((date) => {
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      const key = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', '')

      const monthSales = sales.filter(s => {
        const sDate = new Date(s.date)
        return sDate.getMonth() === date.getMonth() &&
          sDate.getFullYear() === currentYear
      })

      const total = monthSales.reduce((sum, s) => sum + (s.totalValue || 0), 0)

      return {
        month: key,
        totalSales: total
      }
    })
  }, [stockMovements])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={monthlyData}>
          <XAxis
            dataKey="month"
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
            formatter={(value?: number) => [`R$ ${value?.toFixed(2) ?? '0.00'}`, 'Vendas']}
          />
          <Bar dataKey="totalSales" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

