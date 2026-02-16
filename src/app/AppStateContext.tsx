import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext'
import type { ReactNode } from 'react'
import type {
  Credentials,
  Customer,
  Product,
  StockMovement,
  User,
} from '../domain/models'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

interface AppStateContextValue {
  user: User | null
  customers: Customer[]
  products: Product[]
  stockMovements: StockMovement[]
  login: (credentials: Credentials) => Promise<boolean>
  logout: () => void
  addCustomer: (input: Omit<Customer, 'id'>) => Promise<void>
  updateCustomer: (id: string, input: Partial<Omit<Customer, 'id'>>) => Promise<void>
  removeCustomer: (id: string) => Promise<void>
  addProduct: (input: Omit<Product, 'id' | 'stockQuantity' | 'costPrice'> & { stockQuantity?: number, costPrice?: number }) => Promise<void>
  updateProduct: (id: string, input: Partial<Omit<Product, 'id' | 'stockQuantity'>>) => Promise<void>
  removeProduct: (id: string) => Promise<void>
  addStockMovement: (input: Omit<StockMovement, 'id' | 'date' | 'totalValue'> & { date?: string }) => Promise<void>
  updateStockMovement: (id: string, input: Partial<Omit<StockMovement, 'id' | 'date' | 'totalValue'>> & { date?: string }) => Promise<void>
  removeStockMovement: (id: string) => Promise<void>
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const { showToast } = useToast()

  // Effect para Monitorar Autenticação
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined

