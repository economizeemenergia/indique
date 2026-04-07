'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/common/status-badge'
import { formatDate, formatCurrency } from '@/lib/format'
import { LEAD_TYPE_LABELS } from '@/lib/constants'
import { UserPlus, Search, Eye } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

export default function MinhasIndicacoesPage() {
  const { user } = useAuth()
  const { leads, leadMovements } = useData()
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  
  const myLeads = leads
    .filter(l => l.indicadoraId === user?.id)
    .filter(l => 
      l.clientName.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const selectedLeadData = leads.find(l => l.id === selectedLead)
  const selectedLeadMovements = leadMovements
    .filter(m => m.leadId === selectedLead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <ProtectedLayout 
      title="Minhas Indicações" 
      requiredRole="indicadora"
      breadcrumbs={[{ label: 'Minhas Indicações' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Minhas Indicações</h1>
            <p className="text-muted-foreground">
              {myLeads.length} indicação(ões) encontrada(s)
            </p>
          </div>
          <Button asChild>
            <Link href="/indicadora/novo-lead">
              <UserPlus className="h-4 w-4 mr-2" />
              Nova Indicação
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cidade ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {myLeads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                    <TableHead className="hidden md:table-cell">Cidade</TableHead>
                    <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.clientName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{lead.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{lead.city}, {lead.state}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{LEAD_TYPE_LABELS[lead.leadType]}</Badge>
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedLead(lead.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {search ? 'Nenhuma indicação encontrada para essa busca.' : 'Você ainda não tem indicações.'}
                </p>
                {!search && (
                  <Button asChild>
                    <Link href="/indicadora/novo-lead">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Fazer primeira indicação
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Detail Sheet */}
        <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            {selectedLeadData && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedLeadData.clientName}</SheetTitle>
                  <SheetDescription>Detalhes da indicação</SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <LeadStatusBadge status={selectedLeadData.status} />
                  </div>

                  {/* Contact Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Dados de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span>{selectedLeadData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cidade:</span>
                        <span>{selectedLeadData.city}, {selectedLeadData.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span>{LEAD_TYPE_LABELS[selectedLeadData.leadType]}</span>
                      </div>
                      {selectedLeadData.avgElectricityBill > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conta de Luz:</span>
                          <span>{formatCurrency(selectedLeadData.avgElectricityBill)}</span>
                        </div>
                      )}
                      {selectedLeadData.bestContactTime && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Melhor Horário:</span>
                          <span>{selectedLeadData.bestContactTime}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  {selectedLeadData.notes && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedLeadData.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Commission Info */}
                  {selectedLeadData.status === 'fechado' && selectedLeadData.commissionValue && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-primary">Comissão</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor do Projeto:</span>
                          <span>{formatCurrency(selectedLeadData.estimatedProjectValue || 0)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Sua Comissão:</span>
                          <span className="text-primary">{formatCurrency(selectedLeadData.commissionValue)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Movement History */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Histórico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedLeadMovements.map((mov, index) => (
                          <div key={mov.id} className="flex items-start gap-3">
                            <div className="relative">
                              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                              {index < selectedLeadMovements.length - 1 && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
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
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </ProtectedLayout>
  )
}
