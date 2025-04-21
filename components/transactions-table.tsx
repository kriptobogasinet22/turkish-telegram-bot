"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Transaction = {
  id: number
  user_id: number
  from_currency: string
  to_currency: string
  from_amount: number
  to_amount: number
  created_at: string
  chat_type: string
  users: {
    username: string
    first_name: string
    last_name: string
  } | null
}

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [chatTypeFilter, setChatTypeFilter] = useState<string>("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)

      let query = supabase
        .from("transactions")
        .select(`
          *,
          users:user_id (
            username,
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (chatTypeFilter !== "all") {
        query = query.eq("chat_type", chatTypeFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error("İşlemler alınamadı:", error)
      } else {
        setTransactions(data || [])
      }

      setLoading(false)
    }

    fetchTransactions()
  }, [chatTypeFilter])

  const filteredTransactions = transactions.filter((transaction) => {
    if (!filter) return true

    const searchTerm = filter.toLowerCase()
    const username = transaction.users?.username?.toLowerCase() || ""
    const firstName = transaction.users?.first_name?.toLowerCase() || ""
    const lastName = transaction.users?.last_name?.toLowerCase() || ""

    return (
      username.includes(searchTerm) ||
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      transaction.from_currency.toLowerCase().includes(searchTerm) ||
      transaction.to_currency.toLowerCase().includes(searchTerm) ||
      transaction.user_id.toString().includes(searchTerm)
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tüm İşlemler</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Kullanıcı adı, para birimi veya kullanıcı ID'si ile ara..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select value={chatTypeFilter} onValueChange={setChatTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sohbet tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="private">Özel Mesaj</SelectItem>
                <SelectItem value="group">Grup</SelectItem>
                <SelectItem value="supergroup">Süper Grup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Dönüşüm</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Sonuç</TableHead>
                  <TableHead>Sohbet Tipi</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      İşlem bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        {transaction.users?.username
                          ? `@${transaction.users.username}`
                          : `${transaction.users?.first_name || ""} ${transaction.users?.last_name || ""}`}
                        <div className="text-xs text-gray-500">ID: {transaction.user_id}</div>
                      </TableCell>
                      <TableCell>
                        {transaction.from_currency} → {transaction.to_currency}
                      </TableCell>
                      <TableCell>{transaction.from_amount}</TableCell>
                      <TableCell>{transaction.to_amount}</TableCell>
                      <TableCell>{transaction.chat_type === "private" ? "Özel" : "Grup"}</TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