    import('../infrastructure/firebase/config').then(({ auth }) => {
      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || 'Usuário',
            email: firebaseUser.email || '',
            role: 'admin',
          })
        } else {
          setUser(null)
          setCustomers([])
          setProducts([])
          setStockMovements([])
        }
      })
    }).catch(console.error)

    return () => {
      if (unsubscribeAuth) unsubscribeAuth()
    }
  }, [])

  // Effect para Monitorar Dados (Só roda quando tem usuário)
  useEffect(() => {
    if (!user) return

    let unsubscribeCustomers: (() => void) | undefined
    let unsubscribeProducts: (() => void) | undefined
    let unsubscribeMovements: (() => void) | undefined

    const setupListeners = async () => {
      try {
        const { db } = await import('../infrastructure/firebase/config')
        const { onSnapshot, collection, query, orderBy } = await import('firebase/firestore')

        // Real-time listener for customers
        unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
          const customersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Customer[]
          setCustomers(customersData)
        }, (error) => {
          console.error("Erro ao buscar clientes:", error)
          if (error.code === 'permission-denied') {
            showToast('Sem permissão para visualizar clientes.', 'error')
          }
        })

        // Real-time listener for products
        unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
          setProducts(productsData)
        }, (error) => {
          console.error("Erro ao buscar produtos:", error)
        })

        // Real-time listener for stock movements
        const q = query(collection(db, 'stock_movements'), orderBy('date', 'desc'))
        unsubscribeMovements = onSnapshot(q, (snapshot) => {
          const movementsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as StockMovement[]
          setStockMovements(movementsData)
        }, (error) => {
          console.error("Erro ao buscar movimentações:", error)
        })

      } catch (error) {
        console.error("Erro ao configurar listeners:", error)
      }
    }

    setupListeners()

    // Cleanup function
    return () => {
      if (unsubscribeCustomers) unsubscribeCustomers()
      if (unsubscribeProducts) unsubscribeProducts()
      if (unsubscribeMovements) unsubscribeMovements()
    }
  }, [user]) // Dependência: user. Roda quando o usuário loga/desloga.

  const login = async (credentials: Credentials) => {
    try {
      const { auth } = await import('../infrastructure/firebase/config')
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      showToast('Login realizado com sucesso!', 'success')
      return true
    } catch (error) {
      console.error('Login error:', error)
      showToast('Erro ao realizar login. Verifique suas credenciais.', 'error')
      return false
    }
  }

  const logout = async () => {
    try {
      const { auth } = await import('../infrastructure/firebase/config')
      await signOut(auth)
      setUser(null)
      showToast('Logout realizado com sucesso!', 'info')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const addCustomer = async (input: Omit<Customer, 'id'>) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { collection, addDoc } = await import('firebase/firestore')
      await addDoc(collection(db, 'customers'), input)
      showToast(`Cliente ${input.name} cadastrado com sucesso!`, 'success')
    } catch (error) {
      console.error('Error adding customer:', error)
      showToast('Erro ao cadastrar cliente. Tente novamente.', 'error')
    }
  }

  const updateCustomer = async (id: string, input: Partial<Omit<Customer, 'id'>>) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, updateDoc } = await import('firebase/firestore')
      const customerRef = doc(db, 'customers', id)
      await updateDoc(customerRef, input)
      showToast('Cliente atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Error updating customer:', error)
      showToast('Erro ao atualizar cliente. Tente novamente.', 'error')
    }
  }

  const removeCustomer = async (id: string) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, deleteDoc } = await import('firebase/firestore')
      const customerRef = doc(db, 'customers', id)
      await deleteDoc(customerRef)
      showToast('Cliente removido com sucesso!', 'success')
    } catch (error) {
      console.error('Error removing customer:', error)
      showToast('Erro ao remover cliente. Tente novamente.', 'error')
    }
  }

  const addProduct = async (
    input: Omit<Product, 'id' | 'stockQuantity' | 'costPrice'> & { stockQuantity?: number, costPrice?: number },
  ) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { collection, addDoc } = await import('firebase/firestore')

      const newProduct = {
        ...input,
        stockQuantity: input.stockQuantity ?? 0,
        costPrice: input.costPrice ?? 0,
      }

      await addDoc(collection(db, 'products'), newProduct)
      showToast(`Produto ${input.name} cadastrado com sucesso!`, 'success')
    } catch (error) {
      console.error('Error adding product:', error)
      showToast('Erro ao cadastrar produto. Tente novamente.', 'error')
    }
  }

  const updateProduct = async (id: string, input: Partial<Omit<Product, 'id' | 'stockQuantity' | 'costPrice'>>) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, updateDoc } = await import('firebase/firestore')
      const productRef = doc(db, 'products', id)
      await updateDoc(productRef, input)
      showToast('Produto atualizado com sucesso!', 'success')
    } catch (error) {
      console.error('Error updating product:', error)
      showToast('Erro ao atualizar produto. Tente novamente.', 'error')
    }
  }

  const removeProduct = async (id: string) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, deleteDoc } = await import('firebase/firestore')
      const productRef = doc(db, 'products', id)
      await deleteDoc(productRef)
      showToast('Produto removido com sucesso!', 'success')
    } catch (error) {
      console.error('Error removing product:', error)
      showToast('Erro ao remover produto. Tente novamente.', 'error')
    }
  }

  const addStockMovement = async (
    input: Omit<StockMovement, 'id' | 'date' | 'totalValue'> & { date?: string },
  ) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { collection, doc, runTransaction } = await import('firebase/firestore')

      const newMovement: any = {
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        date: input.date ?? new Date().toISOString(),
        totalValue: (input.unitPrice || 0) * input.quantity,
      }

      if (input.customerId) {
        newMovement.customerId = input.customerId
      }

      if (input.unitPrice !== undefined) {
        newMovement.unitPrice = input.unitPrice
      }

      if (input.originalPrice !== undefined) {
        newMovement.originalPrice = input.originalPrice
      }

      if (input.discount !== undefined) {
        newMovement.discount = input.discount
      }

      if (input.isPaid !== undefined) {
        newMovement.isPaid = input.isPaid
      }

      await runTransaction(db, async (transaction) => {
        // Create ref for new movement
        const movementRef = doc(collection(db, 'stock_movements'))

        // Get product to update stock
        const productRef = doc(db, 'products', input.productId)
        const productDoc = await transaction.get(productRef)

        if (!productDoc.exists()) {
          throw new Error('Produto não encontrado')
        }

        const productData = productDoc.data()
        const currentStock = productData.stockQuantity || 0
        const currentCost = productData.costPrice || 0 // Average cost

        const delta = input.type === 'in' ? input.quantity : -input.quantity
        const newStock = currentStock + delta

        if (newStock < 0) {
          throw new Error('Estoque insuficiente para esta saída')
        }

        let newAverageCost = currentCost

        // Calculate Weighted Average Cost for purchases ('in')
        if (input.type === 'in' && input.unitPrice) {
          const totalCurrentValue = currentStock * currentCost
          const purchaseValue = input.quantity * input.unitPrice
          newAverageCost = (totalCurrentValue + purchaseValue) / (currentStock + input.quantity)
        }

        // Apply operations
        transaction.set(movementRef, newMovement)
        transaction.update(productRef, {
          stockQuantity: newStock,
          costPrice: newAverageCost
        })
      })

      showToast('Movimentação registrada com sucesso!', 'success')
    } catch (error: any) {
      console.error('Error adding stock movement:', error)
      showToast(error.message || 'Erro ao registrar movimentação.', 'error')
    }
  }

  const removeStockMovement = async (id: string) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, runTransaction } = await import('firebase/firestore')

      await runTransaction(db, async (transaction) => {
        const movementRef = doc(db, 'stock_movements', id)
        const movementDoc = await transaction.get(movementRef)

        if (!movementDoc.exists()) {
          throw new Error('Movimentação não encontrada')
        }

        const movement = movementDoc.data() as StockMovement
        const productRef = doc(db, 'products', movement.productId)
        const productDoc = await transaction.get(productRef)

        if (productDoc.exists()) {
          const currentStock = productDoc.data().stockQuantity || 0
          // Reverse: if it was IN, we subtract. If OUT, we add.
          const reverseDelta = movement.type === 'in' ? -movement.quantity : movement.quantity
          const newStock = currentStock + reverseDelta

          transaction.update(productRef, { stockQuantity: newStock })
        }

        transaction.delete(movementRef)
      })

      showToast('Movimentação removida com sucesso!', 'success')
    } catch (error: any) {
      console.error('Error removing stock movement:', error)
      showToast('Erro ao remover movimentação.', 'error')
    }
  }

  const updateStockMovement = async (
    id: string,
    input: Partial<Omit<StockMovement, 'id' | 'date' | 'totalValue'>> & { date?: string }
  ) => {
    try {
      const { db } = await import('../infrastructure/firebase/config')
      const { doc, runTransaction } = await import('firebase/firestore')

      await runTransaction(db, async (transaction) => {
        const movementRef = doc(db, 'stock_movements', id)
        const movementDoc = await transaction.get(movementRef)

        if (!movementDoc.exists()) {
          throw new Error('Movimentação não encontrada')
        }

        const oldMovement = movementDoc.data() as StockMovement
        const newMovementData = { ...oldMovement, ...input }

        // Recalculate total value if price or qty changed
        if (input.unitPrice !== undefined || input.quantity !== undefined) {
          newMovementData.totalValue = (newMovementData.unitPrice || 0) * newMovementData.quantity
        }

        // If product changed, we need to update TWO products. Too complex for now.
        // Assume productId cannot be changed in update (block in UI).
        if (input.productId && input.productId !== oldMovement.productId) {
          throw new Error('Não é possível alterar o produto de uma movimentação. Remova e crie novamente.')
        }

        const productRef = doc(db, 'products', oldMovement.productId)
        const productDoc = await transaction.get(productRef)

        if (productDoc.exists()) {
          const currentStock = productDoc.data().stockQuantity || 0

          // Revert old effect
          const oldDelta = oldMovement.type === 'in' ? oldMovement.quantity : -oldMovement.quantity
          // Apply new effect
          const newDelta = newMovementData.type === 'in' ? newMovementData.quantity : -newMovementData.quantity

          const netStockChange = newDelta - oldDelta
          const newStock = currentStock + netStockChange

          if (newStock < 0) {
            throw new Error('A edição resultaria em estoque negativo.')
          }

          transaction.update(productRef, { stockQuantity: newStock })
        }

        transaction.update(movementRef, newMovementData)
      })

      showToast('Movimentação atualizada com sucesso!', 'success')
    } catch (error: any) {
      console.error('Error updating stock movement:', error)
      showToast(error.message || 'Erro ao atualizar movimentação.', 'error')
    }
  }

  const value = useMemo(
    () => ({
      user,
      customers,
      products,
      stockMovements,
      login,
      logout,
      addCustomer,
      updateCustomer,
      removeCustomer,
      addProduct,
      updateProduct,
      removeProduct,
      addStockMovement,
      updateStockMovement,
      removeStockMovement,
    }),
    [user, customers, products, stockMovements],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) {
    throw new Error('useAppState deve ser usado dentro de AppStateProvider')
  }
  return ctx
}
