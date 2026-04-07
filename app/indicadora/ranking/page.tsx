'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { indicadoras } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import { Trophy, Medal, Award, TrendingUp, Crown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RankingPage() {
  const { user } = useAuth()
  const { leads, commissions } = useData()

  const rankings = useMemo(() => {
    return indicadoras
      .filter(i => i.isActive)
      .map(indicadora => {
        const indicadoraLeads = leads.filter(l => l.indicadoraId === indicadora.id)
        const closedLeads = indicadoraLeads.filter(l => l.status === 'fechado')
        const totalCommission = commissions
          .filter(c => c.indicadoraId === indicadora.id)
          .reduce((sum, c) => sum + c.value, 0)

        return {
          indicadoraId: indicadora.id,
          indicadoraName: indicadora.name,
          totalLeads: indicadoraLeads.length,
          closedLeads: closedLeads.length,
          totalCommission,
        }
      })
      .sort((a, b) => {
        if (b.closedLeads !== a.closedLeads) return b.closedLeads - a.closedLeads
        return b.totalCommission - a.totalCommission
      })
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }))
  }, [leads, commissions])

  const currentUserRanking = rankings.find(r => r.indicadoraId === user?.id)
  const top3 = rankings.slice(0, 3)

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 3:
        return <Award className="h-8 w-8 text-orange-500" />
      default:
        return null
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-50 to-yellow-100 border-yellow-300'
      case 2:
        return 'from-slate-50 to-slate-100 border-slate-300'
      case 3:
        return 'from-orange-50 to-orange-100 border-orange-300'
      default:
        return ''
    }
  }

  const getPositionLabel = (position: number) => {
    switch (position) {
      case 1:
        return 'Ouro'
      case 2:
        return 'Prata'
      case 3:
        return 'Bronze'
      default:
        return null
    }
  }

  // Mock position change (in real app, would come from data)
  const getPositionChange = (indicadoraId: string): number | null => {
    if (indicadoraId === 'ind-1') return 1
    if (indicadoraId === 'ind-2') return -1
    if (indicadoraId === 'ind-3') return 0
    return null
  }

  return (
    <ProtectedLayout 
      title="Ranking" 
      requiredRole="indicadora"
      breadcrumbs={[{ label: 'Ranking' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1>Ranking de Indicadoras</h1>
          <p className="text-lg text-muted-foreground font-normal mt-2">
            Veja sua posição e inspire-se a vencer
          </p>
        </div>

        {/* Sua Posição - Compacto */}
        {currentUserRanking && (
          <Card className={cn(
            'shadow-md border-2',
            currentUserRanking.position <= 3 
              ? `bg-gradient-to-r ${getPositionColor(currentUserRanking.position)}`
              : 'bg-primary/5 border-primary/30'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    {currentUserRanking.position <= 3 ? (
                      getPositionIcon(currentUserRanking.position)
                    ) : (
                      <span className="text-3xl font-bold text-primary">{currentUserRanking.position}º</span>
                    )}
                    {currentUserRanking.position <= 3 && (
                      <span className="text-xs font-bold mt-1">{getPositionLabel(currentUserRanking.position)}</span>
                    )}
                  </div>
                  <div className="h-12 w-px bg-border/40" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Sua Posição</p>
                    <p className="text-2xl font-bold text-foreground">#{currentUserRanking.position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{currentUserRanking.closedLeads}</p>
                    <p className="text-xs text-muted-foreground">Fechamentos</p>
                  </div>
                  <div>
                    <p className="currency-sm">{formatCurrency(currentUserRanking.totalCommission)}</p>
                    <p className="text-xs text-muted-foreground">Comissão</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{currentUserRanking.totalLeads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 - Cards Destacados */}
        <div className="grid gap-4 lg:grid-cols-3">
          {top3.map((entry) => (
            <Card 
              key={entry.indicadoraId}
              className={cn(
                'shadow-lg border-2 bg-gradient-to-br transition-all hover:shadow-xl',
                getPositionColor(entry.position)
              )}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    {getPositionIcon(entry.position)}
                    {entry.position === 1 && (
                      <div className="absolute -inset-2 border-2 border-yellow-300 rounded-full animate-pulse opacity-50" />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                      {getPositionLabel(entry.position)} LUGAR
                    </p>
                    <h3 className="font-semibold text-lg text-foreground">
                      {entry.indicadoraName}
                      {entry.indicadoraId === user?.id && (
                        <span className="text-xs text-primary ml-2">(você)</span>
                      )}
                    </h3>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="bg-white/40 rounded-lg p-3">
                      <p className="text-3xl font-bold text-foreground">
                        {entry.closedLeads}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">fechamentos</p>
                    </div>
                    
                    <div className="bg-white/40 rounded-lg p-3">
                      <p className="currency-sm">
                        {formatCurrency(entry.totalCommission)}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">comissão</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ranking Completo */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Classificação Completa</CardTitle>
            <CardDescription className="text-base mt-1">
              Todos os indicadores ranqueados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[80px] text-center font-semibold">Pos.</TableHead>
                  <TableHead className="font-semibold">Indicadora</TableHead>
                  <TableHead className="text-center font-semibold">Leads</TableHead>
                  <TableHead className="text-center font-semibold">Fechamentos</TableHead>
                  <TableHead className="text-right font-semibold">Comissão</TableHead>
                  <TableHead className="text-center font-semibold">Movimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((entry, idx) => {
                  const positionChange = getPositionChange(entry.indicadoraId)
                  return (
                    <TableRow 
                      key={entry.indicadoraId}
                      className={cn(
                        'transition-colors',
                        entry.position <= 3 && `bg-gradient-to-r ${getPositionColor(entry.position)}/50`,
                        entry.indicadoraId === user?.id && entry.position > 3 && 'bg-primary/10 border-l-4 border-l-primary',
                        entry.position > 3 && entry.indicadoraId !== user?.id && 'hover:bg-muted/40',
                        idx !== rankings.length - 1 && 'border-b'
                      )}
                    >
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {entry.position <= 3 ? (
                            <div className="flex flex-col items-center gap-0.5">
                              {getPositionIcon(entry.position)}
                              <span className="text-xs font-bold">
                                {getPositionLabel(entry.position)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">#{entry.position}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold py-4">
                        <div className="flex items-center gap-2">
                          <span>{entry.indicadoraName}</span>
                          {entry.indicadoraId === user?.id && (
                            <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-1 rounded">
                              você
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium py-4">
                        {entry.totalLeads}
                      </TableCell>
                      <TableCell className="text-center font-bold text-lg py-4">
                        {entry.closedLeads}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <span className="currency-sm">
                          {formatCurrency(entry.totalCommission)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {positionChange !== null && (
                          <div className="flex items-center justify-center gap-1">
                            {positionChange > 0 && (
                              <>
                                <ArrowUp className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-semibold text-green-600">{positionChange}</span>
                              </>
                            )}
                            {positionChange < 0 && (
                              <>
                                <ArrowDown className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-semibold text-red-600">{Math.abs(positionChange)}</span>
                              </>
                            )}
                            {positionChange === 0 && (
                              <span className="text-xs font-semibold text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
