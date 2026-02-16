import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { useTheme } from '../../app/ThemeContext'
import { useToast } from '../../app/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Table } from '../components/ui/Table'

export function CustomersPage() {
  const { customers, addCustomer, updateCustomer, removeCustomer } = useAppState()
  const { theme } = useTheme()
  const { showToast } = useToast()
  const isDark = theme === 'dark'

  const formatPhone = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '')

    // Mask (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return numbers.slice(0, 11)
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list')
  const [searchTerm, setSearchTerm] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [identification, setIdentification] = useState('')
  const [phone, setPhone] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.identification && customer.identification.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm)),
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditClick = (customer: { id: string, name: string, identification?: string, phone?: string }) => {
    setEditingId(customer.id)
    setName(customer.name)
    setIdentification(customer.identification || '')
    setPhone(customer.phone || '')
    setViewMode('edit')
  }

  const handleDeleteClick = (id: string, name: string) => {
    setCustomerToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await removeCustomer(customerToDelete.id)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    const cleanName = name.trim().toLowerCase()
    const cleanId = identification ? identification.trim().toLowerCase() : ''

    // Check for duplicates: nome + identificação (quando existir)
    const duplicate = customers.find(c => {
      // Ignore self if editing
      if (viewMode === 'edit' && c.id === editingId) return false

      const nameMatch = c.name.toLowerCase().trim() === cleanName

      // Se ambos têm identificação, verificar se ambos nome E identificação são iguais
      if (cleanId && c.identification) {
        const idMatch = c.identification.toLowerCase().trim() === cleanId
        return nameMatch && idMatch
      }

      // Se nenhum dos dois tem identificação, verificar apenas o nome
      if (!cleanId && !c.identification) {
        return nameMatch
      }

      // Se apenas um tem identificação, não são duplicados
      return false
    })

    if (duplicate) {
      showToast(`Já existe um cliente cadastrado com o nome "${duplicate.name}"${duplicate.identification ? ` e identificação "${duplicate.identification}"` : ''}.`, 'error')
      return
    }

    setIsSubmitting(true)
    if (viewMode === 'create') {
      await addCustomer({
        name: name.trim(),
        identification: identification.trim(),
        phone: phone.trim(),
      })
    } else if (viewMode === 'edit' && editingId) {
      await updateCustomer(editingId, {
        name: name.trim(),
        identification: identification.trim(),
        phone: phone.trim(),
      })
    }
    setIsSubmitting(false)

    setName('')
    setIdentification('')
    setPhone('')
    setEditingId(null)
    setViewMode('list')
  }

  const handleCancel = () => {
    setName('')
    setIdentification('')
    setPhone('')
    setEditingId(null)
    setViewMode('list')
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {viewMode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
          </h2>
          <Button variant="ghost" onClick={handleCancel}>
            Voltar para lista
          </Button>
        </div>

        <Card title="Dados do cliente">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              label="Identificação"
              name="identification"
              value={identification}
              onChange={(event) => setIdentification(event.target.value)}
            />
            <Input
              label="Telefone"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(XX) XXXXX-XXXX"
            />

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar cliente'}
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
            label="Buscar parceiro"
            placeholder="Nome, identificação ou telefone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="pt-6">
          <Button onClick={() => setViewMode('create')}>Novo Cliente</Button>
        </div>
      </div>

      <Card title="Clientes cadastrados">
        {customers.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum cliente cadastrado ainda.
          </p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum cliente encontrado para "{searchTerm}".
          </p>
        ) : (
          <Table headers={['Nome', 'Identificação', 'Telefone', 'Ações']}>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td
                  className={`px-3 py-2 text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                >
                  {customer.name}
                </td>
                <td
                  className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                >
                  {customer.identification || '-'}
                </td>
                <td
                  className={`px-3 py-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                >
                  {customer.phone || '-'}
                </td>
                <td className="px-3 py-2 text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(customer.id, customer.name)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Dialog
        isOpen={deleteDialogOpen}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir o cliente ${customerToDelete?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  )
}
