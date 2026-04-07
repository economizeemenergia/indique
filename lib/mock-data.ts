import type { User, Lead, LeadMovement, Commission, Withdrawal } from './types'

// Admin user
export const adminUser: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@economize.com.br',
  phone: '(11) 99999-0000',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
}

// Indicadora users - empty array (reset)
export const indicadoras: User[] = []

export const allUsers: User[] = [adminUser, ...indicadoras]

// Leads - empty array (reset)
export const leads: Lead[] = []

// Lead movements history - empty array (reset)
export const leadMovements: LeadMovement[] = []

// Commissions - empty array (reset)
export const commissions: Commission[] = []

// Helper functions
export function getIndicadoraById(id: string): User | undefined {
  return indicadoras.find(i => i.id === id)
}

export function getLeadsByIndicadora(indicadoraId: string): Lead[] {
  return leads.filter(l => l.indicadoraId === indicadoraId)
}

// Withdrawals - empty array (reset)
export const withdrawals: Withdrawal[] = []

export function getCommissionsByIndicadora(indicadoraId: string): Commission[] {
  return commissions.filter(c => c.indicadoraId === indicadoraId)
}

export function getLeadMovements(leadId: string): LeadMovement[] {
  return leadMovements.filter(m => m.leadId === leadId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
