'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { getIndicadoraById } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/format'
import type { WithdrawalStatus } from '@/lib/types'
import { toast } from 'sonner'
import { DollarSign, Clock, CheckCircle, Check, CreditCard, Eye, Download } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function AdminSaquesPage() {
  const { withdrawals, updateWithdrawalStatus } = useData()
  const [activeTab, setActiveTab] = useState<WithdrawalStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredWithdrawals = useMemo(() => {
    const filtered = activeTab === 'all' 
      ? withdrawals 
      : withdrawals.filter(w => w.status === activeTab)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [withdrawals, activeTab])

  // Calculate totals
  const totals = useMemo(() => ({
    em_analise: withdrawals.filter(w => w.status === 'em_analise').reduce((sum, w) => sum + w.netAmount, 0),
    aprovado: withdrawals.filter(w => w.status === 'aprovado').reduce((sum, w) => sum + w.netAmount, 0),
    pago: withdrawals.filter(w => w.status === 'pago').reduce((sum, w) => sum + w.netAmount, 0),
  }), [withdrawals])

  const counts = useMemo(() => ({
    em_analise: withdrawals.filter(w => w.status === 'em_analise').length,
    aprovado: withdrawals.filter(w => w.status === 'aprovado').length,
    pago: withdrawals.filter(w => w.status === 'pago').length,
  }), [withdrawals])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredWithdrawals.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredWithdrawals.map(w => w.id))
    }
  }

  const handleApprove = (withdrawalId: string) => {
    updateWithdrawalStatus(withdrawalId, 'aprovado')
    toast.success('Saque aprovado com sucesso')
  }

  const handleMarkPaid = (withdrawalId: string) => {
    const today = new Date().toISOString().split('T')[0]
    updateWithdrawalStatus(withdrawalId, 'pago', today)
    toast.success('Saque marcado como pago')
  }

  const bulkApprove = () => {
    selectedIds.forEach(id => {
      updateWithdrawalStatus(id, 'aprovado')
    })
    setSelectedIds([])
    toast.success(`${selectedIds.length} saque(s) aprovado(s)`)
  }

  const bulkMarkPaid = () => {
    const today = new Date().toISOString().split('T')[0]
    selectedIds.forEach(id => {
      updateWithdrawalStatus(id, 'pago', today)
    })
    setSelectedIds([])
    toast.success(`${selectedIds.length} saque(s) marcado(s) como pago(s)`)
  }

  const getStatusBadgeColor = (status: WithdrawalStatus) => {
    switch (status) {
      case 'em_analise':
        return 'bg-amber-100 text-amber-700'
      case 'aprovado':
        return 'bg-blue-100 text-blue-700'
      case 'pago':
        return 'bg-emerald-100 text-emerald-700'
    }
  }

  const getStatusLabel = (status: WithdrawalStatus) => {
    switch (status) {
      case 'em_analise':
        return 'Em Análise'
      case 'aprovado':
        return 'Aprovado'
      case 'pago':
        return 'Pago'
    }
  }

  const canApprove = selectedIds.some(id => {
    const w = withdrawals.find(x => x.id === id)
    return w?.status === 'em_analise'
  })

  const canMarkPaid = selectedIds.some(id => {
    const w = withdrawals.find(x => x.id === id)
    return w?.status === 'aprovado'
  })

  return (
    <ProtectedLayout 
      title="Gestão de Saques" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Saques' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1>Gestão de Saques</h1>
            <p className="text-lg text-muted-foreground font-normal mt-2">
              Analise e processe solicitações de saque das indicadoras
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(totals.em_analise)}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.em_analise} solicitação(ões)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totals.aprovado)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totals.pago)}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.pago} já pagos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedIds.length} selecionado(s)</span>
              <div className="flex gap-2">
                {canApprove && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkApprove}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                )}
                {canMarkPaid && (
                  <Button
                    size="sm"
                    onClick={bulkMarkPaid}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Marcar como Pago
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs and Table */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WithdrawalStatus | 'all')}>
          <TabsList>
            <TabsTrigger value="all">Todas ({withdrawals.length})</TabsTrigger>
            <TabsTrigger value="em_analise">Em Análise ({counts.em_analise})</TabsTrigger>
            <TabsTrigger value="aprovado">Aprovados ({counts.aprovado})</TabsTrigger>
            <TabsTrigger value="pago">Pagos ({counts.pago})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedIds.length === filteredWithdrawals.length && filteredWithdrawals.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Indicadora</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">Tipo</TableHead>
                      <TableHead className="text-right font-semibold">Valor Bruto</TableHead>
                      <TableHead className="hidden md:table-cell text-right font-semibold">Desconto</TableHead>
                      <TableHead className="text-right font-semibold">Valor Líquido</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-center font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.map((withdrawal) => {
                      const indicadora = getIndicadoraById(withdrawal.indicadoraId)
                      const discountAmount = (withdrawal.grossAmount * withdrawal.discount) / 100
                      return (
                        <TableRow key={withdrawal.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(withdrawal.id)}
                              onCheckedChange={() => toggleSelect(withdrawal.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {indicadora?.name || 'N/A'}
                            <span className="block sm:hidden text-xs text-muted-foreground">
                              {withdrawal.documentType === 'pf' ? 'PF' : 'PJ'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              withdrawal.documentType === 'pf' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            )}>
                              {withdrawal.documentType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(withdrawal.grossAmount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right">
                            {withdrawal.discount > 0 ? `-${formatCurrency(discountAmount)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-primary">
                              {formatCurrency(withdrawal.netAmount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm inline-block',
                              getStatusBadgeColor(withdrawal.status)
                            )}>
                              {getStatusLabel(withdrawal.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {withdrawal.status === 'em_analise' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(withdrawal.id)}
                                  title="Aprovar saque"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {withdrawal.status === 'aprovado' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkPaid(withdrawal.id)}
                                  title="Marcar como pago"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {withdrawal.invoicePath && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  title="Baixar nota fiscal"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Ver detalhes"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredWithdrawals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhuma solicitação de saque encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
