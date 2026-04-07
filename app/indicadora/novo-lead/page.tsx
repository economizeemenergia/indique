'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BRAZILIAN_STATES, LEAD_TYPE_LABELS } from '@/lib/constants'
import type { LeadType } from '@/lib/types'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { UserPlus } from 'lucide-react'

export default function NovoLeadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addLead } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    city: '',
    state: '',
    leadType: 'residencial' as LeadType,
    avgElectricityBill: '',
    bestContactTime: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setIsSubmitting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addLead({
      clientName: formData.clientName,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      leadType: formData.leadType,
      avgElectricityBill: Number(formData.avgElectricityBill) || 0,
      bestContactTime: formData.bestContactTime,
      notes: formData.notes,
      indicadoraId: user.id,
    })
    
    toast.success('Lead cadastrado com sucesso!', {
      description: 'Sua indicação foi enviada para análise.',
    })
    
    router.push('/indicadora/minhas-indicacoes')
  }

  return (
    <ProtectedLayout 
      title="Nova Indicação" 
      requiredRole="indicadora"
      breadcrumbs={[{ label: 'Nova Indicação' }]}
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Cadastrar Nova Indicação</CardTitle>
                <CardDescription>
                  Preencha os dados do cliente para enviar a indicação
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Nome completo do cliente"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* City and State */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="Cidade do cliente"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lead Type */}
              <div className="space-y-3">
                <Label>Tipo de Cliente *</Label>
                <RadioGroup
                  value={formData.leadType}
                  onValueChange={(value) => setFormData({ ...formData, leadType: value as LeadType })}
                  className="flex flex-wrap gap-4"
                >
                  {(Object.entries(LEAD_TYPE_LABELS) as [LeadType, string][]).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer font-normal">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Electricity Bill */}
              <div className="space-y-2">
                <Label htmlFor="avgElectricityBill">Valor Médio da Conta de Luz (R$)</Label>
                <Input
                  id="avgElectricityBill"
                  type="number"
                  placeholder="Ex: 500"
                  value={formData.avgElectricityBill}
                  onChange={(e) => setFormData({ ...formData, avgElectricityBill: e.target.value })}
                />
              </div>

              {/* Best Contact Time */}
              <div className="space-y-2">
                <Label htmlFor="bestContactTime">Melhor Horário para Contato</Label>
                <Input
                  id="bestContactTime"
                  type="time"
                  value={formData.bestContactTime}
                  onChange={(e) => setFormData({ ...formData, bestContactTime: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o cliente..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
                  Enviar Indicação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
