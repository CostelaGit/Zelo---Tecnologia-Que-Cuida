'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { demoUnits } from '@/data/demo'

type Appointment = {
  id: string
  patientName: string
  phone: string
  unit: string
  specialty: string
  professional: string
  appointmentDate: string
  time: string
  status: 'confirmed' | 'completed' | 'cancelled'
  code: string
}

type UnitNotice = {
  id: string
  type: 'ausencia' | 'servico' | 'outro'
  title: string
  message: string
  unit: string
  createdAt: string
}

type ServiceControl = { enabled: boolean; blockedTimes: string[] }
type DashboardSection = 'overview' | 'appointments' | 'services' | 'communication' | 'units'
type AppointmentFilter = 'all' | 'confirmed' | 'history'

const TIMES = ['07:30', '08:30', '09:30', '10:30', '13:30', '14:30', '15:30']
const STORAGE = {
  appointments: 'tecnologia-que-cuida-appointments',
  notices: 'tecnologia-que-cuida-unit-notices',
  services: 'tecnologia-que-cuida-service-controls',
  tickets: 'tecnologia-que-cuida-tickets',
}

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    pulse: <><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    building: <><path d="M4 21V5l8-3 8 3v16M8 8h2M14 8h2M8 12h2M14 12h2M9 21v-5h6v5"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const dateValue = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const sampleAppointments = (): Appointment[] => [
  { id: 'demo-1', patientName: 'Maria da Silva', phone: '(81) 99991-1001', unit: demoUnits[0].name, specialty: 'Clínico geral', professional: 'Dra. Ana Martins', appointmentDate: dateValue(0), time: '08:30', status: 'confirmed', code: 'ZELO-104821' },
  { id: 'demo-2', patientName: 'José Carlos Lima', phone: '(81) 99992-1002', unit: demoUnits[0].name, specialty: 'Pediatria', professional: 'Dr. Rafael Costa', appointmentDate: dateValue(0), time: '10:30', status: 'confirmed', code: 'ZELO-104936' },
  { id: 'demo-3', patientName: 'Ana Souza', phone: '(81) 99993-1003', unit: demoUnits[0].name, specialty: 'Vacinação', professional: 'Equipe da unidade', appointmentDate: dateValue(-1), time: '13:30', status: 'completed', code: 'ZELO-103774' },
  { id: 'demo-4', patientName: 'Paulo Mendes', phone: '(81) 99994-1004', unit: demoUnits[1].name, specialty: 'Odontologia', professional: 'Dra. Carla Freire', appointmentDate: dateValue(1), time: '09:30', status: 'confirmed', code: 'ZELO-105017' },
]

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

