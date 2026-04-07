import type { LeadStatus, LeadType, CommissionStatus } from './types'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo Lead',
  em_analise: 'Em Análise',
  contato_realizado: 'Contato Realizado',
  proposta_enviada: 'Proposta Enviada',
  em_negociacao: 'Em Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  novo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  em_analise: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  contato_realizado: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  proposta_enviada: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  em_negociacao: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  fechado: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  perdido: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  rural: 'Rural',
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  disponivel: 'Valor Disponível',
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  paga: 'Paga',
}

export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, { bg: string; text: string }> = {
  disponivel: { bg: 'bg-green-100', text: 'text-green-700' },
  pendente: { bg: 'bg-amber-100', text: 'text-amber-700' },
  aprovada: { bg: 'bg-blue-100', text: 'text-blue-700' },
  paga: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export const KANBAN_COLUMNS: LeadStatus[] = [
  'novo',
  'em_analise',
  'contato_realizado',
  'proposta_enviada',
  'em_negociacao',
  'fechado',
  'perdido',
]

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'novo',
  'em_analise',
  'contato_realizado',
  'proposta_enviada',
  'em_negociacao',
  'fechado',
  'perdido',
]
