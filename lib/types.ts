export type UserRole = 'admin' | 'indicadora'

export type ValidationStatus = 'nao_validada' | 'em_analise' | 'validada'

export type DocumentType = 'pf' | 'pj'

export interface UserValidation {
  documentType: DocumentType
  // PF fields
  fullName?: string
  cpf?: string
  dateOfBirth?: string
  // PJ fields
  companyName?: string
  cnpj?: string
  // Common fields
  address: string
  addressProofPath?: string
  phone: string
  email: string
  status: ValidationStatus
  submittedAt?: string
  updatedAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  referralCode?: string
  createdAt: string
  isActive: boolean
  validation?: UserValidation
}

export interface Lead {
  id: string
  clientName: string
  phone: string
  city: string
  state: string
  leadType: LeadType
  avgElectricityBill: number
  bestContactTime: string
  notes: string
  status: LeadStatus
  indicadoraId: string
  responsibleId?: string
  estimatedProjectValue?: number
  powerInKw?: number // Power sold in kW - used for commission calculation
  commissionValue?: number
  createdAt: string
  updatedAt: string
}

export interface LeadMovement {
  id: string
  leadId: string
  fromStatus: LeadStatus | null
  toStatus: LeadStatus
  userId: string
  userName: string
  notes?: string
  createdAt: string
}

export interface Commission {
  id: string
  leadId: string
  indicadoraId: string
  clientName: string
  value: number
  status: CommissionStatus
  expectedPaymentDate: string
  paidDate?: string
  createdAt: string
}

export interface Withdrawal {
  id: string
  indicadoraId: string
  grossAmount: number
  discount: number // percentage (15% for PF, 0% for PJ)
  netAmount: number // gross - (gross * discount/100)
  documentType: DocumentType // 'pf' or 'pj'
  name: string // full name or company name
  pixKey: string
  invoicePath?: string // path to attached invoice (for PJ)
  status: WithdrawalStatus
  paidDate?: string
  createdAt: string
  updatedAt: string
}

export interface IndicadoraStats {
  totalLeads: number
  leadsInProgress: number
  closedLeads: number
  lostLeads: number
  totalCommission: number
  pendingCommission: number
  availableBalance: number
}

export interface AdminStats {
  totalLeads: number
  newLeads: number
  inAnalysis: number
  proposalsSent: number
  inNegotiation: number
  closedLeads: number
  lostLeads: number
  totalSalesValue: number
  totalCommission: number
}

export interface RankingEntry {
  position: number
  indicadoraId: string
  indicadoraName: string
  totalLeads: number
  closedLeads: number
  totalCommission: number
}
