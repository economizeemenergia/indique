'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { AlertCircle, FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WithdrawalRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableAmount: number
}

export function WithdrawalRequestForm({ open, onOpenChange, availableAmount }: WithdrawalRequestFormProps) {
  const { user } = useAuth()
  const { createWithdrawal } = useData()
  
  const [documentType, setDocumentType] = useState<'pf' | 'pj'>('pf')
  const [name, setName] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const discount = documentType === 'pf' ? 15 : 0
  const grossAmount = availableAmount
  const discountAmount = Math.round((grossAmount * discount) / 100)
  const netAmount = grossAmount - discountAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError(documentType === 'pf' ? 'Nome completo é obrigatório' : 'Razão social é obrigatória')
      return
    }
    if (!pixKey.trim()) {
      setError('Chave Pix é obrigatória')
      return
    }
    if (documentType === 'pj' && !invoiceFile) {
      setError('Nota fiscal é obrigatória para Pessoa Jurídica')
      return
    }

    setLoading(true)
    try {
      // Create withdrawal record
      createWithdrawal({
        indicadoraId: user?.id || '',
        grossAmount,
        discount,
        netAmount,
        documentType,
        name,
        pixKey,
        invoicePath: invoiceFile ? '/invoices/temp.pdf' : undefined,
        status: 'em_analise',
      })

      // Reset form and close
      setName('')
      setPixKey('')
      setInvoiceFile(null)
      setDocumentType('pf')
      onOpenChange(false)
    } catch (err) {
      setError('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para solicitar seu saque de comissões
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-6 px-4 pr-6">
            {/* Amount Summary */}
            <div className="space-y-3 bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor disponível:</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(grossAmount)}</span>
              </div>
            {discount > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Desconto PF ({discount}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor líquido a receber:</span>
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(netAmount)}</span>
                </div>
              </>
            )}
          </div>

          {/* Document Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Cadastro</Label>
            <RadioGroup value={documentType} onValueChange={(val) => setDocumentType(val as 'pf' | 'pj')}>
              <div 
                className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  setDocumentType('pf')
                }}
              >
                <RadioGroupItem value="pf" id="pf" />
                <Label htmlFor="pf" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Pessoa Física</p>
                    <p className="text-xs text-muted-foreground">Desconto de 15% sem nota fiscal</p>
                  </div>
                </Label>
              </div>
              <div 
                className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  setDocumentType('pj')
                }}
              >
                <RadioGroupItem value="pj" id="pj" />
                <Label htmlFor="pj" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Pessoa Jurídica</p>
                    <p className="text-xs text-muted-foreground">Sem desconto com nota fiscal</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">
              {documentType === 'pf' ? 'Nome Completo' : 'Razão Social'}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={documentType === 'pf' ? 'Ex: Maria Silva' : 'Ex: Minha Empresa LTDA'}
              disabled={loading}
            />
          </div>

          {/* Pix Key Field */}
          <div className="space-y-2">
            <Label htmlFor="pix" className="font-semibold">
              Chave Pix
            </Label>
            <Input
              id="pix"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Ex: chave@pix.com ou CPF ou CNPJ"
              disabled={loading}
            />
          </div>

          {/* Invoice Upload for PJ */}
          {documentType === 'pj' && (
            <div className="space-y-2">
              <Label htmlFor="invoice" className="font-semibold">
                Nota Fiscal (Obrigatório)
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  id="invoice"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="hidden"
                />
                <label htmlFor="invoice" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {invoiceFile ? invoiceFile.name : 'Clique para anexar arquivo'}
                  </span>
                  <span className="text-xs text-muted-foreground">PDF, JPG ou PNG</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            <p className="font-medium mb-1">Após envio:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Sua solicitação entrará em análise</li>
              <li>Você receberá um email com a confirmação</li>
              <li>Após aprovação, o pagamento será realizado em até 5 dias úteis</li>
            </ul>
          </div>
          </div>

          {/* Error Message - Outside scroll */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mx-4 mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Buttons - Fixed Footer */}
          <div className="flex gap-3 px-4 pb-4 border-t mt-auto pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !name || !pixKey || (documentType === 'pj' && !invoiceFile)}
              className="flex-1"
            >
              {loading ? 'Enviando...' : 'Solicitar Saque'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
