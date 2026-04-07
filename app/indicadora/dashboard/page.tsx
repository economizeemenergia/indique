'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { TrendingUp, CheckCircle, Clock, DollarSign, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export default function IndicadoraDashboard() {
  const { user } = useAuth()
  const { leads, commissions } = useData()
  
  const myLeads = leads.filter(l => l.indicadoraId === user?.id)
  const myCommissions = commissions.filter(c => c.indicadoraId === user?.id)
  
  // Calculate stats
  const totalLeads = myLeads.length
  const leadsInProgress = myLeads.filter(l => !['fechado', 'perdido'].includes(l.status)).length
  const closedLeads = myLeads.filter(l => l.status === 'fechado').length
  const totalCommission = myCommissions.reduce((sum, c) => sum + c.value, 0)
  const paidCommission = myCommissions.filter(c => c.status === 'paga').reduce((sum, c) => sum + c.value, 0)
  
  // Recent leads
  const recentLeads = [...myLeads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  // Status distribution for pie chart
  const statusCounts = myLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }))
  
  const COLORS = ['#4f46e5', '#f97316', '#0ea5e9', '#a855f7', '#f59e0b', '#10b981', '#ef4444']

  // Commission trend data (mock monthly data)
  const commissionTrend = [
    { month: 'Jan', value: 0 },
    { month: 'Fev', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Abr', value: 0 },
    { month: 'Mai', value: paidCommission * 0.3 },
    { month: 'Jun', value: paidCommission * 0.7 },
    { month: 'Jul', value: paidCommission },
  ]

  return (
    <ProtectedLayout title="Dashboard" requiredRole="indicadora">
      <div className="space-y-6">
        {/* Welcome Section - Refined */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-foreground">
              Bem-vindo de volta, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-lg text-muted-foreground font-normal">
              Acompanhe seu desempenho e ganhos em tempo real
            </p>
          </div>
          <Button 
            asChild 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/indicadora/novo-lead" className="inline-flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Indicar Agora
            </Link>
          </Button>
        </div>

        {/* Main Card - Valor Conquistado - Full Width & Premium */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <p className="label-uppercase">Seu Resultado</p>
                <div className="space-y-1">
                  <div className="currency">
                    {formatCurrency(paidCommission)}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Recompensa já conquistada
                  </p>
                </div>
                
                {totalCommission > paidCommission && (
                  <div className="pt-4 border-t border-border/40">
                    <p className="text-xs text-muted-foreground mb-2">Em análise/aprovação:</p>
                    <p className="currency-md">
                      {formatCurrency(totalCommission - paidCommission)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-primary text-primary-foreground rounded-lg p-4 flex-shrink-0">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
            
            <div className="h-px bg-border/40 my-6" />
            
            <p className="text-sm text-foreground font-medium leading-relaxed">
              Continue indicando para aumentar seus resultados.<br />
              <span className="text-muted-foreground">Quanto mais você indica, maiores suas chances de fechamento.</span>
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats - Compact Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/40 hover:border-border/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total de Leads
                </p>
                <TrendingUp className="h-4 w-4 text-primary/60" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-2">indicações enviadas</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 hover:border-border/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Em Andamento
                </p>
                <Clock className="h-4 w-4 text-amber-600/60" />
              </div>
              <div className="text-3xl font-bold text-foreground">{leadsInProgress}</div>
              <p className="text-xs text-muted-foreground mt-2">aguardando resultado</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 hover:border-border/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Fechados
                </p>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">{closedLeads}</div>
              <p className="text-xs text-muted-foreground mt-2">vendas concluídas</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 hover:border-border/60 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Conversão
                </p>
                <Zap className="h-4 w-4 text-orange-600/60" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">de leads convertidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Leads */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Leads Table */}
          <Card className="lg:col-span-2 shadow-sm border-border/40">
            <CardHeader className="pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-lg font-semibold">Indicações Recentes</CardTitle>
                <CardDescription className="text-xs mt-1">Suas últimas 5 indicações</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentLeads.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="font-semibold text-xs">Cliente</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold text-xs">Cidade</TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold text-xs">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow key={lead.id} className="border-b border-border/40 hover:bg-muted/30">
                          <TableCell className="font-medium text-sm py-3">{lead.clientName}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{lead.city}</TableCell>
                          <TableCell className="py-3">
                            <LeadStatusBadge status={lead.status} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-sm mb-3">Você ainda não tem indicações.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/indicadora/novo-lead">Fazer primeira indicação</Link>
                  </Button>
                </div>
              )}
              {recentLeads.length > 0 && (
                <div className="p-4 border-t border-border/40 bg-muted/20 text-center">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href="/indicadora/minhas-indicacoes">Ver todas as indicações</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-sm border-border/40">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg font-semibold">Distribuição de Status</CardTitle>
              <CardDescription className="text-xs mt-1">Seus leads por etapa</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {pieData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  Sem dados
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Commission Trend */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-lg font-semibold">Evolução das Comissões</CardTitle>
            <CardDescription className="text-xs mt-1">Comissões pagas ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commissionTrend}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} className="text-xs" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
