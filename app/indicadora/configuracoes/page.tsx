'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Shield, Check, Clock } from 'lucide-react'
import type { UserValidation, ValidationStatus, DocumentType } from '@/lib/types'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [documentType, setDocumentType] = useState<DocumentType>('pf')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null)
  const [addressProofFileName, setAddressProofFileName] = useState('')

  // Load current validation data
  useEffect(() => {
    if (user?.validation) {
      const v = user.validation
      setDocumentType(v.documentType || 'pf')
      setFullName(v.fullName || '')
      setCompanyName(v.companyName || '')
      setCpf(v.cpf || '')
      setCnpj(v.cnpj || '')
      setDateOfBirth(v.dateOfBirth || '')
      setAddress(v.address || '')
      setPhone(v.phone || '')
      setEmail(v.email || '')
      if (v.addressProofPath) {
        setAddressProofFileName(v.addressProofPath.split('/').pop() || 'Comprovante enviado')
      }
    }
  }, [user])

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 14)
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleAddressProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Arquivo muito grande. Máximo 5MB.')
        return
      }
      setAddressProofFile(file)
      setAddressProofFileName(file.name)
    }
  }

  const handleSubmit = async () => {
    // Common validation
    if (!address.trim()) {
      toast.error('Preencha o endereço')
      return
    }
    if (!phone.replace(/\D/g, '')) {
      toast.error('Preencha o telefone')
      return
    }
    if (phone.replace(/\D/g, '').length !== 11) {
      toast.error('Telefone inválido')
      return
    }

    // Document-specific validation
    if (documentType === 'pf') {
      if (!fullName.trim()) {
        toast.error('Preencha o nome completo')
        return
      }
      if (!cpf.replace(/\D/g, '')) {
        toast.error('Preencha o CPF')
        return
      }
      if (cpf.replace(/\D/g, '').length !== 11) {
        toast.error('CPF inválido')
        return
      }
      if (!dateOfBirth) {
        toast.error('Preencha a data de nascimento')
        return
      }
    } else {
      if (!companyName.trim()) {
        toast.error('Preencha a razão social')
        return
      }
      if (!cnpj.replace(/\D/g, '')) {
        toast.error('Preencha o CNPJ')
        return
      }
      if (cnpj.replace(/\D/g, '').length !== 14) {
        toast.error('CNPJ inválido')
        return
      }
    }

    if (!addressProofFileName && !addressProofFile) {
      toast.error('Envie um comprovante de endereço')
      return
    }

    // Simulate save
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Solicitação de validação enviada com sucesso! Analisaremos em breve.')
    setIsEditing(false)
    setIsSaving(false)
  }

  const getStatusColor = (status?: ValidationStatus) => {
    if (!status) return 'default'
    if (status === 'nao_validada') return 'secondary'
    if (status === 'em_analise') return 'warning'
    if (status === 'validada') return 'default'
    return 'default'
  }

  const getStatusLabel = (status?: ValidationStatus) => {
    if (!status) return 'Não validada'
    if (status === 'nao_validada') return 'Não validada'
    if (status === 'em_analise') return 'Em análise'
    if (status === 'validada') return 'Conta validada'
    return 'Não validada'
  }

  const getStatusIcon = (status?: ValidationStatus) => {
    if (status === 'em_analise') return <Clock className="h-4 w-4" />
    if (status === 'validada') return <Check className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  return (
    <ProtectedLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground mt-2">Gerencie os dados da sua conta e solicitações de validação</p>
          </div>

          {/* Validation Status Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Status de Validação
                  </CardTitle>
                  <CardDescription>Estado atual da validação da sua conta</CardDescription>
                </div>
                <Badge variant={getStatusColor(user?.validation?.status)}>
                  {getStatusIcon(user?.validation?.status)}
                  <span className="ml-2">{getStatusLabel(user?.validation?.status)}</span>
                </Badge>
              </div>
            </CardHeader>
            {user?.validation?.status === 'em_analise' && (
              <CardContent className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
                Sua solicitação está em análise. Você receberá uma resposta em até 48 horas.
              </CardContent>
            )}
            {user?.validation?.status === 'validada' && (
              <CardContent className="text-sm text-green-700 bg-green-50 p-3 rounded">
                Sua conta foi validada com sucesso! Agora você pode acessar todos os recursos.
              </CardContent>
            )}
          </Card>

          {/* Validation Form Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dados de Validação</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Editar informações da conta' : 'Informações atuais da sua conta'}
                  </CardDescription>
                </div>
                {!isEditing && user?.validation?.status !== 'validada' && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Document Type Selection */}
              {isEditing && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <Label className="text-base font-semibold">Tipo de Cadastro</Label>
                  <RadioGroup value={documentType} onValueChange={(val) => setDocumentType(val as DocumentType)}>
                    <div className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => setDocumentType('pf')}>
                      <RadioGroupItem value="pf" id="pf" />
                      <Label htmlFor="pf" className="flex-1 cursor-pointer">
                        <p className="font-medium">Pessoa Física</p>
                        <p className="text-xs text-muted-foreground">CPF e dados pessoais</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => setDocumentType('pj')}>
                      <RadioGroupItem value="pj" id="pj" />
                      <Label htmlFor="pj" className="flex-1 cursor-pointer">
                        <p className="font-medium">Pessoa Jurídica</p>
                        <p className="text-xs text-muted-foreground">CNPJ e dados da empresa</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Display Document Type Badge when not editing */}
              {!isEditing && (
                <div>
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Tipo de Cadastro</Label>
                  <Badge variant="secondary" className="mt-2">
                    {documentType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                </div>
              )}

              {/* PF-specific fields */}
              {documentType === 'pf' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PJ-specific fields */}
              {documentType === 'pj' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Razão Social *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome da empresa"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={handleCNPJChange}
                      placeholder="00.000.000/0000-00"
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}

              {/* Common fields */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, complemento, cidade, estado"
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Address Proof Upload */}
              <div className="space-y-2">
                <Label htmlFor="addressProof">Comprovante de Endereço *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="addressProof"
                    type="file"
                    onChange={handleAddressProofChange}
                    disabled={!isEditing}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="flex-1"
                  />
                  {addressProofFileName && (
                    <span className="text-xs text-muted-foreground truncate flex-shrink-0">
                      {addressProofFileName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aceitos: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Enviando...' : 'Salvar e Enviar para Validação'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Informações importantes:</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>A validação é necessária para solicitar saques de comissões</li>
                <li>Seus dados serão verificados em até 48 horas</li>
                <li>Certifique-se de que todos os documentos estão legíveis</li>
                <li>Você pode atualizar seus dados enquanto estiver em análise</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
