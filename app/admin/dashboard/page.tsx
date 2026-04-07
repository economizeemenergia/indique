'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/lib/data-context'
import { indicadoras } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { LEAD_STATUS_LABELS } from '@/lib/constants'
import type { LeadStatus } from '@/lib/types'
import {
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Clock,
  Send,
  Handshake,
  Kanban,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'

const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: '#3b82f6',
  em_analise: '#f59e0b',
  contato_realizado: '#06b6d4',
  proposta_enviada: '#8b5cf6',
  em_negociacao: '#f97316',
  fechado: '#10b981',
  perdido: '#ef4444',
}

export default function AdminDashboard() {
  const { leads, commissions } = useData()

  const stats = useMemo(() => {
    const totalLeads = leads.length
    const newLeads = leads.filter(l => l.status === 'novo').length
    const inAnalysis = leads.filter(l => l.status === 'em_analise').length
    const proposalsSent = leads.filter(l => l.status === 'proposta_enviada').length
    const inNegotiation = leads.filter(l => l.status === 'em_negociacao').length
    const closedLeads = leads.filter(l => l.status === 'fechado').length
    const lostLeads = leads.filter(l => l.status === 'perdido').length
    const totalSalesValue = leads
      .filter(l => l.status === 'fechado')
      .reduce((sum, l) => sum + (l.estimatedProjectValue || 0), 0)
    const totalCommission = commissions.reduce((sum, c) => sum + c.value, 0)

    return {
      totalLeads,
      newLeads,
      inAnalysis,
      proposalsSent,
      inNegotiation,
      closedLeads,
      lostLeads,
      totalSalesValue,
      totalCommission,
    }
  }, [leads, commissions])

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    leads.forEach(lead => {
      counts[lead.status] = (counts[lead.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, value]) => ({
      name: LEAD_STATUS_LABELS[status as LeadStatus],
      value,
      status,
    }))
  }, [leads])

  // Top indicadoras
  const topIndicadoras = useMemo(() => {
    return indicadoras
      .filter(i => i.isActive)
      .map(ind => {
        const indLeads = leads.filter(l => l.indicadoraId === ind.id)
        const closedCount = indLeads.filter(l => l.status === 'fechado').length
        return {
          name: ind.name.split(' ')[0],
          leads: indLeads.length,
          fechados: closedCount,
        }
      })
      .sort((a, b) => b.fechados - a.fechados)
      .slice(0, 5)
  }, [leads])

  // Monthly trend (mock data based on leads)
  const monthlyTrend = useMemo(() => {
    return [
      { month: 'Jan', leads: 2, vendas: 45000 },
      { month: 'Fev', leads: 3, vendas: 52000 },
      { month: 'Mar', leads: 4, vendas: 175000 },
      { month: 'Abr', leads: 5, vendas: 420000 },
      { month: 'Mai', leads: 8, vendas: 227000 },
      { month: 'Jun', leads: 12, vendas: 687000 },
    ]
  }, [])

  return (
    <ProtectedLayout title="Dashboard" requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1>Dashboard Administrativo</h1>
            <p className="text-lg text-muted-foreground font-normal mt-2">
              Visão geral do programa de indicações
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/kanban">
              <Kanban className="h-4 w-4 mr-2" />
              Abrir Kanban
            </Link>
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.inAnalysis}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Propostas
              </CardTitle>
              <Send className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-600">{stats.proposalsSent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Negociação
              </CardTitle>
              <Handshake className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inNegotiation}</div>
            </CardContent>
          </Card>
        </div>

        {/* Results Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fechados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.closedLeads}</div>
              <p className="text-xs text-muted-foreground">vendas concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perdidos
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lostLeads}</div>
              <p className="text-xs text-muted-foreground">não convertidos</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Vendido
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="currency-md">
                {formatCurrency(stats.totalSalesValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">em projetos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comissões
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="currency-md">
                {formatCurrency(stats.totalCommission)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">geradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Distribuição por Status</CardTitle>
              <CardDescription className="text-base mt-1">Leads por etapa do funil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.status}`} 
                          fill={STATUS_COLORS[entry.status as LeadStatus]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Indicadoras */}
          <Card>
            <CardHeader>
              <CardTitle>Top Indicadoras</CardTitle>
              <CardDescription>Por fechamentos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topIndicadoras} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#94a3b8" name="Leads" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="fechados" fill="#10b981" name="Fechados" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leads Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Leads</CardTitle>
              <CardDescription>Leads recebidos por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Vendas</CardTitle>
              <CardDescription>Valor vendido por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area 
                      type="monotone" 
                      dataKey="vendas" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
