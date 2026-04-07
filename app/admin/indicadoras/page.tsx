'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { indicadoras } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'
import { Search, Users, TrendingUp, DollarSign, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function IndicadorasPage() {
  const { leads, commissions } = useData()
  const [search, setSearch] = useState('')

  const indicadorasWithStats = useMemo(() => {
    return indicadoras.map(ind => {
      const indLeads = leads.filter(l => l.indicadoraId === ind.id)
      const closedLeads = indLeads.filter(l => l.status === 'fechado').length
      const totalCommission = commissions
        .filter(c => c.indicadoraId === ind.id)
        .reduce((sum, c) => sum + c.value, 0)

      return {
        ...ind,
        totalLeads: indLeads.length,
        closedLeads,
        totalCommission,
      }
    })
  }, [leads, commissions])

  const filteredIndicadoras = indicadorasWithStats.filter(ind =>
    ind.name.toLowerCase().includes(search.toLowerCase()) ||
    ind.email.toLowerCase().includes(search.toLowerCase()) ||
    ind.referralCode?.toLowerCase().includes(search.toLowerCase())
  )

  // Summary stats
  const totalIndicadoras = indicadoras.length
  const activeIndicadoras = indicadoras.filter(i => i.isActive).length
  const totalLeadsAll = leads.length
  const totalCommissionAll = commissions.reduce((sum, c) => sum + c.value, 0)

  return (
    <ProtectedLayout 
      title="Indicadoras" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Indicadoras' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Gestão de Indicadoras</h1>
          <p className="text-muted-foreground">
            Gerencie as indicadoras do programa
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Indicadoras
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIndicadoras}</div>
              <p className="text-xs text-muted-foreground">
                {activeIndicadoras} ativas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Leads
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeadsAll}</div>
              <p className="text-xs text-muted-foreground">
                gerados pelas indicadoras
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fechamentos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {leads.filter(l => l.status === 'fechado').length}
              </div>
              <p className="text-xs text-muted-foreground">
                vendas concluídas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comissões Geradas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommissionAll)}</div>
              <p className="text-xs text-muted-foreground">
                total acumulado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Código</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Fechamentos</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Comissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicadoras.map((ind) => (
                  <TableRow key={ind.id}>
                    <TableCell className="font-medium">
                      {ind.name}
                      <span className="block sm:hidden text-xs text-muted-foreground">
                        {ind.email}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{ind.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{ind.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary">{ind.referralCode}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{ind.totalLeads}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell font-medium">
                      {ind.closedLeads}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell font-medium">
                      {formatCurrency(ind.totalCommission)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={ind.isActive ? 'default' : 'secondary'}
                        className={cn(
                          ind.isActive 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {ind.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIndicadoras.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma indicadora encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
