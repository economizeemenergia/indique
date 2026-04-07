'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Settings, Building, Mail, Percent, Calendar, Save } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState({
    companyName: 'Economize em Energia',
    supportEmail: 'suporte@economize.com.br',
    commissionPercentage: '5',
    paymentDays: '30',
    minProjectValue: '15000',
  })

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!', {
      description: 'As alterações foram aplicadas.',
    })
  }

  return (
    <ProtectedLayout 
      title="Configurações" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Configurações' }]}
    >
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Company Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Dados da Empresa</CardTitle>
            </div>
            <CardDescription>
              Informações básicas da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Comissões</CardTitle>
            </div>
            <CardDescription>
              Configurações de comissões para indicadoras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commissionPercentage">Percentual de Comissão (%)</Label>
              <Input
                id="commissionPercentage"
                type="number"
                value={settings.commissionPercentage}
                onChange={(e) => setSettings({ ...settings, commissionPercentage: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Percentual padrão aplicado sobre o valor do projeto
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minProjectValue">Valor Mínimo de Projeto (R$)</Label>
              <Input
                id="minProjectValue"
                type="number"
                value={settings.minProjectValue}
                onChange={(e) => setSettings({ ...settings, minProjectValue: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Valor mínimo para projetos elegíveis a comissão
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Pagamentos</CardTitle>
            </div>
            <CardDescription>
              Configurações de prazos de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDays">Prazo de Pagamento (dias)</Label>
              <Input
                id="paymentDays"
                type="number"
                value={settings.paymentDays}
                onChange={(e) => setSettings({ ...settings, paymentDays: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Dias após o fechamento da venda para pagamento da comissão
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Modo Demonstração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Este é um ambiente de demonstração. As configurações salvas serão mantidas apenas durante esta sessão. 
              Em produção, estas configurações seriam persistidas em um banco de dados.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </ProtectedLayout>
  )
}
