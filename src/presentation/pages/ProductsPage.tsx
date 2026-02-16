import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Table } from '../components/ui/Table'

export function ProductsPage() {
  const { products, addProduct, updateProduct, removeProduct } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list')
  const [searchTerm, setSearchTerm] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    // Convert to number and divide by 100
    const number = Number(digits) / 100
    // Format as BRL currency
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handlePriceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = event.target.value
    // If empty or only R$, verify
    if (!value || value === 'R$ ' || value === 'R$') {
      setter('')
      return
    }
    setter(formatCurrency(value))
  }

  const parseCurrency = (value: string) => {
    if (!value) return 0
    return Number(value.replace(/\D/g, '')) / 100
  }

  const getMargin = () => {
    const price = parseCurrency(unitPrice)
    const cost = parseCurrency(costPrice)
    if (!price || !cost || price === 0) return 0 // Avoid division by zero
    return ((price - cost) / price) * 100
  }

  const generateSimpleId = () => {
    // Generate a simple ID like "P-1234"
    const random = Math.floor(1000 + Math.random() * 9000)
    return `P-${random}`
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name || !unitPrice) return

    const price = parseCurrency(unitPrice)
    const cost = parseCurrency(costPrice)
    const quantity = stockQuantity ? Number(stockQuantity) : 0

    if (Number.isNaN(price) || Number.isNaN(quantity)) return

    setIsSubmitting(true)

    if (viewMode === 'create') {
      const uniqueId = generateSimpleId()

      await addProduct({
        name,
        description,
        sku: uniqueId,
        unitPrice: price,
        costPrice: cost,
        stockQuantity: quantity,
      })
    } else if (viewMode === 'edit' && editingId) {
      await updateProduct(editingId, {
        name,
        description,
        unitPrice: price,
        costPrice: cost,
      })
    }

    setIsSubmitting(false)
    handleCancel()
  }

  const handleEditClick = (product: { id: string, name: string, description?: string, sku: string, unitPrice: number, costPrice?: number, stockQuantity: number }) => {
    setEditingId(product.id)
    setName(product.name)
    setDescription(product.description || '')
    // Format price for display in edit mode
    setUnitPrice(product.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    setCostPrice(product.costPrice ? product.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '')
    setStockQuantity(product.stockQuantity.toString())
    setViewMode('edit')
  }

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await removeProduct(productToDelete.id)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
    setUnitPrice('')
    setCostPrice('')
    setStockQuantity('')
    setEditingId(null)
    setViewMode('list')
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {viewMode === 'create' ? 'Novo Produto' : 'Editar Produto'}
          </h2>
          <Button variant="ghost" onClick={handleCancel}>
            Voltar para lista
          </Button>
        </div>

        <Card title="Dados do produto">
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <Input
              label="Nome"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              label="Descrição"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Input
              label="Preço de Custo (R$)"
              name="costPrice"
              value={costPrice}
              onChange={(e) => handlePriceChange(e, setCostPrice)}
              placeholder="R$ 0,00"
            />

            <Input
              label="Preço de Venda (R$)"
              name="unitPrice"
              value={unitPrice}
              onChange={(e) => handlePriceChange(e, setUnitPrice)}
              placeholder="R$ 0,00"
            />

            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Margem de Lucro: <span className={`font-semibold ${getMargin() > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {getMargin().toFixed(2)}%
              </span>
            </div>

            <Input
              label="Estoque inicial"
              name="stockQuantity"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              disabled={viewMode === 'edit'}
              placeholder={viewMode === 'edit' ? 'Use movimentações' : ''}
            />

            <div className="md:col-span-2 mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar produto'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            label="Buscar produto"
            placeholder="Nome ou código..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="pt-6">
          <Button onClick={() => setViewMode('create')}>Novo Produto</Button>
        </div>
      </div>

      <Card title="Produtos cadastrados">
        {products.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum produto cadastrado ainda.
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum produto encontrado para "{searchTerm}".
          </p>
        ) : (
          <Table headers={['Código', 'Nome', 'Custo', 'Venda', 'Margem', 'Estoque', 'Ações']}>
            {filteredProducts.map((product) => {
              const margin = product.unitPrice
                ? ((product.unitPrice - (product.costPrice || 0)) / product.unitPrice) * 100
                : 0

              return (
                <tr key={product.id}>
                  <td className={`px-3 py-2 text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {product.sku}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {product.name}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {product.costPrice ? `R$ ${product.costPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    R$ {product.unitPrice.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-xs font-medium ${margin > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {margin.toFixed(0)}%
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {product.stockQuantity}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </Table>
        )}
      </Card>

      <Dialog
        isOpen={deleteDialogOpen}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto ${productToDelete?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  )
}