export default function AdminDashboard() {
  const [section, setSection] = useState<DashboardSection>('overview')
  const [selectedUnitId, setSelectedUnitId] = useState(demoUnits[0].id)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notices, setNotices] = useState<UnitNotice[]>([])
  const [serviceControls, setServiceControls] = useState<Record<string, ServiceControl>>({})
  const [tickets, setTickets] = useState({ clinico: 15, pediatra: 8, dentista: 4 })
  const [filter, setFilter] = useState<AppointmentFilter>('all')
  const [query, setQuery] = useState('')
  const [noticeType, setNoticeType] = useState<UnitNotice['type'] | null>(null)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    setAppointments(safeParse(window.localStorage.getItem(STORAGE.appointments), sampleAppointments()))
    setNotices(safeParse(window.localStorage.getItem(STORAGE.notices), []))
    setServiceControls(safeParse(window.localStorage.getItem(STORAGE.services), {}))
    setTickets(safeParse(window.localStorage.getItem(STORAGE.tickets), { clinico: 15, pediatra: 8, dentista: 4 }))
  }, [])

  const selectedUnit = demoUnits.find(unit => unit.id === selectedUnitId) ?? demoUnits[0]
  const serviceKey = (service: string) => `${selectedUnit.name}::${service}`
  const getService = (service: string) => serviceControls[serviceKey(service)] ?? { enabled: true, blockedTimes: [] }
  const today = dateValue(0)

  const unitAppointments = useMemo(
    () => appointments.filter(item => item.unit === selectedUnit.name).sort((a, b) => `${a.appointmentDate}-${a.time}`.localeCompare(`${b.appointmentDate}-${b.time}`)),
    [appointments, selectedUnit.name],
  )
  const visibleAppointments = unitAppointments.filter(item => {
    const matchesFilter = filter === 'all' || (filter === 'confirmed' ? item.status === 'confirmed' : item.status !== 'confirmed')
    const text = `${item.patientName} ${item.specialty} ${item.professional} ${item.code}`.toLowerCase()
    return matchesFilter && text.includes(query.trim().toLowerCase())
  })
  const confirmed = unitAppointments.filter(item => item.status === 'confirmed').length
  const completed = unitAppointments.filter(item => item.status === 'completed').length
  const cancelled = unitAppointments.filter(item => item.status === 'cancelled').length
  const activeServices = selectedUnit.services.filter(service => getService(service).enabled).length

  const persistAppointments = (next: Appointment[]) => {
    setAppointments(next)
    window.localStorage.setItem(STORAGE.appointments, JSON.stringify(next))
  }

  const completeAppointment = (id: string) => {
    persistAppointments(appointments.map(item => item.id === id ? { ...item, status: 'completed' as const } : item))
    showSaved('Consulta marcada como concluída.')
  }

  const updateService = (service: string, update: (current: ServiceControl) => ServiceControl) => {
    const key = serviceKey(service)
    const next = { ...serviceControls, [key]: update(getService(service)) }
    setServiceControls(next)
    window.localStorage.setItem(STORAGE.services, JSON.stringify(next))
    showSaved('Disponibilidade atualizada no aplicativo.')
  }

  const updateTickets = (key: keyof typeof tickets, total: number, amount: number) => {
    const next = { ...tickets, [key]: Math.max(0, Math.min(total, tickets[key] + amount)) }
    setTickets(next)
    window.localStorage.setItem(STORAGE.tickets, JSON.stringify(next))
  }

  const publishNotice = (data: FormData) => {
    if (!noticeType) return
    const subject = String(data.get('subject') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    if (!subject || !message) return
    const title = noticeType === 'ausencia' ? `${subject} sem atendimento` : noticeType === 'servico' ? `${subject} temporariamente indisponível` : subject
    const notice: UnitNotice = { id: String(Date.now()), type: noticeType, title, message, unit: selectedUnit.name, createdAt: new Date().toISOString() }
    const next = [notice, ...notices]
    setNotices(next)
    window.localStorage.setItem(STORAGE.notices, JSON.stringify(next))
    setNoticeType(null)
    showSaved('Aviso publicado no aplicativo.')
  }

  const showSaved = (message: string) => {
    setSavedMessage(message)
    window.setTimeout(() => setSavedMessage(''), 2800)
  }

  const goTo = (next: DashboardSection) => {
    setSection(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <div className="admin-dashboard">
    <div className="admin-mobile-block">
      <Image src="/brand/zelo-mark.webp" width={52} height={52} alt="" unoptimized />
      <span>ÁREA DE GESTÃO</span>
      <h1>Abra em um tablet ou computador</h1>
      <p>O dashboard administrativo foi desenvolvido para telas maiores e não fica disponível no aplicativo móvel.</p>
    </div>

    <div className="admin-dashboard-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Image src="/brand/zelo-mark.webp" width={42} height={42} alt="" unoptimized />
          <div><b>Zelo</b><span>Gestão em saúde</span></div>
        </div>
        <nav aria-label="Seções do dashboard">
          {([
            ['overview', 'grid', 'Visão geral'],
            ['appointments', 'calendar', 'Agenda'],
            ['services', 'pulse', 'Serviços e fichas'],
            ['communication', 'bell', 'Comunicação'],
            ['units', 'building', 'Unidades'],
          ] as const).map(([value, icon, label]) => <button key={value} className={section === value ? 'active' : ''} onClick={() => goTo(value)}><Icon name={icon} /><span>{label}</span></button>)}
        </nav>
        <div className="admin-sidebar-status"><i /><div><b>Sistema operacional</b><span>Dados sincronizados localmente</span></div></div>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">PAINEL ADMINISTRATIVO</span>
            <h1>{section === 'overview' ? 'Visão geral' : section === 'appointments' ? 'Agenda de atendimentos' : section === 'services' ? 'Serviços e fichas' : section === 'communication' ? 'Comunicação com pacientes' : 'Rede de unidades'}</h1>
          </div>
          <div className="admin-topbar-actions">
            <label><span>Unidade</span><select value={selectedUnitId} onChange={event => setSelectedUnitId(event.target.value)}>{demoUnits.map(unit => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></label>
            <div className="admin-user"><span>AD</span><div><b>Administrador</b><small>Gestão da unidade</small></div></div>
          </div>
        </header>

        {savedMessage && <div className="admin-toast" role="status"><span>✓</span>{savedMessage}</div>}

        {section === 'overview' && <>
          <section className="admin-context-banner">
            <div><span className="admin-kicker">HOJE NA UNIDADE</span><h2>{selectedUnit.name}</h2><p>{selectedUnit.address} · {selectedUnit.region}</p></div>
            <div><i /><span><b>Atendimento normal</b><small>Atualizado agora</small></span></div>
          </section>
          <section className="admin-metric-grid">
            <article><span className="admin-metric-icon blue"><Icon name="calendar" /></span><div><small>Consultas confirmadas</small><strong>{confirmed}</strong><p>{unitAppointments.filter(item => item.appointmentDate === today).length} previstas para hoje</p></div></article>
            <article><span className="admin-metric-icon green"><Icon name="pulse" /></span><div><small>Serviços ativos</small><strong>{activeServices}<em>/{selectedUnit.services.length}</em></strong><p>Disponíveis no aplicativo</p></div></article>
            <article><span className="admin-metric-icon amber"><Icon name="users" /></span><div><small>Fichas disponíveis</small><strong>{tickets.clinico + tickets.pediatra + tickets.dentista}</strong><p>Entre as filas monitoradas</p></div></article>
            <article><span className="admin-metric-icon lilac"><Icon name="bell" /></span><div><small>Avisos publicados</small><strong>{notices.filter(item => item.unit === selectedUnit.name).length}</strong><p>Visíveis para os pacientes</p></div></article>
          </section>
          <section className="admin-overview-grid">
            <article className="admin-surface admin-today-list">
              <div className="admin-section-heading"><div><span className="admin-kicker">PRÓXIMOS ATENDIMENTOS</span><h2>Agenda de hoje</h2></div><button onClick={() => goTo('appointments')}>Ver agenda <Icon name="chevron" size={16}/></button></div>
              {unitAppointments.filter(item => item.appointmentDate === today && item.status === 'confirmed').slice(0, 4).map(item => <div className="admin-today-row" key={item.id}><time>{item.time}</time><span>{item.patientName.slice(0, 1)}</span><div><b>{item.patientName}</b><small>{item.specialty} · {item.professional}</small></div><em>Confirmada</em></div>)}
              {!unitAppointments.some(item => item.appointmentDate === today && item.status === 'confirmed') && <div className="admin-empty">Nenhum atendimento confirmado para hoje.</div>}
            </article>
            <article className="admin-surface admin-quick-actions">
              <div className="admin-section-heading"><div><span className="admin-kicker">AÇÕES RÁPIDAS</span><h2>Atualizar o aplicativo</h2></div></div>
              <button onClick={() => goTo('services')}><span><Icon name="pulse" /></span><div><b>Gerenciar serviços</b><small>Ativar horários e especialidades</small></div><Icon name="chevron" /></button>
              <button onClick={() => setNoticeType('ausencia')}><span><Icon name="bell" /></span><div><b>Publicar ausência</b><small>Avisar pacientes imediatamente</small></div><Icon name="chevron" /></button>
              <button onClick={() => goTo('units')}><span><Icon name="building" /></span><div><b>Ver rede de unidades</b><small>Conferir estrutura e contatos</small></div><Icon name="chevron" /></button>
            </article>
          </section>
        </>}

        {section === 'appointments' && <section className="admin-surface admin-agenda">
          <div className="admin-section-heading"><div><span className="admin-kicker">DADOS DO APLICATIVO</span><h2>Consultas agendadas</h2><p>Agendamentos realizados pelos pacientes aparecem nesta lista.</p></div><span className="admin-sync"><i /> Sincronizado</span></div>
          <div className="admin-agenda-summary"><span><b>{confirmed}</b>Confirmadas</span><span><b>{completed}</b>Concluídas</span><span><b>{cancelled}</b>Canceladas</span></div>
          <div className="admin-table-toolbar">
            <label><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar paciente, serviço ou código" /></label>
            <div>{(['all', 'confirmed', 'history'] as const).map(value => <button className={filter === value ? 'active' : ''} key={value} onClick={() => setFilter(value)}>{value === 'all' ? 'Todas' : value === 'confirmed' ? 'Confirmadas' : 'Histórico'}</button>)}</div>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-head"><span>Data</span><span>Paciente</span><span>Atendimento</span><span>Status</span><span>Ações</span></div>
            {visibleAppointments.map(item => <div className="admin-data-row" key={item.id}>
              <span><b>{new Date(`${item.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</b><small>{item.time}</small></span>
              <span className="admin-person"><i>{item.patientName.split(' ').map(part => part[0]).slice(0, 2).join('')}</i><span><b>{item.patientName}</b><small>{item.code}</small></span></span>
              <span><b>{item.specialty}</b><small>{item.professional}</small></span>
              <span><em className={`admin-status ${item.status}`}>{item.status === 'confirmed' ? 'Confirmada' : item.status === 'completed' ? 'Concluída' : 'Cancelada'}</em></span>
              <span>{item.status === 'confirmed' && <button onClick={() => completeAppointment(item.id)}>Concluir</button>}</span>
            </div>)}
            {visibleAppointments.length === 0 && <div className="admin-empty">Nenhuma consulta encontrada neste filtro.</div>}
          </div>
        </section>}

        {section === 'services' && <>
          <section className="admin-ticket-grid">
            {([
              ['Clínico geral', 'clinico', 20],
              ['Pediatria', 'pediatra', 10],
              ['Odontologia', 'dentista', 8],
            ] as const).map(([label, key, total]) => <article className="admin-surface" key={key}><span className="admin-kicker">{label}</span><div><strong>{tickets[key]}</strong><small>de {total} fichas disponíveis</small></div><div><button onClick={() => updateTickets(key, total, -1)}><Icon name="minus" /> Retirar</button><button onClick={() => updateTickets(key, total, 1)}><Icon name="plus" /> Adicionar</button></div></article>)}
          </section>
          <section className="admin-surface admin-services">
            <div className="admin-section-heading"><div><span className="admin-kicker">DISPONIBILIDADE NO APP</span><h2>Serviços e horários</h2><p>As alterações ficam disponíveis para o paciente neste navegador.</p></div><span className="admin-sync"><i /> Sincronizado</span></div>
            {selectedUnit.services.map(service => {
              const control = getService(service)
              const professional = selectedUnit.professionals.find(item => item.specialty === service)
              return <article className={!control.enabled ? 'disabled' : ''} key={service}>
                <div className="admin-service-title"><div><b>{service}</b><span>{professional?.name ?? 'Equipe da unidade'} · {unitAppointments.filter(item => item.specialty === service && item.status === 'confirmed').length} agendamentos</span></div><button className={control.enabled ? 'on' : ''} onClick={() => updateService(service, current => ({ ...current, enabled: !current.enabled }))}><i /><b>{control.enabled ? 'Ativo' : 'Suspenso'}</b></button></div>
                <div className="admin-time-grid"><span>Horários oferecidos</span><div>{TIMES.map(time => { const available = !control.blockedTimes.includes(time); return <button disabled={!control.enabled} className={available ? 'available' : 'blocked'} key={time} onClick={() => updateService(service, current => ({ ...current, blockedTimes: available ? [...current.blockedTimes, time] : current.blockedTimes.filter(item => item !== time) }))}>{time}</button> })}</div></div>
              </article>
            })}
          </section>
        </>}

        {section === 'communication' && <>
          <section className="admin-communication-hero">
            <div><span className="admin-kicker">COMUNICAÇÃO DIRETA</span><h2>O que precisa ser informado?</h2><p>Publique atualizações claras para quem acompanha esta unidade no aplicativo.</p></div>
            <div><button onClick={() => setNoticeType('ausencia')}><Icon name="users" /><span><b>Ausência profissional</b><small>Informe turno e previsão</small></span></button><button onClick={() => setNoticeType('servico')}><Icon name="pulse" /><span><b>Serviço indisponível</b><small>Avise sobre interrupções</small></span></button><button onClick={() => setNoticeType('outro')}><Icon name="bell" /><span><b>Comunicado geral</b><small>Publique outra atualização</small></span></button></div>
          </section>
          <section className="admin-surface admin-notices">
            <div className="admin-section-heading"><div><span className="admin-kicker">HISTÓRICO</span><h2>Avisos publicados</h2></div><span>{notices.filter(item => item.unit === selectedUnit.name).length} comunicados</span></div>
            {notices.filter(item => item.unit === selectedUnit.name).map(notice => <article key={notice.id}><span className={`admin-notice-kind ${notice.type}`}>{notice.type === 'ausencia' ? 'Ausência' : notice.type === 'servico' ? 'Serviço' : 'Geral'}</span><div><b>{notice.title}</b><p>{notice.message}</p></div><time>{new Date(notice.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '')}</time></article>)}
            {!notices.some(item => item.unit === selectedUnit.name) && <div className="admin-empty">Nenhum comunicado publicado por esta unidade.</div>}
          </section>
        </>}

        {section === 'units' && <section className="admin-unit-grid">
          {demoUnits.map(unit => {
            const unitControls = unit.services.map(service => serviceControls[`${unit.name}::${service}`] ?? { enabled: true, blockedTimes: [] })
            const unitBookings = appointments.filter(item => item.unit === unit.name && item.status === 'confirmed').length
            return <article className="admin-surface" key={unit.id}><div className="admin-unit-card-head"><span><Icon name="building" /></span><em>{unit.type === 'public' ? 'Pública' : 'Particular'}</em></div><h2>{unit.name}</h2><p>{unit.address} · {unit.region}</p><dl><div><dt>Serviços ativos</dt><dd>{unitControls.filter(item => item.enabled).length}/{unit.services.length}</dd></div><div><dt>Agendamentos</dt><dd>{unitBookings}</dd></div><div><dt>Funcionamento</dt><dd>{unit.hours.replace('Aberta ', '')}</dd></div></dl><button onClick={() => { setSelectedUnitId(unit.id); goTo('overview') }}>Gerenciar unidade <Icon name="chevron" /></button></article>
          })}
        </section>}
      </main>
    </div>

    {noticeType && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setNoticeType(null)}>
      <form className="admin-notice-modal" onMouseDown={event => event.stopPropagation()} onSubmit={event => { event.preventDefault(); publishNotice(new FormData(event.currentTarget)) }}>
        <div className="admin-modal-heading"><span><Icon name="bell" /></span><div><small>NOVO COMUNICADO</small><h2>{noticeType === 'ausencia' ? 'Informar ausência' : noticeType === 'servico' ? 'Serviço indisponível' : 'Publicar aviso'}</h2></div><button type="button" onClick={() => setNoticeType(null)} aria-label="Fechar"><Icon name="close" /></button></div>
        <p>Este conteúdo será exibido na área de avisos do aplicativo.</p>
        <label>Assunto<input name="subject" required placeholder={noticeType === 'ausencia' ? 'Ex.: Dra. Ana Martins' : noticeType === 'servico' ? 'Ex.: Sala de vacina' : 'Título claro do comunicado'} /></label>
        <label>Mensagem<textarea name="message" required rows={5} placeholder="Explique o que aconteceu, o período e a orientação para o paciente." /></label>
        <div><button type="button" onClick={() => setNoticeType(null)}>Cancelar</button><button type="submit">Publicar no aplicativo</button></div>
      </form>
    </div>}
  </div>
}
