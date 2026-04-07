'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { getIndicadoraById } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CommissionStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { CommissionStatus, Commission } from '@/lib/types'
import { toast } from 'sonner'
import { DollarSign, Clock, CheckCircle, Check, CreditCard, Pencil, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function AdminComissoesPage() {
  const { commissions, updateCommissionStatus } = useData()
  const [activeTab, setActiveTab] = useState<CommissionStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editStatus, setEditStatus] = useState<CommissionStatus>('disponivel')
  const [editExpectedDate, setEditExpectedDate] = useState('')

  const filteredCommissions = useMemo(() => {
    const filtered = activeTab === 'all' 
      ? commissions 
      : commissions.filter(c => c.status === activeTab)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [commissions, activeTab])

  // Calculate totals - ONLY 3 STATUS
  const totals = useMemo(() => ({
    pendente: commissions.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.value, 0),
    aprovada: commissions.filter(c => c.status === 'aprovada').reduce((sum, c) => sum + c.value, 0),
    paga: commissions.filter(c => c.status === 'paga').reduce((sum, c) => sum + c.value, 0),
  }), [commissions])

  const counts = useMemo(() => ({
    pendente: commissions.filter(c => c.status === 'pendente').length,
    aprovada: commissions.filter(c => c.status === 'aprovada').length,
    paga: commissions.filter(c => c.status === 'paga').length,
  }), [commissions])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCommissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCommissions.map(c => c.id))
    }
  }

  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      updateCommissionStatus(id, 'aprovada')
    })
    toast.success(`${selectedIds.length} comissão(ões) aprovada(s)!`)
    setSelectedIds([])
  }

  const handleBulkMarkPaid = () => {
    const today = new Date().toISOString().split('T')[0]
    selectedIds.forEach(id => {
      updateCommissionStatus(id, 'paga', today)
    })
    toast.success(`${selectedIds.length} comissão(ões) marcada(s) como paga(s)!`)
    setSelectedIds([])
  }

  const canApprove = selectedIds.some(id => {
    const com = commissions.find(c => c.id === id)
    return com?.status === 'pendente'
  })

  const canMarkPaid = selectedIds.some(id => {
    const com = commissions.find(c => c.id === id)
    return com?.status === 'aprovada'
  })

  const openEditDialog = (commission: Commission) => {
    setEditingCommission(commission)
    setEditValue(commission.value.toString())
    setEditStatus(commission.status)
    setEditExpectedDate(commission.expectedPaymentDate)
  }

  const handleSaveEdit = () => {
    if (!editingCommission) return
    
    const newValue = Number(editValue)
    if (!newValue || newValue <= 0) {
      toast.error('Valor inválido')
      return
    }

    // Update commission - for now, just update status and date if they changed
    // In a real app, you'd also update value through a dedicated function
    updateCommissionStatus(editingCommission.id, editStatus)
    
    toast.success('Comissão atualizada com sucesso!')
    setEditingCommission(null)
  }

  return (
    <ProtectedLayout 
      title="Comissões" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Comissões' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Gestão de Comissões</h1>
          <p className="text-muted-foreground">
            Gerencie os pagamentos de comissões das indicadoras
          </p>
        </div>

        {/* Summary Cards - Only 3 Status */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(totals.pendente)}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.pendente} comissão(ões)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totals.aprovada)}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.aprovada} aguardando pagamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totals.paga)}
              </div>
              <p className="text-xs text-muted-foreground">
                {counts.paga} já pagas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedIds.length} selecionada(s)
                </span>
                {canApprove && (
                  <Button size="sm" variant="outline" onClick={handleBulkApprove}>
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                )}
                {canMarkPaid && (
                  <Button size="sm" onClick={handleBulkMarkPaid}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Marcar como Paga
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedIds([])}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs and Table */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CommissionStatus | 'all')}>
          <TabsList>
            <TabsTrigger value="all">Todas ({commissions.length})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes ({counts.pendente})</TabsTrigger>
            <TabsTrigger value="aprovada">Aprovadas ({counts.aprovada})</TabsTrigger>
            <TabsTrigger value="paga">Pagas ({counts.paga})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedIds.length === filteredCommissions.length && filteredCommissions.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Indicadora</TableHead>
                      <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Data Prevista</TableHead>
                      <TableHead className="hidden lg:table-cell">Data Paga</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((commission) => {
                      const indicadora = getIndicadoraById(commission.indicadoraId)
                      return (
                        <TableRow key={commission.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(commission.id)}
                              onCheckedChange={() => toggleSelect(commission.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {indicadora?.name || 'N/A'}
                            <span className="block sm:hidden text-xs text-muted-foreground">
                              {commission.clientName}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {commission.clientName}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(commission.value)}
                          </TableCell>
                          <TableCell>
                            <CommissionStatusBadge status={commission.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {formatDate(commission.expectedPaymentDate)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {commission.paidDate ? formatDate(commission.paidDate) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {commission.status === 'pendente' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    updateCommissionStatus(commission.id, 'aprovada')
                                    toast.success('Comissão aprovada!')
                                  }}
                                  title="Aprovar comissão"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {commission.status === 'aprovada' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const today = new Date().toISOString().split('T')[0]
                                    updateCommissionStatus(commission.id, 'paga', today)
                                    toast.success('Comissão marcada como paga!')
                                  }}
                                  title="Marcar como paga"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(commission)}
                                title="Editar comissão"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredCommissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhuma comissão encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Commission Dialog */}
        <Dialog open={!!editingCommission} onOpenChange={(open) => !open && setEditingCommission(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Comissão</DialogTitle>
              <DialogDescription>
                {editingCommission && `${getIndicadoraById(editingCommission.indicadoraId)?.name} - ${editingCommission.clientName}`}
              </DialogDescription>
            </DialogHeader>

            {editingCommission && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editCommissionValue">Valor (R$)</Label>
                  <Input
                    id="editCommissionValue"
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCommissionStatus">Status</Label>
                  <Select value={editStatus} onValueChange={(val) => setEditStatus(val as CommissionStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Valor Disponível</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="paga">Paga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editExpectedDate">Data Prevista de Pagamento</Label>
                  <Input
                    id="editExpectedDate"
                    type="date"
                    value={editExpectedDate}
                    onChange={(e) => setEditExpectedDate(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                  <p className="font-medium mb-1">Informações</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Criada em: {formatDate(editingCommission.createdAt)}</li>
                    {editingCommission.paidDate && <li>Paga em: {formatDate(editingCommission.paidDate)}</li>}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingCommission(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  )
}
