import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Table } from '../components/ui/Table'

export function MovementsPage() {
  const { products, customers, stockMovements, addStockMovement, updateStockMovement, removeStockMovement } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [productId, setProductId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [type, setType] = useState<'in' | 'out'>('out')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)
  const [currentStock, setCurrentStock] = useState<number | null>(null)
  const [isPaid, setIsPaid] = useState(true)
  const [movementDate, setMovementDate] = useState('')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'pending'>('all')

  // Pagination & Deletion
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null)

  // Apply filters
  const filteredMovements = stockMovements.filter(movement => {
    if (filterType !== 'all' && movement.type !== filterType) return false
    if (filterProduct && movement.productId !== filterProduct) return false
    if (filterCustomer && movement.customerId !== filterCustomer) return false
    if (filterPaymentStatus !== 'all') {
      if (movement.type === 'out') {
        if (filterPaymentStatus === 'paid' && movement.isPaid === false) return false
        if (filterPaymentStatus === 'pending' && movement.isPaid !== false) return false
      }
    }
    return true
  })

  const sortedMovements = [...filteredMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage)

  const currentMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleRemoveClick = (movement: any) => {
    setMovementToDelete(movement.id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (movementToDelete) {
      await removeStockMovement(movementToDelete)
      setDeleteDialogOpen(false)
      setMovementToDelete(null)
    }
  }

  const handleMarkAsPaid = async (movementId: string) => {
    const paymentDate = new Date()
    paymentDate.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
    await updateStockMovement(movementId, {
      isPaid: true,
      paymentDate: paymentDate.toISOString()
    })
  }

  const handleProductChange = (id: string) => {
    setProductId(id)
    const product = products.find(p => p.id === id)
    if (product) {
      setUnitPrice(product.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
      setOriginalPrice(product.unitPrice)
      setCurrentStock(product.stockQuantity)
    } else {
      setUnitPrice('')
      setOriginalPrice(null)
      setCurrentStock(null)
    }
  }

  const parseCurrency = (value: string) => {
    if (!value) return 0
    return Number(value.replace(/\D/g, '')) / 100
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const digits = value.replace(/\D/g, '')
    const number = Number(digits) / 100
    setUnitPrice(number.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
  }

  const getDiscount = () => {
    if (!originalPrice || type !== 'out') return 0
    const currentPrice = parseCurrency(unitPrice)
    return originalPrice - currentPrice
  }

  const getTotalValues = () => {
    const qty = Number(quantity)
    const price = parseCurrency(unitPrice)
    if (!qty || !price) return { total: 0 }
    return { total: qty * price }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!productId || !quantity) return
    if (type === 'out' && !customerId) return

    const parsedQuantity = Number(quantity)
    const parsedPrice = parseCurrency(unitPrice)

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) return
    // Allow zero price? Maybe for gifts/samples. Let's allow >= 0.
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) return

    // Check stock for sales
    if (type === 'out' && currentStock !== null && parsedQuantity > currentStock) {
      alert(`Estoque insuficiente! Você tem apenas ${currentStock} unidades.`)
      return
    }

    // Convert date to ISO with local time (noon) to avoid timezone issues
    let dateToSave = undefined
    if (movementDate) {
      const [year, month, day] = movementDate.split('-')
      dateToSave = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0).toISOString()
    }

    const movementData: any = {
      productId,
      customerId: type === 'out' ? customerId : undefined,
      type,
      quantity: parsedQuantity,
      unitPrice: parsedPrice,
      totalValue: parsedQuantity * parsedPrice,
      isPaid: type === 'out' ? isPaid : true,
      date: dateToSave,
    }

    if (type === 'out' && originalPrice !== null) {
      movementData.originalPrice = originalPrice
      movementData.discount = originalPrice - parsedPrice
    }

    // If paid, set payment date
    if (type === 'out' && isPaid) {
      const paymentDate = dateToSave ? new Date(dateToSave) : new Date()
      paymentDate.setHours(12, 0, 0, 0)
      movementData.paymentDate = paymentDate.toISOString()
    }

    addStockMovement(movementData)

    // Reset form
    setQuantity('')
    setIsPaid(true)
    setMovementDate('')
    setProductId('')
    setCustomerId('')
    setUnitPrice('')
    setOriginalPrice(null)
    setCurrentStock(null)

    // Close modal
    setIsModalOpen(false)
  }

  const getProductName = (id: string) =>
    products.find((product) => product.id === id)?.name ?? 'Produto removido'

  const getCustomerName = (id?: string) => {
    if (!id) return '-'
    return customers.find((c) => c.id === id)?.name ?? 'Cliente removido'
  }

  return (
    <div className="space-y-6">
      {/* Header with New Movement Button */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Movimentações
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Nova Movimentação
        </Button>
      </div>

      {/* Filters */}
      <Card title="Filtros">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Tipo
            </label>
            <select
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                }`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'in' | 'out')}
            >
              <option value="all">Todos</option>
              <option value="out">Vendas</option>
              <option value="in">Compras</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Produto
            </label>
            <select
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                }`}
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <option value="">Todos os produtos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Cliente
            </label>
            <select
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                }`}
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="">Todos os clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Status Pagamento
            </label>
            <select
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                }`}
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value as 'all' | 'paid' | 'pending')}
            >
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Histórico de movimentações">
        {stockMovements.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <>
            <Table headers={['Data', 'Tipo', 'Produto', 'Cliente', 'Qtd.', 'Orig.', 'Desc.', 'Final', 'Status', 'Dt. Pgto', 'Total', 'Ações']}>
              {currentMovements.map((movement) => (
                <tr key={movement.id}>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {new Date(movement.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`px-3 py-2 text-xs font-medium ${movement.type === 'in' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                    {movement.type === 'in' ? 'Compra' : 'Venda'}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {getProductName(movement.productId)}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getCustomerName(movement.customerId)}
                  </td>
                  <td className={`px-3 py-2 text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {movement.quantity}
                  </td>
                  <td className={`px-3 py-2 text-xs text-slate-400 line-through`}>
                    {movement.originalPrice ? formatCurrency(movement.originalPrice) : '-'}
                  </td>
                  <td className={`px-3 py-2 text-xs text-emerald-500`}>
                    {movement.discount ? `-${formatCurrency(movement.discount)}` : '-'}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {movement.unitPrice ? formatCurrency(movement.unitPrice) : '-'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {movement.type === 'out' && (
                      movement.isPaid === false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          Pago
                        </span>
                      )
                    )}
                    {movement.type === 'in' && <span className="text-slate-400">-</span>}
                  </td>
                  <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {movement.paymentDate ? new Date(movement.paymentDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className={`px-3 py-2 text-xs font-semibold ${isDark ? 'text-slate-100 text-emerald-400' : 'text-slate-900 text-emerald-600'}`}>
                    {movement.totalValue ? formatCurrency(movement.totalValue) : '-'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex gap-2">
                      {movement.type === 'out' && movement.isPaid === false && (
                        <button
                          onClick={() => handleMarkAsPaid(movement.id)}
                          className="text-emerald-500 hover:text-emerald-400"
                          title="Marcar como pago"
                        >
                          Receber
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveClick(movement)}
                        className="text-red-500 hover:text-red-400"
                        title="Excluir movimentação"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            {stockMovements.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal de Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Nova Movimentação
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`text-2xl ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Tipo de Movimentação
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="out"
                        checked={type === 'out'}
                        onChange={() => setType('out')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Venda (Saída)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="in"
                        checked={type === 'in'}
                        onChange={() => setType('in')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Compra (Entrada)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1"></div>

                <div className="space-y-1">
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Produto
                  </label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                      }`}
                    value={productId}
                    onChange={(event) => handleProductChange(event.target.value)}
                  >
                    <option value="" disabled>Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {currentStock !== null && (
                    <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Estoque atual: <span className={`font-semibold ${currentStock === 0 ? 'text-red-500' : ''}`}>{currentStock}</span>
                    </div>
                  )}
                </div>

                {type === 'out' && (
                  <div className="space-y-1">
                    <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Cliente
                    </label>
                    <select
                      className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/40'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/40'
                        }`}
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                    >
                      <option value="" disabled>Selecione um cliente</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{customer.identification ? ` - ${customer.identification}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <Input
                    label="Quantidade"
                    name="quantity"
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="0"
                  />
                  <Input
                    label="Preço Unitário (R$)"
                    name="unitPrice"
                    value={unitPrice}
                    onChange={handlePriceChange}
                    placeholder="0,00"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label={`Data da ${type === 'out' ? 'Venda' : 'Compra'} (opcional)`}
                    name="movementDate"
                    type="date"
                    value={movementDate}
                    onChange={(event) => setMovementDate(event.target.value)}
                  />
                </div>

                {type === 'out' && currentStock !== null && Number(quantity) > currentStock && (
                  <div className={`col-span-2 mt-2 p-3 rounded-md border ${isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex flex-col text-red-500">
                      <span className="font-bold text-sm">Estoque insuficiente!</span>
                      <span className="text-xs">Você tem apenas {currentStock} unidades disponíveis.</span>
                    </div>
                  </div>
                )}

                {type === 'out' && getDiscount() > 0 && (
                  <div className={`col-span-2 mt-2 p-3 rounded-md border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Desconto aplicado</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          - {formatCurrency(getDiscount())}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>
                          (Original: {originalPrice ? formatCurrency(originalPrice) : '-'})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {type === 'out' && (
                  <div className="flex items-center gap-2 md:col-span-2 mt-4">
                    <input
                      type="checkbox"
                      id="isPaidModal"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className={`w-4 h-4 rounded border cursor-pointer focus:ring-2 focus:ring-offset-2 ${isDark ? 'bg-slate-800 border-slate-600 focus:ring-emerald-500' : 'border-gray-300 text-emerald-600 focus:ring-emerald-500'
                        }`}
                    />
                    <label htmlFor="isPaidModal" className={`text-sm cursor-pointer select-none font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Venda Recebida (Efetivada)
                    </label>
                    {!isPaid && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold ml-2 py-1 px-2 bg-amber-500/10 rounded border border-amber-500/20">
                        <span>⚠️ FIADO / PENDENTE</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2">
                  <div className={`p-3 rounded-md border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Valor Total:</span>
                      <span className="text-lg font-bold text-emerald-500">
                        {formatCurrency(getTotalValues().total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      !productId ||
                      !quantity ||
                      (type === 'out' && !customerId) ||
                      (type === 'out' && currentStock !== null && Number(quantity) > currentStock)
                    }
                  >
                    Registrar {type === 'out' ? 'Venda' : 'Compra'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog
        isOpen={deleteDialogOpen}
        title="Excluir Movimentação"
        description="Tem certeza que deseja excluir esta movimentação? O estoque será revertido automaticamente."
        confirmLabel="Excluir"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div >
  )
}
