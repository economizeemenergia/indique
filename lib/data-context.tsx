'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lead, LeadMovement, Commission, Withdrawal, LeadStatus, WithdrawalStatus } from './types'
import { leads as initialLeads, leadMovements as initialMovements, commissions as initialCommissions, withdrawals as initialWithdrawals } from './mock-data'

interface DataContextType {
  leads: Lead[]
  leadMovements: LeadMovement[]
  commissions: Commission[]
  withdrawals: Withdrawal[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Lead
  updateLeadStatus: (leadId: string, newStatus: LeadStatus, userId: string, userName: string, notes?: string) => void
  updateLead: (leadId: string, updates: Partial<Lead>) => void
  updateCommissionStatus: (commissionId: string, status: Commission['status'], paidDate?: string) => void
  createWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>) => Withdrawal
  updateWithdrawalStatus: (withdrawalId: string, status: WithdrawalStatus, paidDate?: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Generate unique ID with timestamp + random suffix
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [leadMovements, setLeadMovements] = useState<LeadMovement[]>(initialMovements)
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals)

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Lead => {
    const now = new Date().toISOString()
    const newLead: Lead = {
      ...leadData,
      id: generateId('lead'),
      status: 'novo',
      createdAt: now,
      updatedAt: now,
    }
    
    setLeads(prev => [newLead, ...prev])
    
    // Add initial movement
    const movement: LeadMovement = {
      id: generateId('mov'),
      leadId: newLead.id,
      fromStatus: null,
      toStatus: 'novo',
      userId: leadData.indicadoraId,
      userName: 'Indicadora',
      createdAt: now,
    }
    setLeadMovements(prev => [movement, ...prev])
    
    return newLead
  }

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus, userId: string, userName: string, notes?: string) => {
    const now = new Date().toISOString()
    
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const movement: LeadMovement = {
          id: generateId('mov'),
          leadId,
          fromStatus: lead.status,
          toStatus: newStatus,
          userId,
          userName,
          notes,
          createdAt: now,
        }
        setLeadMovements(prevMov => [movement, ...prevMov])
        
        // If closing lead, create commission automatically based on kW
        if (newStatus === 'fechado' && lead.status !== 'fechado') {
          // Check if commission already exists for this lead
          const commissionExists = commissions.some(com => com.leadId === leadId)
          
          if (!commissionExists) {
            // Commission = R$1.00 per kW sold
            const commissionValue = lead.powerInKw && lead.powerInKw > 0 ? lead.powerInKw : 0
            
            if (commissionValue > 0) {
              const newCommission: Commission = {
                id: generateId('com'),
                leadId,
                indicadoraId: lead.indicadoraId,
                clientName: lead.clientName,
                value: commissionValue,
                status: 'disponivel',
                expectedPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: now,
              }
              setCommissions(prevCom => [newCommission, ...prevCom])
            }
          }
        }
        
        return { ...lead, status: newStatus, updatedAt: now }
      }
      return lead
    }))
  }

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
        : lead
    ))
  }

  const updateCommissionStatus = (commissionId: string, status: Commission['status'], paidDate?: string) => {
    setCommissions(prev => prev.map(com => 
      com.id === commissionId 
        ? { ...com, status, paidDate: paidDate || com.paidDate }
        : com
    ))
  }

  const createWithdrawal = (withdrawalData: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>): Withdrawal => {
    const now = new Date().toISOString()
    const newWithdrawal: Withdrawal = {
      ...withdrawalData,
      id: generateId('wth'),
      createdAt: now,
      updatedAt: now,
    }
    
    setWithdrawals(prev => [newWithdrawal, ...prev])
    return newWithdrawal
  }

  const updateWithdrawalStatus = (withdrawalId: string, status: WithdrawalStatus, paidDate?: string) => {
    setWithdrawals(prev => prev.map(wth => 
      wth.id === withdrawalId 
        ? { ...wth, status, paidDate: paidDate || wth.paidDate, updatedAt: new Date().toISOString() }
        : wth
    ))
  }

  return (
    <DataContext.Provider value={{ 
      leads, 
      leadMovements, 
      commissions,
      withdrawals,
      addLead, 
      updateLeadStatus, 
      updateLead,
      updateCommissionStatus,
      createWithdrawal,
      updateWithdrawalStatus
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
