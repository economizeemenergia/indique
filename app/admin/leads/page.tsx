'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { indicadoras, getIndicadoraById } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { LeadStatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/format'
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS, LEAD_STATUS_ORDER, BRAZILIAN_STATES } from '@/lib/constants'
import type { LeadStatus, Lead } from '@/lib/types'
import { toast } from 'sonner'
import { Search, Filter, X, Eye, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLeadsPage() {
  const { user } = useAuth()
  const { leads, leadMovements, updateLeadStatus, updateLead } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [indicadoraFilter, setIndicadoraFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editProjectValue, setEditProjectValue] = useState('')
  const [editPowerInKw, setEditPowerInKw] = useState('')

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        const matchesSearch = 
          lead.clientName.toLowerCase().includes(search.toLowerCase()) ||
          lead.phone.includes(search) ||
          lead.city.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
        const matchesIndicadora = indicadoraFilter === 'all' || lead.indicadoraId === indicadoraFilter
        const matchesType = typeFilter === 'all' || lead.leadType === typeFilter
        const matchesState = stateFilter === 'all' || lead.state === stateFilter
        return matchesSearch && matchesStatus && matchesIndicadora && matchesType && matchesState
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [leads, search, statusFilter, indicadoraFilter, typeFilter, stateFilter])

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setIndicadoraFilter('all')
    setTypeFilter('all')
    setStateFilter('all')
  }

  const hasActiveFilters = statusFilter !== 'all' || indicadoraFilter !== 'all' || typeFilter !== 'all' || stateFilter !== 'all'

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setEditNotes(lead.notes || '')
    setEditProjectValue(lead.estimatedProjectValue?.toString() || '')
    setEditPowerInKw(lead.powerInKw?.toString() || '')
  }

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (selectedLead && user) {
      // Validate power value when closing
      if (newStatus === 'fechado' && selectedLead.status !== 'fechado') {
        const powerValue = Number(editPowerInKw)
        if (!powerValue || powerValue <= 0) {
          toast.error('Defina a potência em kW antes de fechar o lead')
          return
        }
        // Update the lead with power value before changing status
        updateLead(selectedLead.id, {
          powerInKw: powerValue,
        })
      }
      
      updateLeadStatus(selectedLead.id, newStatus, user.id, user.name)
      setSelectedLead({ ...selectedLead, status: newStatus })
      toast.success('Status atualizado!')
    }
  }

  const handleSaveChanges = () => {
    if (selectedLead) {
      updateLead(selectedLead.id, {
        notes: editNotes,
        estimatedProjectValue: Number(editProjectValue) || undefined,
        powerInKw: Number(editPowerInKw) || undefined,
      })
      toast.success('Lead atualizado com sucesso!')
    }
  }

  const selectedLeadMovements = selectedLead
    ? leadMovements
        .filter(m => m.leadId === selectedLead.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []

  return (
    <ProtectedLayout 
      title="Todos os Leads" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Todos os Leads' }]}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Todos os Leads</h1>
            <p className="text-muted-foreground">
              {filteredLeads.length} de {leads.length} lead(s)
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(hasActiveFilters && 'border-primary text-primary')}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 px-1.5">
                  {[statusFilter, indicadoraFilter, typeFilter, stateFilter].filter(f => f !== 'all').length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {LEAD_STATUS_ORDER.map((status) => (
                        <SelectItem key={status} value={status}>
                          {LEAD_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Indicadora</Label>
                  <Select value={indicadoraFilter} onValueChange={setIndicadoraFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {indicadoras.map((ind) => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="hidden md:table-cell">Localização</TableHead>
                  <TableHead className="hidden lg:table-cell">Indicadora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Valor Projeto</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const indicadora = getIndicadoraById(lead.indicadoraId)
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.clientName}
                        <span className="block sm:hidden text-xs text-muted-foreground">
                          {lead.phone}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{lead.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead.city}, {lead.state}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {indicadora?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {lead.estimatedProjectValue ? formatCurrency(lead.estimatedProjectValue) : '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openLeadDetail(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lead Detail Sheet - Redesigned */}
        <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto p-0">
            {selectedLead && (
              <div className="flex flex-col h-full">
                {/* Header with Lead Name and Status */}
                <div className="sticky top-0 bg-white border-b p-6 pb-4">
                  <SheetHeader className="space-y-3">
                    <div>
                      <SheetTitle className="text-2xl">{selectedLead.clientName}</SheetTitle>
                      <SheetDescription className="text-base mt-2">Gerenciar indicação</SheetDescription>
                    </div>
                  </SheetHeader>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Status Section - Highlighted */}
                  <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/20 rounded-lg p-4 space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Status Atual</Label>
                    <Select 
                      value={selectedLead.status} 
                      onValueChange={(value) => handleStatusChange(value as LeadStatus)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUS_ORDER.map((status) => (
                          <SelectItem key={status} value={status}>
                            {LEAD_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client Information Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Dados do Cliente</h3>
                    <Card className="border">
                      <CardContent className="pt-4 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Telefone</p>
                            <p className="font-medium">{selectedLead.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Localização</p>
                            <p className="font-medium">{selectedLead.city}, {selectedLead.state}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Tipo de Imóvel</p>
                            <Badge variant="outline" className="w-fit">{LEAD_TYPE_LABELS[selectedLead.leadType]}</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Conta de Luz Média</p>
                            <p className="font-medium">{formatCurrency(selectedLead.avgElectricityBill)}</p>
                          </div>
                        </div>
                        {selectedLead.bestContactTime && (
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Melhor Horário para Contato</p>
                            <p className="font-medium">{selectedLead.bestContactTime}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Indicadora Information Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Indicadora Responsável</h3>
                    <Card className="border">
                      <CardContent className="pt-4 space-y-3 text-sm">
                        {(() => {
                          const ind = getIndicadoraById(selectedLead.indicadoraId)
                          return ind ? (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">Nome</p>
                                <p className="font-medium">{ind.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                                <p className="font-medium text-xs break-all">{ind.email}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-muted-foreground font-medium mb-1">Código de Indicação</p>
                                <Badge variant="secondary" className="font-mono">{ind.referralCode}</Badge>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Indicadora não encontrada</p>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Project Values Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Valores do Projeto</h3>
                    <Card className="border bg-primary/2">
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="projectValue" className="text-xs font-semibold">Valor Estimado (R$)</Label>
                            <Input
                              id="projectValue"
                              type="number"
                              value={editProjectValue}
                              onChange={(e) => setEditProjectValue(e.target.value)}
                              placeholder="0,00"
                              className="font-medium text-base"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="powerInKw" className="text-xs font-semibold">
                              Potência (kW)
                              {selectedLead.status !== 'fechado' && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id="powerInKw"
                              type="number"
                              value={editPowerInKw}
                              onChange={(e) => setEditPowerInKw(e.target.value)}
                              placeholder="0,0"
                              disabled={selectedLead.status === 'fechado'}
                              step="0.1"
                              className="font-medium text-base"
                            />
                          </div>
                        </div>
                        {selectedLead.status === 'fechado' && selectedLead.powerInKw && (
                          <div className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-xs text-green-900">
                              <span className="font-bold">✓ Potência registrada:</span> {selectedLead.powerInKw} kW - Comissão: {formatCurrency(selectedLead.powerInKw)}
                            </p>
                          </div>
                        )}
                        {selectedLead.status !== 'fechado' && editPowerInKw && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-xs text-blue-900">
                              <span className="font-bold">💡 Simulação:</span> Ao fechar com {editPowerInKw} kW, comissão será de {formatCurrency(Number(editPowerInKw))} para {getIndicadoraById(selectedLead.indicadoraId)?.name}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Observations Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Observações</h3>
                    <Textarea
                      id="notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      placeholder="Adicione observações internas sobre este lead..."
                      className="resize-none"
                    />
                  </div>

                  {/* Movement History Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Histórico de Movimentações</h3>
                    <Card className="border">
                      <CardContent className="pt-4">
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {selectedLeadMovements.map((mov, index) => (
                            <div key={mov.id} className="flex items-start gap-3">
                              <div className="relative">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                {index < selectedLeadMovements.length - 1 && (
                                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                  <LeadStatusBadge status={mov.toStatus} />
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(mov.createdAt)} - {mov.userName}
                                </p>
                                {mov.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    {mov.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedLeadMovements.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma movimentação registrada</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Fixed Footer - Save Button */}
                <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLead(null)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="flex-1"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedLayout>
  )
}
