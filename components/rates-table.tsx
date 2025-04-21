"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type Rate = {
  id: number
  currency: string
  try_rate: number
  last_updated: string
}

export default function RatesTable() {
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    setLoading(true)

    const { data, error } = await supabase.from("rates").select("*").order("currency")

    if (error) {
      console.error("Dönüşüm oranları alınamadı:", error)
    } else {
      setRates(data || [])
    }

    setLoading(false)
  }

  const handleEdit = (rate: Rate) => {
    setEditingId(rate.id)
    setEditValue(rate.try_rate.toString())
  }

  const handleSave = async (id: number) => {
    try {
      const newRate = Number.parseFloat(editValue)

      if (isNaN(newRate) || newRate <= 0) {
        toast({
          title: "Hata",
          description: "Geçerli bir oran giriniz.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("rates")
        .update({
          try_rate: newRate,
          last_updated: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        toast({
          title: "Hata",
          description: "Oran güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Başarılı",
          description: "Dönüşüm oranı güncellendi.",
        })
        fetchRates()
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setEditingId(null)
    }
  }

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
        <CardTitle>Dönüşüm Oranları</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Para Birimi</TableHead>
                  <TableHead>TRY Değeri</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.currency}</TableCell>
                    <TableCell>
                      {editingId === rate.id ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-32"
                        />
                      ) : (
                        rate.try_rate
                      )}
                    </TableCell>
                    <TableCell>{formatDate(rate.last_updated)}</TableCell>
                    <TableCell>
                      {editingId === rate.id ? (
                        <Button onClick={() => handleSave(rate.id)}>Kaydet</Button>
                      ) : (
                        <Button variant="outline" onClick={() => handleEdit(rate)}>
                          Düzenle
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Toaster />
      </CardContent>
    </Card>
  )
}
