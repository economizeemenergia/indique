'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { WithdrawalRequestForm } from '@/components/indicadora/withdrawal-request-form'
import { formatCurrency, formatDate } from '@/lib/format'
import { DollarSign, Clock, CheckCircle, TrendingUp, Download, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ComissoesPage() {
  const { user } = useAuth()
  const { commissions, withdrawals } = useData()
  const [formOpen, setFormOpen] = useState(false)

  // Get user's commissions with status "aprovada" (available to withdraw)
  const myCommissions = commissions
    .filter(c => c.indicadoraId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const myWithdrawals = withdrawals
    .filter(w => w.indicadoraId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Calculate available balance (disponivel commissions)
  const availableBalance = myCommissions
    .filter(c => c.status === 'disponivel')
    .reduce((sum, c) => sum + c.value, 0)

  // Calculate totals for withdrawal statuses
  const withdrawalTotals = useMemo(() => ({
    em_analise: myWithdrawals
      .filter(w => w.status === 'em_analise')
      .reduce((sum, w) => sum + w.netAmount, 0),
    aprovado: myWithdrawals
      .filter(w => w.status === 'aprovado')
      .reduce((sum, w) => sum + w.netAmount, 0),
    pago: myWithdrawals
      .filter(w => w.status === 'pago')
      .reduce((sum, w) => sum + w.netAmount, 0),
  }), [myWithdrawals])

  const withdrawalCounts = useMemo(() => ({
    em_analise: myWithdrawals.filter(w => w.status === 'em_analise').length,
    aprovado: myWithdrawals.filter(w => w.status === 'aprovado').length,
    pago: myWithdrawals.filter(w => w.status === 'pago').length,
  }), [myWithdrawals])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'em_analise':
        return 'bg-amber-100 text-amber-700'
      case 'aprovado':
        return 'bg-blue-100 text-blue-700'
      case 'pago':
        return 'bg-emerald-100 text-emerald-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_analise':
        return 'Em Análise'
      case 'aprovado':
        return 'Aprovado'
      case 'pago':
        return 'Pago'
      default:
        return status
    }
  }

  return (
    <ProtectedLayout 
      title="Minhas Comissões" 
      requiredRole="indicadora"
      breadcrumbs={[{ label: 'Minhas Comissões' }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1>Minhas Comissões</h1>
          <p className="text-lg text-muted-foreground font-normal mt-2">
            Acompanhe suas comissões e solicite saques
          </p>
        </div>

        {/* Available Balance Card - Prominent */}
        {availableBalance > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <p className="label-uppercase">Saldo Disponível</p>
                  <div className="space-y-2">
                    <div className="currency">
                      {formatCurrency(availableBalance)}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      Pronto para solicitar saque
                    </p>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => setFormOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8"
                >
                  Solicitar Saque
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Status Summary */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(withdrawalTotals.em_analise)}
              </div>
              <p className="text-xs text-muted-foreground">
                {withdrawalCounts.em_analise} solicitação(ões)
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
                {formatCurrency(withdrawalTotals.aprovado)}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando transferência
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(withdrawalTotals.pago)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total transferido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        {myWithdrawals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Histórico de Saques</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Tipo</TableHead>
                    <TableHead className="text-right font-semibold">Valor Bruto</TableHead>
                    <TableHead className="text-right font-semibold">Desconto</TableHead>
                    <TableHead className="text-right font-semibold">Valor Líquido</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {formatDate(withdrawal.createdAt)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          withdrawal.documentType === 'pf' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        )}>
                          {withdrawal.documentType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(withdrawal.grossAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {withdrawal.discount > 0 ? `-${formatCurrency((withdrawal.grossAmount * withdrawal.discount) / 100)}` : '—'}
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Commissions History */}
        {myCommissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Histórico de Comissões</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="text-right font-semibold">Valor</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myCommissions.map((commission) => (
                    <TableRow key={commission.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{commission.clientName}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(commission.value)}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm inline-block',
                          commission.status === 'disponivel' && 'bg-green-100 text-green-700 border-green-300',
                          commission.status === 'pendente' && 'bg-amber-100 text-amber-700 border-amber-300',
                          commission.status === 'aprovada' && 'bg-blue-100 text-blue-700 border-blue-300',
                          commission.status === 'paga' && 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        )}>
                          {commission.status === 'disponivel' && 'Valor Disponível'}
                          {commission.status === 'pendente' && 'Pendente'}
                          {commission.status === 'aprovada' && 'Aprovada'}
                          {commission.status === 'paga' && 'Paga'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(commission.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {myWithdrawals.length === 0 && availableBalance === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground mb-2">Nenhuma solicitação de saque</p>
              <p className="text-sm text-muted-foreground">
                Você ainda não tem comissões disponíveis para solicitar saque
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Withdrawal Form Modal */}
      <WithdrawalRequestForm
        open={formOpen}
        onOpenChange={setFormOpen}
        availableAmount={availableBalance}
      />
    </ProtectedLayout>
  )
}
