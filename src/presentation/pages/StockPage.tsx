import { useState } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Table } from '../components/ui/Table'

export function StockPage() {
  const { products } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchTerm, setSearchTerm] = useState('')

  const totalItems = products.reduce(
    (accumulator, product) => accumulator + product.stockQuantity,
    0,
  )

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card title="Resumo de estoque">
        <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          Total de itens em estoque:{' '}
          <span className="font-semibold text-emerald-500">
            {totalItems}
          </span>
        </p>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            label="Buscar no estoque"
            placeholder="Nome ou código..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <Card title="Estoque por produto">
        {products.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum produto cadastrado para controle de estoque.
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum produto encontrado para "{searchTerm}".
          </p>
        ) : (
          <Table headers={['Código', 'Produto', 'Estoque atual']}>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className={`px-3 py-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {product.sku}
                </td>
                <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {product.name}
                </td>
                <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {product.stockQuantity}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

