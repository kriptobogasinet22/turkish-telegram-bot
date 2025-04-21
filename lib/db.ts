// This is a mock database implementation
// In a real application, you would use a real database like MongoDB, PostgreSQL, or Supabase

interface User {
  id: number
  username: string
  firstName?: string
  lastName?: string
  joinDate: string
}

interface Transaction {
  id?: string
  userId: number
  username: string
  type: string
  amount: string
  result: string
  date: string
}

// Mock data storage
const users: User[] = []
const transactions: Transaction[] = []

// User functions
export async function saveUser(user: User): Promise<User> {
  // Check if user already exists
  const existingUserIndex = users.findIndex((u) => u.id === user.id)

  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...user,
    }
    return users[existingUserIndex]
  } else {
    // Add new user
    users.push(user)
    return user
  }
}

export async function getUser(userId: number): Promise<User | null> {
  return users.find((u) => u.id === userId) || null
}

export async function getAllUsers(): Promise<User[]> {
  return [...users]
}

// Transaction functions
export async function saveTransaction(transaction: Transaction): Promise<Transaction> {
  const newTransaction = {
    ...transaction,
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  }

  transactions.push(newTransaction)
  return newTransaction
}

export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  return transactions.filter((t) => t.userId === userId)
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return [...transactions]
}

// Statistics functions
export async function getStats() {
  return {
    totalUsers: users.length,
    totalTransactions: transactions.length,
    dailyTransactions: transactions.filter((t) => {
      const today = new Date().toISOString().split("T")[0]
      return t.date.startsWith(today)
    }).length,
  }
}
