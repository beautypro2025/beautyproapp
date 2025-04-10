import { CalendarDays, DollarSign, Users } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    title: 'Agenda Online',
    description: 'Agendamento 24h com confirmação automática e lembretes por WhatsApp',
    icon: CalendarDays,
  },
  {
    title: 'Gestão Financeira',
    description: 'Controle de caixa, comissões e relatórios gerenciais detalhados',
    icon: DollarSign,
  },
  {
    title: 'Gestão Completa',
    description: 'Controle de estoque, cadastro de serviços e gestão de equipe',
    icon: Users,
  },
]
