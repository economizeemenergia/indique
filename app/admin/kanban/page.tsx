'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { getIndicadoraById } from '@/lib/mock-data'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { KANBAN_COLUMNS, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_TYPE_LABELS } from '@/lib/constants'
import type { LeadStatus, Lead } from '@/lib/types'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { Phone, MapPin, User, Calendar, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function KanbanPage() {
  const { user } = useAuth()
  const { leads, updateLeadStatus } = useData()
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)

  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads
      .filter(l => l.status === status)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [leads])

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    setDraggedLead(leadId)
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    const lead = leads.find(l => l.id === leadId)
    
    if (lead && lead.status !== newStatus && user) {
      updateLeadStatus(leadId, newStatus, user.id, user.name)
      toast.success('Lead movido com sucesso!', {
        description: `${lead.clientName} foi movido para ${LEAD_STATUS_LABELS[newStatus]}`,
      })
    }
    
    setDraggedLead(null)
    setDragOverColumn(null)
  }

  return (
    <ProtectedLayout 
      title="Kanban" 
      requiredRole="admin"
      breadcrumbs={[{ label: 'Kanban' }]}
    >
      <div className="space-y-4 h-[calc(100vh-8rem)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Quadro Kanban</h1>
          <p className="text-muted-foreground">
            Arraste os cards para mover leads entre as etapas
          </p>
        </div>

        {/* Kanban Board */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4 h-[calc(100vh-14rem)]">
            {KANBAN_COLUMNS.map((status) => {
              const statusLeads = getLeadsByStatus(status)
              const colors = LEAD_STATUS_COLORS[status]
              
              return (
                <div
                  key={status}
                  className={cn(
                    'flex flex-col w-[300px] min-w-[300px] rounded-lg bg-muted/50 transition-colors',
                    dragOverColumn === status && 'bg-primary/10 ring-2 ring-primary/20'
                  )}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className={cn('px-3 py-3 rounded-t-lg', colors.bg)}>
                    <div className="flex items-center justify-between">
                      <h3 className={cn('font-semibold text-sm', colors.text)}>
                        {LEAD_STATUS_LABELS[status]}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {statusLeads.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2">
                      {statusLeads.map((lead) => (
                        <KanbanCard 
                          key={lead.id} 
                          lead={lead}
                          isDragging={draggedLead === lead.id}
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                      
                      {statusLeads.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Nenhum lead
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </ProtectedLayout>
  )
}

interface KanbanCardProps {
  lead: Lead
  isDragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
}

function KanbanCard({ lead, isDragging, onDragStart, onDragEnd }: KanbanCardProps) {
  const indicadora = getIndicadoraById(lead.indicadoraId)

  return (
    <Card 
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105'
      )}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {lead.clientName}
          </CardTitle>
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{lead.city}, {lead.state}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{indicadora?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {LEAD_TYPE_LABELS[lead.leadType]}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(lead.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
