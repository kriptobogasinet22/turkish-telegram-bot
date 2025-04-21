"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeftRight, Users, Activity, Settings } from "lucide-react"

export default function AdminPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Mock data for demonstration
  const users = [
    { id: "1", name: "Ahmet", username: "@ahmet123", transactions: 15 },
    { id: "2", name: "Mehmet", username: "@mehmet456", transactions: 8 },
    { id: "3", name: "Ayşe", username: "@ayse789", transactions: 23 },
    { id: "4", name: "Fatma", username: "@fatma012", transactions: 5 },
  ]

  const transactions = [
    { id: "1", userId: "1", type: "TRY TO BTC", amount: "1000 TRY", result: "0.0012 BTC", date: "2023-04-22 14:30" },
    { id: "2", userId: "1", type: "DOGE TO TRY", amount: "500 DOGE", result: "750 TRY", date: "2023-04-22 15:45" },
    { id: "3", userId: "2", type: "TRY TO USDT", amount: "5000 TRY", result: "158.23 USDT", date: "2023-04-21 09:15" },
    { id: "4", userId: "3", type: "TRX TO TRY", amount: "1000 TRX", result: "2350 TRY", date: "2023-04-20 11:20" },
    { id: "5", userId: "3", type: "TRY TO DOGE", amount: "500 TRY", result: "333.33 DOGE", date: "2023-04-20 12:30" },
  ]

  const filteredTransactions = selectedUser ? transactions.filter((t) => t.userId === selectedUser) : transactions

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 bg-gray-800">
            <div className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              <span>İşlemler</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Kullanıcılar</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
            <div className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Ayarlar</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">İşlem Takibi</h1>
          <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSelectedUser(value === "all" ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kullanıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>Rapor İndir</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Toplam Kullanıcı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Toplam İşlem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Günlük İşlem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
            <CardDescription>
              {selectedUser
                ? `${users.find((u) => u.id === selectedUser)?.name} kullanıcısının işlemleri`
                : "Tüm kullanıcıların işlemleri"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>İşlem Tipi</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Sonuç</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{users.find((u) => u.id === transaction.userId)?.name}</TableCell>
                    <TableCell className="flex items-center">
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      {transaction.type}
                    </TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.result}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
