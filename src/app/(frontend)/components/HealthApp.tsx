'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { demoUnits, type EstablishmentType } from '@/data/demo'

type View = 'inicio' | 'buscar' | 'ubs' | 'alertas' | 'avisos' | 'consultas' | 'ajuda' | 'perfil' | 'auth' | 'acessibilidade'
type ExperienceMode = 'standard' | 'simple' | 'calm' | 'contrast'
type AccessibilityNeed = 'visual' | 'auditory' | 'motor'
type AppointmentSummary = {
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
type ServiceControl = {
  enabled: boolean
  blockedTimes: string[]
}
type DemoUser = { name: string; email: string; provider: 'gov.br' | 'Google' | 'E-mail' }
type AuthMode = 'options' | 'email' | 'register' | 'forgot'

const BOOKING_TIMES = ['07:30', '08:30', '09:30', '10:30', '13:30', '14:30', '15:30']
const BOOKING_DAYS = 6
const toDateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const BrandMark = ({ full = false, compact = false }: { full?: boolean; compact?: boolean }) => full
  ? <Image className={`brand-lockup-image ${compact ? 'brand-lockup-image--selected' : ''}`} src="/brand/zelo-logo.webp" width={compact ? 96 : 180} height={compact ? 45 : 91} alt="Zelo — Tecnologia que Cuida" priority />
  : <Image className="brand-mark-image" src="/brand/zelo-mark.webp" width={48} height={48} alt="" aria-hidden="true" />

const Icon = ({ name, size = 20, className }: { name: string; size?: number; className?: string }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    contrast: <><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/></>,
    volume: <><path d="M5 9H2v6h3l5 4V5L5 9Z"/><path d="M14 8a5 5 0 0 1 0 8M17 5a9 9 0 0 1 0 14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1a2 2 0 0 0 .4-2.2A2 2 0 0 0 3 13.4H3V10h.2A2 2 0 0 0 5 8.8a2 2 0 0 0-.4-2.2l-.1-.1L7 3.9l.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 10.5 3v-.2h3.6V3a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.2V14h-.2a2 2 0 0 0-2.1 1Z"/></>,
  }
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const Toggle = ({ on, setOn, label }: { on: boolean; setOn: (v: boolean) => void; label: string }) => (
  <button className="toggle-row" onClick={() => setOn(!on)} aria-pressed={on}>
    <span>{label}</span><span className={`toggle ${on ? 'on' : ''}`}><span /></span>
  </button>
)

const BookingModal = ({ unitLabel, specialty, professionals, blockedTimes, predictable, initialDraft, appointments, isAuthenticated, onRequireAuth, onClose, onBooked, onViewAppointments, onGoHome }: { unitLabel: string; specialty: string; professionals: string[]; blockedTimes: string[]; predictable: boolean; initialDraft: AppointmentSummary | null; appointments: AppointmentSummary[]; isAuthenticated: boolean; onRequireAuth: (appointment: AppointmentSummary) => void; onClose: () => void; onBooked: (appointment: AppointmentSummary) => void; onViewAppointments: () => void; onGoHome: () => void }) => {
  const [step, setStep] = useState(initialDraft ? 4 : 1)
  const [professional, setProfessional] = useState(initialDraft?.professional ?? '')
  const [appointmentDate, setAppointmentDate] = useState(initialDraft?.appointmentDate ?? '')
  const [time, setTime] = useState(initialDraft?.time ?? '')
  const [patientName, setPatientName] = useState(initialDraft?.patientName ?? '')
  const [phone, setPhone] = useState(initialDraft?.phone ?? '')
  const [success, setSuccess] = useState<AppointmentSummary | null>(null)
  const [error, setError] = useState('')
  const dates = Array.from({ length: BOOKING_DAYS }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    return date
  })
  const defaultProfessional = professionals.length ? 'Primeiro profissional disponível' : 'Equipe da unidade'
  const availableTimes = BOOKING_TIMES.filter(slot => !blockedTimes.includes(slot) && !appointments.some(item => item.unit === unitLabel && item.specialty === specialty && item.appointmentDate === appointmentDate && item.time === slot && item.status !== 'cancelled'))

  const buildAppointment = (): AppointmentSummary => {
    const id = initialDraft?.id ?? String(Date.now())
    return {
      id,
      patientName,
      phone,
      unit: unitLabel,
      specialty,
      professional: professional || defaultProfessional,
      appointmentDate,
      time,
      status: 'confirmed',
      code: initialDraft?.code ?? `ZELO-${id.slice(-6)}`,
    }
  }

  const confirm = () => {
    if (patientName.trim().length < 3 || phone.trim().length < 8) {
      setError('Informe o nome completo e um telefone válido.')
      return
    }
    const appointment = buildAppointment()
    if (!isAuthenticated) {
      onRequireAuth(appointment)
      return
    }
    if (appointments.some(item => item.unit === appointment.unit && item.specialty === appointment.specialty && item.appointmentDate === appointment.appointmentDate && item.time === appointment.time && item.status !== 'cancelled')) {
      setError('Este horário acabou de ser reservado. Escolha outro horário.')
      setStep(3)
      return
    }
    onBooked(appointment)
    setSuccess(appointment)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="alert-modal booking-modal booking-flow" onMouseDown={event => event.stopPropagation()}>
      <div className="modal-heading"><div className="calendar-icon"><Icon name="clock" size={25} /></div><div><span className="eyebrow">AGENDAMENTO</span><h2>{success ? 'Atendimento confirmado' : 'Agendar atendimento'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar">×</button></div>
      {success ? <div className="booking-success"><span>✓</span><h3>Agendamento confirmado!</h3><p>Código <b>{success.code}</b></p><div className="confirmation-details"><span><b>Paciente</b>{success.patientName}</span><span><b>Unidade</b>{success.unit}</span><span><b>Serviço</b>{success.specialty}</span><span><b>Profissional</b>{success.professional}</span><span><b>Data e horário</b>{new Date(`${success.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR')} às {success.time}</span></div><button type="button" className="primary full" onClick={onViewAppointments}>Ver minhas consultas</button><button type="button" className="secondary full" onClick={onGoHome}>Voltar ao início</button></div> : <>
        <div className="booking-progress">{[1, 2, 3, 4].map(number => <span className={step >= number ? 'active' : ''} key={number}>{number}</span>)}</div>
        <div className="booking-summary"><b>{specialty}</b><span>{unitLabel}</span></div>
        {step === 1 && <div className="booking-step"><span className="eyebrow">ETAPA 1 DE 4</span><h3>{professionals.length ? 'Escolha o profissional' : 'Equipe responsável'}</h3><p>{professionals.length ? 'Você também pode selecionar o primeiro profissional disponível.' : 'Este serviço será encaminhado para a primeira pessoa disponível da equipe.'}</p><div className="professional-options"><button className={professional === '' ? 'selected' : ''} aria-pressed={professional === ''} onClick={() => setProfessional('')}>{professionals.length ? 'Primeiro disponível' : 'Equipe da unidade'}</button>{professionals.map(name => <button className={professional === name ? 'selected' : ''} aria-pressed={professional === name} key={name} onClick={() => setProfessional(name)}>{name}</button>)}</div><button className="primary full" onClick={() => setStep(2)}>Continuar</button></div>}
        {step === 2 && <div className="booking-step"><span className="eyebrow">ETAPA 2 DE 4</span><h3>Escolha a data</h3><p>Exibimos somente dias com disponibilidade.</p><div className="date-options">{dates.map(date => { const value = toDateValue(date); return <button className={appointmentDate === value ? 'selected' : ''} aria-pressed={appointmentDate === value} key={value} onClick={() => { setAppointmentDate(value); setTime('') }}><small>{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</small><b>{date.getDate()}</b><span>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></button> })}</div><div className="booking-step-actions"><button className="secondary" onClick={() => setStep(1)}>Voltar</button><button className="primary" disabled={!appointmentDate} onClick={() => setStep(3)}>Continuar</button></div></div>}
        {step === 3 && <div className="booking-step"><span className="eyebrow">ETAPA 3 DE 4</span><h3>Escolha o horário</h3><p>{availableTimes.length} horários disponíveis para esta data.</p><div className="time-options">{availableTimes.map(slot => <button className={time === slot ? 'selected' : ''} aria-pressed={time === slot} key={slot} onClick={() => setTime(slot)}>{slot}</button>)}</div>{availableTimes.length === 0 && <div className="form-error">Não há horários livres nesta data. Volte e escolha outro dia.</div>}<div className="booking-step-actions"><button className="secondary" onClick={() => setStep(2)}>Voltar</button><button className="primary" disabled={!time} onClick={() => setStep(4)}>Revisar</button></div></div>}
        {step === 4 && <div className="booking-step"><span className="eyebrow">ETAPA 4 DE 4</span><h3>Revise seu agendamento</h3>{predictable && <div className="predictable-review-note"><b>O que acontecerá depois</b><span>Ao confirmar, este horário ficará reservado e aparecerá em “Minhas consultas”. Você poderá cancelar depois.</span></div>}<div className="review-grid"><span><b>Unidade</b>{unitLabel}</span><span><b>Serviço</b>{specialty}</span><span><b>Profissional ou equipe</b>{professional || defaultProfessional}</span><span><b>Data e horário</b>{appointmentDate ? new Date(`${appointmentDate}T12:00:00`).toLocaleDateString('pt-BR') : ''} às {time}</span></div><label>Nome completo<input value={patientName} onChange={event => setPatientName(event.target.value)} placeholder="Digite seu nome completo" /></label><label>Telefone<input value={phone} onChange={event => setPhone(event.target.value)} type="tel" placeholder="(81) 99999-9999" /></label>{!isAuthenticated && <div className="auth-required-note"><Icon name="user" size={18} /><span>Para confirmar, faça uma identificação demonstrativa. Seus dados serão preservados.</span></div>}{error && <div className="form-error">{error}</div>}<div className="booking-step-actions"><button className="secondary" onClick={() => setStep(3)}>Voltar</button><button className="primary" onClick={confirm}>{isAuthenticated ? 'Confirmar agendamento' : 'Continuar para identificação'}</button></div></div>}
      </>}
    </div>
  </div>
}

export default function App() {
  const [role, setRole] = useState<'usuario' | null>(null)
  const [userType, setUserType] = useState<'PCD' | 'Idoso' | 'TEA' | 'Padrão' | null>(null)
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('standard')
  const [pcdNeeds, setPcdNeeds] = useState<AccessibilityNeed[]>([])
  const [pcdSelectionOpen, setPcdSelectionOpen] = useState(false)
  const [guidedStep, setGuidedStep] = useState(0)
  const [voiceCommandsOpen, setVoiceCommandsOpen] = useState(false)
  const [isPriority, setIsPriority] = useState(false)
  const [view, setView] = useState<View>('inicio')
  const [fontScale, setFontScale] = useState(1)
  const [contrast, setContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechMessage, setSpeechMessage] = useState('')
  const [query, setQuery] = useState('')
  const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | EstablishmentType>('all')
  const [unitNotices, setUnitNotices] = useState<UnitNotice[]>([])
  const [serviceControls, setServiceControls] = useState<Record<string, ServiceControl>>({})
  const [push, setPush] = useState(true)
  const [doctors, setDoctors] = useState(true)
  const [vaccines, setVaccines] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState('UBS Policlínica Lessa de Andrade')
  const [bookingSpecialty, setBookingSpecialty] = useState<string | null>(null)
  const [scheduleChoice, setScheduleChoice] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
  const [authUser, setAuthUser] = useState<DemoUser | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('options')
  const [authReturn, setAuthReturn] = useState<View>('inicio')
  const [authCancelReturn, setAuthCancelReturn] = useState<View>('inicio')
  const [pendingBooking, setPendingBooking] = useState<AppointmentSummary | null>(null)
  const [authMessage, setAuthMessage] = useState('')
  const [consultationTab, setConsultationTab] = useState<'upcoming' | 'history'>('upcoming')
  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentSummary | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AppointmentSummary | null>(null)
  const [favoriteUnits, setFavoriteUnits] = useState<string[]>([])

  const applyExperienceMode = (mode: ExperienceMode, persist = false) => {
    setExperienceMode(mode)
    setContrast(mode === 'contrast')
    setFontScale(mode === 'simple' ? 1.12 : 1)
    if (persist) window.localStorage.setItem('tecnologia-que-cuida-mode', mode)
  }

  useEffect(() => {
    const lastUnit = window.localStorage.getItem('saude-perto-last-unit')
    if (lastUnit) setSelectedUnit(lastUnit)
    const savedFavorites = window.localStorage.getItem('tecnologia-que-cuida-favorites')
    if (savedFavorites) {
      try { setFavoriteUnits(JSON.parse(savedFavorites) as string[]) } catch { setFavoriteUnits([]) }
    } else {
      setFavoriteUnits([demoUnits[0].bookingName])
    }
    const savedAppointments = window.localStorage.getItem('tecnologia-que-cuida-appointments')
    if (savedAppointments) {
      try {
        const parsed = JSON.parse(savedAppointments) as Array<Partial<AppointmentSummary> & Pick<AppointmentSummary, 'id' | 'patientName' | 'unit' | 'specialty' | 'appointmentDate' | 'time'>>
        setAppointments(parsed.map(item => ({
          ...item,
          phone: item.phone ?? '',
          professional: item.professional ?? 'Primeiro profissional disponível',
          status: item.status ?? 'confirmed',
          code: item.code ?? `ZELO-${item.id.slice(-6)}`,
        })))
      } catch { setAppointments([]) }
    }
    const savedNotices = window.localStorage.getItem('tecnologia-que-cuida-unit-notices')
    if (savedNotices) {
      try { setUnitNotices(JSON.parse(savedNotices) as UnitNotice[]) } catch { setUnitNotices([]) }
    }
    const savedServiceControls = window.localStorage.getItem('tecnologia-que-cuida-service-controls')
    if (savedServiceControls) {
      try { setServiceControls(JSON.parse(savedServiceControls) as Record<string, ServiceControl>) } catch { setServiceControls({}) }
    }
    const savedUser = window.localStorage.getItem('zelo-demo-user')
    if (savedUser) {
      try { setAuthUser(JSON.parse(savedUser) as DemoUser) } catch { setAuthUser(null) }
    }
    const storedMode = window.localStorage.getItem('tecnologia-que-cuida-mode') as ExperienceMode | null
    const savedMode = storedMode ?? 'standard'
    applyExperienceMode(savedMode)
    const savedFontScale = Number(window.localStorage.getItem('tecnologia-que-cuida-font-scale'))
    if ([.9, 1, 1.12].includes(savedFontScale)) setFontScale(savedFontScale)
    const savedContrast = window.localStorage.getItem('tecnologia-que-cuida-contrast')
    if (savedContrast !== null) setContrast(savedContrast === 'true')
    setReduceMotion(window.localStorage.getItem('tecnologia-que-cuida-reduce-motion') === 'true')
    const savedType = window.localStorage.getItem('tecnologia-que-cuida-profile') as 'PCD' | 'Idoso' | 'TEA' | 'Padrão' | null
    const savedNeeds = window.localStorage.getItem('tecnologia-que-cuida-pcd-needs')
    let restoredNeeds: AccessibilityNeed[] = []
    if (savedNeeds) {
      try { restoredNeeds = JSON.parse(savedNeeds) as AccessibilityNeed[]; setPcdNeeds(restoredNeeds) } catch { setPcdNeeds([]) }
    }
    if (savedType) {
      setUserType(savedType)
      setIsPriority(savedType !== 'Padrão')
      if (savedType === 'Idoso') { setExperienceMode('simple'); setFontScale(1.12); setReduceMotion(false) }
      if (savedType === 'TEA') { setExperienceMode('calm'); setReduceMotion(true); setContrast(false) }
      if (savedType === 'PCD') {
        setExperienceMode(restoredNeeds.includes('visual') ? 'contrast' : 'standard')
        setContrast(restoredNeeds.includes('visual'))
        setFontScale(restoredNeeds.includes('visual') ? 1.12 : 1)
      }
      if (window.localStorage.getItem('tecnologia-que-cuida-onboarding') === 'complete') {
        setRole('usuario')
        setView('inicio')
      }
    }
  }, [])

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }) }

  const activateProfile = (profile: 'PCD' | 'Idoso' | 'TEA' | 'Padrão', needs: AccessibilityNeed[] = []) => {
    setUserType(profile)
    setPcdNeeds(needs)
    setIsPriority(profile !== 'Padrão')
    const mode: ExperienceMode = profile === 'Idoso' ? 'simple' : profile === 'TEA' ? 'calm' : profile === 'PCD' && needs.includes('visual') ? 'contrast' : 'standard'
    setExperienceMode(mode)
    setFontScale(profile === 'Idoso' || needs.includes('visual') ? 1.12 : 1)
    setContrast(needs.includes('visual'))
    setReduceMotion(profile === 'TEA')
    window.localStorage.setItem('tecnologia-que-cuida-profile', profile)
    window.localStorage.setItem('tecnologia-que-cuida-pcd-needs', JSON.stringify(needs))
    window.localStorage.setItem('tecnologia-que-cuida-priority', String(profile !== 'Padrão'))
    window.localStorage.setItem('tecnologia-que-cuida-mode', mode)
    window.localStorage.setItem('tecnologia-que-cuida-onboarding', 'complete')
    window.localStorage.setItem('tecnologia-que-cuida-font-scale', String(profile === 'Idoso' || needs.includes('visual') ? 1.12 : 1))
    window.localStorage.setItem('tecnologia-que-cuida-contrast', String(needs.includes('visual')))
    window.localStorage.setItem('tecnologia-que-cuida-reduce-motion', String(profile === 'TEA'))
    setPcdSelectionOpen(false)
    setGuidedStep(0)
    setRole('usuario')
    setView('inicio')
  }

  const updateFontScale = (scale: number) => {
    setFontScale(scale)
    window.localStorage.setItem('tecnologia-que-cuida-font-scale', String(scale))
  }

  const updateContrast = (enabled: boolean) => {
    setContrast(enabled)
    window.localStorage.setItem('tecnologia-que-cuida-contrast', String(enabled))
  }

  const updateReduceMotion = (enabled: boolean) => {
    setReduceMotion(enabled)
    window.localStorage.setItem('tecnologia-que-cuida-reduce-motion', String(enabled))
  }

  const readCurrentScreen = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechMessage('A leitura em voz alta não está disponível neste navegador.')
      return
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeechMessage('Leitura interrompida.')
      return
    }
    const content = document.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim()
    if (!content) return
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.lang = 'pt-BR'
    utterance.rate = .9
    utterance.onend = () => { setIsSpeaking(false); setSpeechMessage('Leitura concluída.') }
    utterance.onerror = () => { setIsSpeaking(false); setSpeechMessage('Não foi possível concluir a leitura.') }
    setSpeechMessage('Lendo o conteúdo desta tela.')
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const titles: Record<View, string> = {
    inicio: 'Bom dia, como podemos ajudar?',
    buscar: 'Encontrar uma Unidade de Saúde',
    ubs: demoUnits.find(unit => unit.bookingName === selectedUnit)?.name ?? selectedUnit,
    alertas: 'Alertas e avisos',
    avisos: 'Avisos das unidades',
    consultas: 'Minhas consultas',
    ajuda: 'Como podemos ajudar?',
    perfil: 'Seu perfil',
    auth: 'Identificação',
    acessibilidade: 'Acessibilidade',
  }

  const saveAppointment = (appointment: AppointmentSummary) => {
    setPendingBooking(null)
    setAppointments(current => {
      if (current.some(item => item.id === appointment.id)) return current
      const updated = [appointment, ...current]
      window.localStorage.setItem('tecnologia-que-cuida-appointments', JSON.stringify(updated))
      return updated
    })
  }

  const cancelAppointment = (appointmentId: string) => {
    setAppointments(current => {
      const updated = current.map(item => item.id === appointmentId ? { ...item, status: 'cancelled' as const } : item)
      window.localStorage.setItem('tecnologia-que-cuida-appointments', JSON.stringify(updated))
      return updated
    })
    setCancelTarget(null)
    setAppointmentDetail(null)
    setConsultationTab('history')
  }

  const openAuthentication = (returnTo: View, booking: AppointmentSummary | null = null) => {
    setAuthReturn(returnTo)
    setAuthCancelReturn(view === 'auth' ? 'inicio' : view)
    setPendingBooking(booking)
    setAuthMode('options')
    setAuthMessage('')
    setBookingSpecialty(null)
    navigate('auth')
  }

  const finishDemoAuthentication = (user: DemoUser) => {
    setAuthUser(user)
    window.localStorage.setItem('zelo-demo-user', JSON.stringify(user))
    setAuthMessage('')
    if (pendingBooking) {
      setView('ubs')
      setBookingSpecialty(pendingBooking.specialty)
      return
    }
    navigate(authReturn)
  }

  const signOutDemo = () => {
    setAuthUser(null)
    window.localStorage.removeItem('zelo-demo-user')
    navigate('inicio')
  }

  const exportAppointment = (appointment: AppointmentSummary) => {
    const printable = window.open('', '_blank', 'width=720,height=850')
    if (!printable) return
    printable.document.write(`<!doctype html><html><head><title>Ficha de consulta</title><style>body{font-family:Arial,sans-serif;color:#123f52;padding:40px}header{border-bottom:3px solid #176b87;padding-bottom:18px;margin-bottom:28px}h1{font-size:28px}.card{border:1px solid #cbdcd9;border-radius:14px;padding:24px}.row{margin:16px 0}.label{display:block;color:#637871;font-size:12px;text-transform:uppercase;font-weight:bold;margin-bottom:5px}.value{font-size:18px;font-weight:bold}.note{margin-top:30px;padding:16px;background:#f1f6f3;border-radius:10px;font-size:13px}@media print{body{padding:15px}}</style></head><body><header><h1>Zelo - Tecnologia que Cuida</h1><p>Comprovante de agendamento</p></header><div class="card"><div class="row"><span class="label">Paciente</span><span class="value" id="patient"></span></div><div class="row"><span class="label">Unidade</span><span class="value" id="unit"></span></div><div class="row"><span class="label">Especialidade</span><span class="value" id="specialty"></span></div><div class="row"><span class="label">Data e horário</span><span class="value" id="datetime"></span></div><div class="row"><span class="label">Código</span><span class="value" id="code"></span></div></div><div class="note">Chegue com 15 minutos de antecedência e leve um documento com foto e o Cartão SUS.</div></body></html>`)
    printable.document.getElementById('patient')!.textContent = appointment.patientName
    printable.document.getElementById('unit')!.textContent = appointment.unit
    printable.document.getElementById('specialty')!.textContent = appointment.specialty
    printable.document.getElementById('datetime')!.textContent = `${new Date(`${appointment.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR')} às ${appointment.time}`
    printable.document.getElementById('code')!.textContent = appointment.code
    printable.document.close()
    printable.focus()
    window.setTimeout(() => printable.print(), 300)
  }

  const selectUnit = (unit: string) => {
    setQuery(unit)
    setSelectedUnit(unit)
    window.localStorage.setItem('saude-perto-last-unit', unit)
    navigate('ubs')
  }

  const toggleFavorite = (unit: string) => {
    setFavoriteUnits(current => {
      const updated = current.includes(unit) ? current.filter(item => item !== unit) : [...current, unit]
      window.localStorage.setItem('tecnologia-que-cuida-favorites', JSON.stringify(updated))
      return updated
    })
  }

  const selectedUnitData = demoUnits.find(unit => unit.bookingName === selectedUnit) ?? demoUnits[0]
  const serviceControlKey = (unitName: string, service: string) => `${unitName}::${service}`
  const getServiceControl = (unitName: string, service: string): ServiceControl => serviceControls[serviceControlKey(unitName, service)] ?? { enabled: true, blockedTimes: [] }
  const getNextAvailableSlot = (unitName: string, service: string, serviceIndex: number) => {
    const control = getServiceControl(unitName, service)
    if (!control.enabled) return null
    const orderedTimes = BOOKING_TIMES.map((_, index) => BOOKING_TIMES[(index + serviceIndex) % BOOKING_TIMES.length]).filter(time => !control.blockedTimes.includes(time))
    for (let dayIndex = 1; dayIndex <= BOOKING_DAYS; dayIndex += 1) {
      const date = new Date()
      date.setDate(date.getDate() + dayIndex)
      const appointmentDate = toDateValue(date)
      const availableTime = orderedTimes.find(time => !appointments.some(item => item.unit === unitName && item.specialty === service && item.appointmentDate === appointmentDate && item.time === time && item.status !== 'cancelled'))
      if (availableTime) {
        const dayLabel = dayIndex === 1 ? 'Amanhã' : date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '')
        return `${dayLabel}, ${availableTime}`
      }
    }
    return null
  }
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const upcomingAppointments = appointments.filter(item => item.status === 'confirmed' && item.appointmentDate >= today)
  const appointmentHistory = appointments.filter(item => item.status !== 'confirmed' || item.appointmentDate < today)
  const visibleAppointments = consultationTab === 'upcoming' ? upcomingAppointments : appointmentHistory
  const normalizedQuery = query.trim().toLowerCase()
  const units = demoUnits.filter(unit => {
    const matchesType = unitTypeFilter === 'all' || unit.type === unitTypeFilter
    const searchable = [unit.name, unit.city, unit.region, unit.organization, ...unit.services].join(' ').toLowerCase()
    return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery))
  })

  const profileExperience = {
    PCD: {
      greeting: 'Olá! Encontre atendimento acessível perto de você',
      description: 'Consulte unidades, recursos de acessibilidade e atendimento prioritário.',
      title: 'Atendimento prioritário',
      text: 'Você tem direito a atendimento prioritário. Ao chegar à unidade, apresente um documento de identificação.',
      label: 'Perfil PCD',
    },
    Idoso: {
      greeting: 'Olá! Vamos cuidar da sua saúde?',
      description: 'Veja fichas e agende sua consulta de forma simples e segura.',
      title: 'Atendimento para pessoas 60+',
      text: 'Você tem atendimento prioritário. Se precisar, peça ajuda a um familiar ou profissional da unidade.',
      label: 'Perfil 60+',
    },
    TEA: {
      greeting: 'Olá! Organize seu atendimento com tranquilidade',
      description: 'Informações claras sobre horários, profissionais e movimento da unidade.',
      title: 'Atendimento previsível',
      text: 'Consulte os horários antes de sair. Você pode informar suas necessidades de acolhimento ao agendar.',
      label: 'Perfil TEA',
    },
    Padrão: {
      greeting: 'Bom dia, como podemos ajudar?',
      description: 'Consulte fichas, profissionais e avisos da sua unidade antes de sair de casa.',
      title: 'Informação antes de sair',
      text: 'Os dados são atualizados pela equipe da unidade. Confira o horário da última atualização.',
      label: 'Perfil padrão',
    },
  }[userType ?? 'Padrão']

  if (!role) {
    const profiles = [
      ['Idoso', 'Pessoa idosa (60+)', 'Orientação guiada, voz e ações grandes'],
      ['PCD', 'Pessoa com deficiência', 'Combine recursos visuais, auditivos e motores'],
      ['TEA', 'Pessoa neurodivergente (TEA)', 'Navegação previsível, literal e sem estímulos'],
      ['Padrão', 'Nenhuma preferência', 'Usar a experiência padrão do aplicativo'],
    ] as const
    return (
      <div className="entry profile-onboarding">
        <div className="entry-brand profile-entry-brand">
          <BrandMark full compact />
        </div>
        <section className="profile-choice direct">
          <span className="eyebrow">SUA EXPERIÊNCIA COMEÇA AQUI</span>
          <h1>Como você prefere usar o Zelo?</h1>
          <p>Escolha uma opção. A organização do aplicativo será adaptada automaticamente para você.</p>
          <div className="profile-options">
            {profiles.map(([value, title, description]) => <button key={value} onClick={() => {
              if (value === 'PCD') { setPcdSelectionOpen(true); return }
              activateProfile(value)
            }}>
              <span className={`profile-symbol ${value.toLowerCase()}`}>{value === 'Idoso' ? '60+' : value === 'Padrão' ? '✓' : value}</span>
              <span><b>{title}</b><small>{description}</small></span>
              <Icon name="arrow" />
            </button>)}
          </div>
          {pcdSelectionOpen && <div className="pcd-needs-panel" role="group" aria-labelledby="pcd-needs-title">
            <div className="pcd-needs-heading"><div><span className="eyebrow">VOCÊ PODE ESCOLHER MAIS DE UMA</span><h2 id="pcd-needs-title">Quais recursos ajudam você?</h2></div><button onClick={() => { setPcdSelectionOpen(false); setPcdNeeds([]) }} aria-label="Fechar">×</button></div>
            <div className="pcd-needs-grid">
              {([
                ['visual', 'Deficiência visual', 'Alto contraste, leitura em voz alta e descrições textuais', 'Aa'],
                ['auditory', 'Deficiência auditiva', 'Alertas escritos, ícones com texto e confirmações visuais', 'TXT'],
                ['motor', 'Deficiência motora', 'Áreas grandes, menos interações e comandos de voz simulados', 'VOZ'],
              ] as Array<[AccessibilityNeed, string, string, string]>).map(([need, title, description, symbol]) => <button className={pcdNeeds.includes(need) ? 'selected' : ''} aria-pressed={pcdNeeds.includes(need)} key={need} onClick={() => setPcdNeeds(current => current.includes(need) ? current.filter(item => item !== need) : [...current, need])}><span>{symbol}</span><span><b>{title}</b><small>{description}</small></span><i>{pcdNeeds.includes(need) ? '✓' : ''}</i></button>)}
            </div>
            <button className="primary full" disabled={pcdNeeds.length === 0} onClick={() => activateProfile('PCD', pcdNeeds)}>Continuar com {pcdNeeds.length} {pcdNeeds.length === 1 ? 'adaptação' : 'adaptações'}</button>
          </div>}
          <div className="privacy-note"><span>i</span> Não é necessário criar uma conta. Você pode alterar essa escolha depois.</div>
        </section>
      </div>
    )
  }

  return (
    <div className={`${contrast ? 'app high-contrast' : 'app'} ${reduceMotion ? 'reduced-motion' : ''} profile-${(userType ?? 'Padrão').toLowerCase()} ${pcdNeeds.map(need => `needs-${need}`).join(' ')} mode-${experienceMode}`} style={{ fontSize: `${fontScale}em` }}>
      <header>
        <button className="brand" onClick={() => navigate('inicio')} aria-label="Ir para o início">
          <span className="brand-mark main-brand-mark brand-mark-art"><BrandMark /></span>
          <span><b>Zelo</b><small>Tecnologia que Cuida</small></span>
        </button>
        <div className="header-actions">
          {(userType === 'Idoso' || pcdNeeds.includes('visual')) && <button className={`header-voice-button ${isSpeaking ? 'active' : ''}`} onClick={readCurrentScreen}><Icon name="volume" /> {isSpeaking ? 'Parar leitura' : 'Ouvir tela'}</button>}
          {userType === 'Idoso' && <button className="header-help-button" onClick={() => navigate('ajuda')} aria-label="Preciso de ajuda"><span className="header-help-symbol" aria-hidden="true">?</span><span className="header-help-label">Preciso de ajuda</span></button>}
          <button className="access-button" onClick={() => navigate('acessibilidade')}><Icon name="contrast" /> Acessibilidade</button>
          <button className="exit-button" onClick={() => setRole(null)}>Trocar acesso</button>
          <button className="avatar" onClick={() => navigate('perfil')} aria-label="Abrir perfil">{authUser ? authUser.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() : 'VS'}</button>
        </div>
      </header>

      <main>
        {view !== 'inicio' && view !== 'auth' && <button className="back" onClick={() => navigate('inicio')}>← Voltar ao início</button>}

        {view === 'inicio' && userType === 'Idoso' && <section className="guided-home">
          <div className="guided-welcome">
            <div><span className="eyebrow">EXPERIÊNCIA GUIADA</span><h1>Olá. Vamos fazer uma coisa de cada vez.</h1><p>Use os botões “Próximo” e “Voltar”. Se preferir, toque em “Ouvir instruções”.</p></div>
            <button className={`guided-voice ${isSpeaking ? 'speaking' : ''}`} onClick={readCurrentScreen}><Icon name="volume" size={32} /><span><b>{isSpeaking ? 'Parar leitura' : 'Ouvir instruções'}</b><small>O Zelo lê esta tela para você</small></span></button>
          </div>
          <div className="guided-progress"><span>Passo {guidedStep + 1} de 3</span><div>{[0, 1, 2].map(step => <i className={guidedStep >= step ? 'active' : ''} key={step} />)}</div></div>
          <article className="guided-task-card">
            {guidedStep === 0 && <><span className="guided-number">1</span><h2>O que você quer fazer hoje?</h2><p>Primeiro, vamos escolher a tarefa. No próximo passo, você verá somente as opções necessárias.</p><button className="guided-primary" onClick={() => setGuidedStep(1)}>Começar <span>→</span></button></>}
            {guidedStep === 1 && <><span className="guided-number">2</span><h2>Escolha uma ação</h2><p>Toque em uma opção. Você poderá voltar sem perder seus dados.</p><div className="guided-actions"><button onClick={() => setScheduleChoice(true)}><Icon name="clock" size={30} /><span><b>Marcar uma consulta</b><small>Escolher unidade, serviço, dia e horário</small></span></button><button onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}><Icon name="user" size={30} /><span><b>Ver minhas consultas</b><small>Consultar horários já marcados</small></span></button></div></>}
            {guidedStep === 2 && <><span className="guided-number">3</span><h2>Outras opções</h2><p>Você também pode procurar uma unidade ou ler avisos de atendimento.</p><div className="guided-actions"><button onClick={() => { setQuery(''); navigate('buscar') }}><Icon name="search" size={30} /><span><b>Encontrar uma unidade</b><small>Ver locais próximos e serviços</small></span></button><button onClick={() => navigate('avisos')}><Icon name="bell" size={30} /><span><b>Ver avisos das unidades</b><small>Conferir mudanças antes de sair</small></span></button></div></>}
          </article>
          <div className="guided-controls"><button disabled={guidedStep === 0} onClick={() => setGuidedStep(step => Math.max(0, step - 1))}>← Voltar</button><button className="guided-help" onClick={() => navigate('ajuda')}>Preciso de ajuda</button><button disabled={guidedStep === 2} onClick={() => setGuidedStep(step => Math.min(2, step + 1))}>Próximo →</button></div>
          <aside className="always-help"><span>?</span><div><b>Ajuda sempre disponível</b><p>Você pode pedir ajuda para agendar por telefone ou presencialmente.</p></div><button onClick={() => navigate('ajuda')}>Abrir ajuda</button></aside>
        </section>}

        {view === 'inicio' && userType === 'TEA' && <section className="predictable-home page narrow">
          <div className="predictable-heading"><span className="eyebrow">INÍCIO</span><h1>Escolha uma tarefa</h1><p>Uma tarefa será aberta por vez. Nenhuma ação acontece sem sua confirmação.</p></div>
          <div className="predictable-progress"><span>Etapa atual</span><b>1. Escolher tarefa</b><i>1 de 4</i></div>
          <div className="predictable-task-list">
            <button onClick={() => { setQuery(''); navigate('buscar') }}><span>1</span><div><b>Encontrar uma unidade</b><small>Pesquisar por nome, região ou serviço.</small></div><span>Continuar →</span></button>
            <button onClick={() => setScheduleChoice(true)}><span>2</span><div><b>Agendar atendimento</b><small>Escolher unidade, serviço, data e horário.</small></div><span>Continuar →</span></button>
            <button onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}><span>3</span><div><b>Ver minhas consultas</b><small>Consultar ou cancelar um agendamento.</small></div><span>Continuar →</span></button>
            <button onClick={() => navigate('ajuda')}><span>4</span><div><b>Acessar ajuda</b><small>Ler respostas ou falar com uma pessoa.</small></div><span>Continuar →</span></button>
          </div>
          <div className="predictable-note"><b>O que acontece agora?</b><p>Depois de escolher, o Zelo mostrará somente as informações daquela tarefa. Use “Voltar ao início” para retornar a esta lista.</p></div>
        </section>}

        {view === 'inicio' && userType === 'PCD' && <section className="accessible-home page narrow">
          <div className="accessible-heading"><div><span className="eyebrow">EXPERIÊNCIA ACESSÍVEL</span><h1>O que você precisa fazer?</h1><p>Todos os controles têm descrição em texto e seguem uma ordem simples de navegação.</p></div>{pcdNeeds.includes('visual') && <button className={`accessible-listen ${isSpeaking ? 'active' : ''}`} onClick={readCurrentScreen}><Icon name="volume" size={28} /><span><b>{isSpeaking ? 'Parar leitura' : 'Ouvir esta tela'}</b><small>Leitura em voz alta</small></span></button>}</div>
          <div className="active-adaptations" aria-label="Adaptações ativas">{pcdNeeds.map(need => <span key={need}>✓ {need === 'visual' ? 'Recursos visuais' : need === 'auditory' ? 'Informações em texto' : 'Interação ampliada'}</span>)}</div>
          {pcdNeeds.includes('auditory') && <div className="written-confirmation"><b>Informações importantes sempre aparecem por escrito.</b><p>Avisos, confirmações e próximos passos serão exibidos em texto nesta experiência.</p></div>}
          {pcdNeeds.includes('motor') && <div className="voice-command-panel"><button onClick={() => setVoiceCommandsOpen(!voiceCommandsOpen)} aria-expanded={voiceCommandsOpen}><Icon name="volume" size={25} /><span><b>Usar comando de voz simulado</b><small>Escolha uma frase sem precisar digitar</small></span><span>{voiceCommandsOpen ? 'Fechar' : 'Abrir'}</span></button>{voiceCommandsOpen && <div><span>Diga ou selecione:</span><button onClick={() => setScheduleChoice(true)}>“Agendar consulta”</button><button onClick={() => { setQuery(''); navigate('buscar') }}>“Encontrar unidade”</button><button onClick={() => navigate('ajuda')}>“Preciso de ajuda”</button></div>}</div>}
          <div className="accessible-action-list">
            <button onClick={() => { setQuery(''); navigate('buscar') }} aria-label="Encontrar uma unidade de saúde. Pesquisar locais e serviços"><Icon name="search" size={28} /><span><b>Encontrar unidade</b><small>Pesquisar locais, acessibilidade e serviços disponíveis</small></span><span>→</span></button>
            <button onClick={() => setScheduleChoice(true)} aria-label="Agendar atendimento. Escolher unidade, serviço, data e horário"><Icon name="clock" size={28} /><span><b>Agendar atendimento</b><small>Escolher serviço, profissional, data e horário</small></span><span>→</span></button>
            <button onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')} aria-label="Ver minhas consultas e comprovantes"><Icon name="user" size={28} /><span><b>Minhas consultas</b><small>Ver agendamentos, comprovantes e cancelamentos</small></span><span>→</span></button>
            <button onClick={() => navigate('ajuda')} aria-label="Abrir ajuda com instruções em texto"><span className="accessible-question">?</span><span><b>Ajuda</b><small>Instruções escritas e atendimento humano</small></span><span>→</span></button>
          </div>
        </section>}

        {view === 'inicio' && userType === 'Padrão' && <>
          <section className="hero">
            <div className="profile-context"><span>✓</span>{profileExperience.label}<button onClick={() => setRole(null)}>Alterar</button></div>
            <span className="eyebrow">SAÚDE PERTO DE VOCÊ</span>
            <h1>{profileExperience.greeting}</h1>
            <p>{profileExperience.description}</p>
            <button className="location" onClick={() => { setQuery('Recife'); navigate('buscar') }}><Icon name="map" /> Usar minha localização</button>
          </section>

          <section className="content-section">
            <div className="support-banner">
              <div className="support-symbol">i</div>
              <div><span className="eyebrow">BOM SABER</span><h2>{profileExperience.title}</h2><p>{profileExperience.text}</p></div>
            </div>
            <div className="quick-section">
              <span className="eyebrow">O QUE VOCÊ PRECISA?</span>
              <div className="quick-grid">
                <button onClick={() => { setQuery(''); navigate('buscar') }}><span><Icon name="search" size={24} /></span><b>Encontrar unidade</b><small>Busque por nome, região ou serviço</small><Icon name="arrow" /></button>
                <button onClick={() => setScheduleChoice(true)}><span><Icon name="clock" size={24} /></span><b>Agendar consulta</b><small>Use sua última unidade ou escolha outra</small><Icon name="arrow" /></button>
                <button onClick={() => navigate('avisos')}><span><Icon name="bell" size={24} /></span><b>Ver avisos</b><small>Veja a situação de cada unidade</small><Icon name="arrow" /></button>
                <button onClick={() => navigate('ajuda')}><span className="quick-help-icon" aria-hidden="true">?</span><b>Preciso de ajuda</b><small>Respostas e atendimento humano</small><Icon name="arrow" /></button>
              </div>
            </div>
            <div className="section-title">
              <div><span className="eyebrow">ACESSO RÁPIDO</span><h2>Minhas unidades</h2></div>
              <button className="text-button" onClick={() => { setQuery(''); navigate('buscar') }}>Ver todas</button>
            </div>
            <article className="unit-card" role="button" tabIndex={0} onClick={() => selectUnit(demoUnits[0].bookingName)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') selectUnit(demoUnits[0].bookingName) }}>
              <div className="unit-top">
                <div className="hospital-icon">+</div>
                <div className="grow"><div className="status normal"><i /> {demoUnits[0].status}</div><h3>{demoUnits[0].name}</h3><p>{demoUnits[0].address} · {demoUnits[0].region}</p></div>
                <button className="heart" aria-label={favoriteUnits.includes(demoUnits[0].bookingName) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-pressed={favoriteUnits.includes(demoUnits[0].bookingName)} onClick={event => { event.stopPropagation(); toggleFavorite(demoUnits[0].bookingName) }}><Icon className="favorite-card-icon" name="heart" /></button>
              </div>
              <div className="unit-info">
                <span><Icon name="map" /> 1,2 km de você</span>
                <span><Icon name="clock" /> Aberta até 17h</span>
                <button onClick={event => { event.stopPropagation(); selectUnit(demoUnits[0].bookingName) }}>Ver fichas <Icon name="arrow" /></button>
              </div>
            </article>
          </section>
        </>}

        {view === 'buscar' && <section className="page narrow find-unit-page">
          <div className="page-heading"><div><span className="eyebrow">PERTO DE VOCÊ</span><h1>{titles[view]}</h1><p>Pesquise por nome, cidade, região ou serviço.</p></div></div>
          <div className="unit-search-field">
            <Icon name="search" size={22} />
            <input autoFocus aria-label="Pesquisar Unidade de Saúde" placeholder="Nome, região ou serviço" value={query} onChange={event => setQuery(event.target.value)} />
            {query && <button aria-label="Limpar pesquisa" onClick={() => setQuery('')}>×</button>}
          </div>
          <button className="use-location-button" onClick={() => { setQuery('Recife'); setUnitTypeFilter('all') }}><Icon name="map" /> Usar minha localização</button>
          <div className="unit-type-filters" aria-label="Filtrar por tipo de estabelecimento">
            {([['all', 'Todas'], ['public', 'Públicas'], ['private', 'Particulares']] as const).map(([value, label]) => <button className={unitTypeFilter === value ? 'active' : ''} key={value} onClick={() => setUnitTypeFilter(value)}>{label}</button>)}
          </div>
          <div className="unit-results-heading"><div><h2>{query ? 'Resultados da busca' : 'Unidades próximas'}</h2><span>{units.length} {units.length === 1 ? 'unidade' : 'unidades'}</span></div><p>Toque em uma unidade para consultar fichas e agendar.</p></div>
          <div className="unit-search-list">
            {units.length ? units.map((unit, index) => <button className="unit-search-card" key={unit.id} onClick={() => selectUnit(unit.bookingName)}>
              <span className="unit-map-icon"><Icon name="map" size={22} /></span>
              <span className="unit-search-copy"><span className="status normal"><i /> {unit.status}</span><b>{unit.name}</b><small>{unit.region} · {unit.distance} · {unit.type === 'public' ? 'Pública' : 'Particular'}</small><small>{unit.services.slice(0, 3).join(' · ')}</small>{index === 0 && unit.type === 'public' && <em>Favorita</em>}</span>
              <Icon name="arrow" />
            </button>) : <div className="empty-unit-search"><span><Icon name="search" size={28} /></span><h2>Nenhuma unidade encontrada</h2><p>Altere o termo ou o filtro e tente novamente.</p><button onClick={() => { setQuery(''); setUnitTypeFilter('all') }}>Limpar pesquisa</button></div>}
          </div>
        </section>}

        {view === 'ubs' && <section className="page">
          <div className="page-heading unit-page-heading"><div className="unit-heading-copy"><span className="status normal"><i /> {selectedUnitData.status}</span><div className="unit-title-row"><h1>{titles[view]}</h1><button className="outline favorite-button" aria-pressed={favoriteUnits.includes(selectedUnit)} onClick={() => toggleFavorite(selectedUnit)}><Icon name="heart" /><span>{favoriteUnits.includes(selectedUnit) ? 'Favoritada' : 'Favoritar'}</span></button></div><p><Icon name="map" /> {selectedUnitData.address} · {selectedUnitData.hours}</p></div></div>
          <div className="unit-detail-meta"><span>{selectedUnitData.type === 'public' ? 'Unidade pública' : 'Clínica particular'}</span><span><Icon name="clock" /> {selectedUnitData.hours}</span><span>Telefone: {selectedUnitData.phone}</span></div>
          <div className="service-availability-heading"><div><span className="eyebrow">AGENDE NA UNIDADE</span><h2>Serviços e próximos horários</h2></div><span>{selectedUnitData.services.length} serviços disponíveis</span></div>
          <div className="availability-grid">
            {selectedUnitData.services.map((service, index) => {
              const control = getServiceControl(selectedUnitData.name, service)
              const nextSlot = getNextAvailableSlot(selectedUnitData.name, service, index)
              const professional = selectedUnitData.professionals.find(item => item.specialty === service)
              const activeBookings = appointments.filter(item => item.unit === selectedUnitData.name && item.specialty === service && item.status === 'confirmed' && item.appointmentDate >= today).length
              return <article className="ticket availability-card" key={service}>
                <div className="ticket-head"><span className={`pill ${nextSlot ? 'green' : 'red'}`}>{nextSlot ? 'Disponível' : control.enabled ? 'Sem vagas' : 'Suspenso'}</span></div>
                <h3>{service}</h3>
                <p><Icon name="clock" /> {nextSlot ?? (control.enabled ? 'Sem horários nos próximos dias' : 'Agendamentos temporariamente suspensos')}</p>
                <div className="service-provider"><Icon name="users" size={16} /><span>{professional?.name ?? 'Equipe da unidade'}</span></div>
                {activeBookings > 0 && <small className="service-demand">{activeBookings} {activeBookings === 1 ? 'agendamento confirmado' : 'agendamentos confirmados'}</small>}
                <button className="schedule-button" disabled={!nextSlot} onClick={() => setBookingSpecialty(service)}>{nextSlot ? 'Ver horários' : control.enabled ? 'Sem horários' : 'Serviço suspenso'}</button>
              </article>
            })}
          </div>
          <div className="two-columns">
            <article className="panel"><h2>Profissionais</h2>{selectedUnitData.professionals.map(professional => <div className="person" key={professional.name}><span className="initial">{professional.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}</span><span><b>{professional.name}</b><small>{professional.specialty}</small></span><span className="pill green">Disponível</span></div>)}</article>
            <article className="panel"><h2>Serviços disponíveis</h2><ul className="services">{selectedUnitData.services.map(service => { const enabled = getServiceControl(selectedUnitData.name, service).enabled; return <li className={enabled ? '' : 'suspended'} key={service}>{enabled ? '✓' : '—'} {service}{!enabled && ' · suspenso'}</li> })}</ul></article>
          </div>
        </section>}

        {view === 'alertas' && <section className="page narrow">
          <div className="page-heading"><div><span className="eyebrow">SUA REGIÃO</span><h1>Alertas regionais</h1><p>Informações gerais de saúde para a Região Norte do Recife.</p></div><span className="pill red">2 novos</span></div>
          <div className="date-label">HOJE, 12 DE ABRIL</div>
          <article className="alert danger"><div className="alert-symbol">!</div><div><div className="alert-meta"><b>Alerta epidemiológico</b><span>há 20 min</span></div><h3>Aumento de casos de dengue na região</h3><p>Use repelente, elimine água parada e procure atendimento em caso de febre alta, dor no corpo ou manchas vermelhas.</p><small>Secretaria Municipal de Saúde</small></div></article>
          <article className="alert warning"><div className="alert-symbol">!</div><div><div className="alert-meta"><b>Atenção ao calor</b><span>há 1 h</span></div><h3>Temperaturas elevadas nesta semana</h3><p>Beba água com frequência e evite exposição direta ao sol entre 10h e 16h.</p><small>Defesa Civil e Secretaria de Saúde</small></div></article>
          <article className="alert info"><div className="alert-symbol">i</div><div><div className="alert-meta"><b>Campanha regional</b><span>ontem</span></div><h3>Vacinação contra influenza</h3><p>Campanha disponível nas Unidades de Saúde públicas da região para pessoas com 60 anos ou mais.</p><small>Região Norte do Recife</small></div></article>
        </section>}

        {view === 'avisos' && <section className="page narrow">
          <div className="page-heading"><div><span className="eyebrow">POR UNIDADE</span><h1>{titles[view]}</h1><p>Confira faltas de profissionais e serviços indisponíveis antes de sair.</p></div>{unitNotices.length > 0 && <span className="new-notices-count">{unitNotices.length} {unitNotices.length === 1 ? 'novo' : 'novos'}</span>}</div>
          <div className="unit-notices">
            {unitNotices.map(notice => <article className="notice-unit synced-notice" key={notice.id}><div className="notice-unit-head"><div><span className="status normal"><i /> Publicado pela unidade</span><h2>{notice.unit}</h2><p>{new Date(notice.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '')}</p></div><button onClick={() => selectUnit(demoUnits[0].bookingName)}>Ver unidade</button></div><div className={`notice ${notice.type === 'ausencia' ? 'danger' : notice.type === 'servico' ? 'warning' : 'success'}`}><span>{notice.type === 'outro' ? 'i' : '!'}</span><div><b>{notice.title}</b><p>{notice.message}</p></div></div></article>)}
            <article className="notice-unit"><div className="notice-unit-head"><div><span className="status normal"><i /> Aberta agora</span><h2>{demoUnits[0].name}</h2><p>{demoUnits[0].region} · {demoUnits[0].distance}</p></div><button onClick={() => selectUnit(demoUnits[0].bookingName)}>Ver unidade</button></div><div className="notice danger"><span>!</span><div><b>Pediatria sem atendimento pela manhã</b><p>A profissional não atenderá no turno da manhã. Previsão de retorno às 13h.</p></div></div></article>
            <article className="notice-unit"><div className="notice-unit-head"><div><span className="status normal"><i /> Aberta agora</span><h2>{demoUnits[1].name}</h2><p>{demoUnits[1].region} · {demoUnits[1].distance}</p></div><button onClick={() => selectUnit(demoUnits[1].bookingName)}>Ver unidade</button></div><div className="notice warning"><span>!</span><div><b>Impressão de exames indisponível</b><p>Equipamento em manutenção. Resultados digitais continuam disponíveis.</p></div></div></article>
            <article className="notice-unit"><div className="notice-unit-head"><div><span className="status normal"><i /> Atendimento normal</span><h2>{demoUnits[2].name}</h2><p>{demoUnits[2].region} · {demoUnits[2].distance}</p></div><button onClick={() => selectUnit(demoUnits[2].bookingName)}>Ver unidade</button></div><div className="notice success"><span>✓</span><div><b>Nenhuma alteração hoje</b><p>Profissionais e serviços funcionando normalmente.</p></div></div></article>
          </div>
        </section>}

        {view === 'consultas' && <section className="page narrow">
          <div className="page-heading"><div><span className="eyebrow">SEUS ATENDIMENTOS</span><h1>{titles[view]}</h1><p>Acompanhe seus agendamentos e salve o comprovante para apresentar na unidade.</p></div></div>
          {appointments.length === 0 ? <div className="empty-appointments"><span><Icon name="clock" size={30} /></span><h2>Nenhuma consulta agendada</h2><p>Quando você fizer um agendamento, ele aparecerá aqui.</p><button className="primary" onClick={() => setScheduleChoice(true)}>Agendar uma consulta</button></div> :
            <><div className="consultation-tabs" role="tablist" aria-label="Filtrar consultas"><button role="tab" aria-selected={consultationTab === 'upcoming'} className={consultationTab === 'upcoming' ? 'active' : ''} onClick={() => setConsultationTab('upcoming')}>Próximas <span>{upcomingAppointments.length}</span></button><button role="tab" aria-selected={consultationTab === 'history'} className={consultationTab === 'history' ? 'active' : ''} onClick={() => setConsultationTab('history')}>Histórico <span>{appointmentHistory.length}</span></button></div>
            {visibleAppointments.length === 0 ? <div className="consultation-empty"><Icon name="clock" size={25} /><div><h2>{consultationTab === 'upcoming' ? 'Nenhuma consulta futura' : 'Seu histórico está vazio'}</h2><p>{consultationTab === 'upcoming' ? 'Agende um novo atendimento quando precisar.' : 'Consultas concluídas ou canceladas aparecerão aqui.'}</p></div>{consultationTab === 'upcoming' && <button className="primary" onClick={() => setScheduleChoice(true)}>Agendar consulta</button>}</div> :
            <div className="appointment-list">{visibleAppointments.map(appointment => {
              const isPast = appointment.status === 'completed' || (appointment.status === 'confirmed' && appointment.appointmentDate < today)
              const statusLabel = appointment.status === 'cancelled' ? 'Cancelada' : isPast ? 'Concluída' : 'Confirmada'
              return <article className={`appointment-card ${appointment.status === 'cancelled' ? 'cancelled' : ''}`} key={appointment.id}>
                <div className="appointment-date"><strong>{new Date(`${appointment.appointmentDate}T12:00:00`).getDate()}</strong><span>{new Date(`${appointment.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></div>
                <div className="appointment-content"><span className={`pill ${appointment.status === 'cancelled' ? 'red' : isPast ? 'yellow' : 'green'}`}>{statusLabel}</span><h2>{appointment.specialty}</h2><p>{appointment.unit}</p><div><span><Icon name="clock" size={17} /> {appointment.time}</span><span><Icon name="user" size={17} /> {appointment.professional}</span></div></div>
                <div className="appointment-actions"><button className="details-button" onClick={() => setAppointmentDetail(appointment)}>Ver detalhes</button><button className="pdf-button" onClick={() => exportAppointment(appointment)}><span>↓</span> Exportar ficha</button></div>
              </article>
            })}</div>}</>}
        </section>}

        {view === 'ajuda' && <section className="page narrow help-page">
          <div className="help-heading"><span className="eyebrow">ZELO - TECNOLOGIA QUE CUIDA</span><h1>{titles[view]}</h1><p>Encontre respostas ou fale com uma pessoa.</p></div>
          <article className="help-human"><span className="help-question">?</span><h2>Preciso de ajuda para agendar</h2><p>Uma pessoa pode fazer o agendamento com você, por telefone ou presencialmente.</p><button onClick={() => { window.location.href = 'tel:136' }}>Falar com uma pessoa</button></article>
          <article className="faq-card"><h2>Perguntas frequentes</h2>
            <details><summary>Como marcar uma consulta?<span>›</span></summary><p>Na tela inicial, toque em “Agendar consulta”, confirme sua unidade, escolha a especialidade, a data e o horário.</p></details>
            <details><summary>Onde encontro o Cartão SUS?<span>›</span></summary><p>O Cartão SUS está disponível no aplicativo Meu SUS Digital. Você também pode solicitar ajuda na recepção da Unidade de Saúde.</p></details>
            <details><summary>Como cancelar ou remarcar?<span>›</span></summary><p>Para cancelar, acesse “Minhas consultas”, abra os detalhes e confirme o cancelamento. Para remarcar, entre em contato com a unidade.</p></details>
            <details><summary>Quem tem atendimento prioritário?<span>›</span></summary><p>Pessoas idosas, PCD e pessoas com TEA têm direito ao atendimento prioritário conforme a legislação vigente.</p></details>
          </article>
        </section>}

        {view === 'auth' && <section className="auth-page">
          <div className="auth-shell">
            <button className="auth-back" onClick={() => { pendingBooking ? (setView('ubs'), setBookingSpecialty(pendingBooking.specialty)) : navigate(authCancelReturn) }}>← Voltar</button>
            <div className="auth-brand"><span className="welcome-logo brand-mark-art"><BrandMark /></span><div><b>Zelo</b><small>Tecnologia que Cuida</small></div></div>
            {authMode === 'options' && <>
              <span className="eyebrow">IDENTIFICAÇÃO</span><h1>Entre para continuar</h1><p>{pendingBooking ? 'Seu agendamento está salvo. Após entrar, você poderá revisar e confirmar.' : 'Escolha uma forma de acesso para visualizar suas informações.'}</p>
              <div className="demo-disclaimer"><b>Demonstração</b><span>Os acessos gov.br e Google são simulados neste protótipo e não utilizam contas reais.</span></div>
              <div className="auth-options">
                <button className="gov-auth" onClick={() => finishDemoAuthentication({ name: 'Maria da Silva', email: 'maria@exemplo.com', provider: 'gov.br' })}><span>g<span>o</span>v.br</span><b>Continuar com gov.br</b></button>
                <button className="google-auth" onClick={() => finishDemoAuthentication({ name: 'Maria da Silva', email: 'maria@gmail.com', provider: 'Google' })}><span>G</span><b>Continuar com Google</b></button>
                <button className="email-auth" onClick={() => setAuthMode('email')}><span>@</span><b>Entrar com e-mail</b></button>
              </div>
              <button className="create-account-link" onClick={() => setAuthMode('register')}>Ainda não tenho conta · <b>Criar conta</b></button>
            </>}
            {authMode === 'email' && <form className="auth-form" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); finishDemoAuthentication({ name: 'Maria da Silva', email: String(data.get('email')), provider: 'E-mail' }) }}>
              <span className="eyebrow">ACESSO POR E-MAIL</span><h1>Bem-vindo de volta</h1><p>Use dados demonstrativos para acessar o protótipo.</p>
              <label>E-mail<input required name="email" type="email" placeholder="voce@exemplo.com" /></label>
              <label>Senha<input required minLength={6} name="password" type="password" placeholder="Mínimo de 6 caracteres" /></label>
              <button className="forgot-link" type="button" onClick={() => setAuthMode('forgot')}>Esqueci minha senha</button>
              <button className="primary full" type="submit">Entrar</button>
              <button className="secondary full" type="button" onClick={() => setAuthMode('options')}>Outras formas de acesso</button>
            </form>}
            {authMode === 'register' && <form className="auth-form" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); finishDemoAuthentication({ name: String(data.get('name')), email: String(data.get('contact')), provider: 'E-mail' }) }}>
              <span className="eyebrow">CONTA DEMONSTRATIVA</span><h1>Criar conta</h1><p>Solicitamos somente os dados necessários para a demonstração.</p>
              <label>Nome completo<input required minLength={3} name="name" placeholder="Digite seu nome" /></label>
              <label>Data de nascimento<input required name="birthDate" type="date" /></label>
              <label>E-mail ou telefone<input required minLength={8} name="contact" placeholder="voce@exemplo.com ou telefone" /></label>
              <label>Senha<input required minLength={6} name="password" type="password" placeholder="Mínimo de 6 caracteres" /></label>
              <button className="primary full" type="submit">Criar conta e continuar</button>
              <button className="secondary full" type="button" onClick={() => setAuthMode('options')}>Já tenho acesso</button>
            </form>}
            {authMode === 'forgot' && <form className="auth-form" onSubmit={event => { event.preventDefault(); setAuthMessage('Orientações demonstrativas enviadas. Nenhum e-mail real foi disparado.') }}>
              <span className="eyebrow">RECUPERAR ACESSO</span><h1>Esqueceu sua senha?</h1><p>Informe seu e-mail. Esta ação é apenas demonstrativa.</p>
              <label>E-mail<input required name="email" type="email" placeholder="voce@exemplo.com" /></label>
              {authMessage && <div className="auth-success">✓ {authMessage}</div>}
              <button className="primary full" type="submit">Enviar orientações</button>
              <button className="secondary full" type="button" onClick={() => setAuthMode('email')}>Voltar ao login</button>
            </form>}
          </div>
        </section>}

        {view === 'perfil' && <section className="page narrow">
          <div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS</span><h1>{titles[view]}</h1><p>Escolha como e quando quer ser avisado.</p></div></div>
          <article className="profile-card"><div className="profile-avatar">{authUser ? authUser.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() : 'VS'}</div><div><h3>{authUser?.name ?? 'Visitante'}</h3><p>{authUser ? `Acesso demonstrativo por ${authUser.provider}` : 'Entre para acessar consultas e informações privadas'} · Perfil {userType ?? 'Padrão'}</p>{isPriority && <small className="priority-status">✓ Atendimento prioritário</small>}</div>{authUser && <span className="verified">✓ Identificada</span>}</article>
          <article className="panel settings"><h2>Notificações</h2><p>Você pode alterar estas opções a qualquer momento.</p>
            <Toggle on={push} setOn={setPush} label="Avisar sobre mudanças na disponibilidade da unidade" />
            <Toggle on={doctors} setOn={setDoctors} label="Avisar sobre ausência de profissionais" />
            <Toggle on={vaccines} setOn={setVaccines} label="Avisar sobre campanhas de vacinação" />
          </article>
          <article className="panel active-experience-card"><div><span className="eyebrow">EXPERIÊNCIA ATIVA</span><h2>{userType === 'Idoso' ? 'Guiada para pessoa idosa' : userType === 'TEA' ? 'Previsível para pessoa neurodivergente' : userType === 'PCD' ? 'Acessível e combinada' : 'Padrão Zelo'}</h2><p>{userType === 'PCD' ? `${pcdNeeds.length} adaptações selecionadas` : 'Definida automaticamente pelo seu perfil.'}</p></div><button onClick={() => { setRole(null); setPcdSelectionOpen(userType === 'PCD') }}>Alterar perfil e adaptações</button></article>
          {authUser ? <button className="sign-out-button" onClick={signOutDemo}>Sair da conta demonstrativa</button> : <button className="gov-button" onClick={() => openAuthentication('perfil')}>Entrar ou criar conta</button>}
        </section>}

        {view === 'acessibilidade' && <section className="page narrow accessibility">
          <div className="a11y-icon">Aa</div><span className="eyebrow">LEITURA CONFORTÁVEL</span><h1>Como você prefere ler?</h1><p>Você pode mudar esta escolha quando quiser. Não é necessário entrar na sua conta.</p>
          <div className="font-choices">
            <button className={fontScale === .9 ? 'selected' : ''} aria-pressed={fontScale === .9} onClick={() => updateFontScale(.9)}><b>A</b><span>Pequena</span></button>
            <button className={fontScale === 1 ? 'selected' : ''} aria-pressed={fontScale === 1} onClick={() => updateFontScale(1)}><b>A</b><span>Média</span></button>
            <button className={fontScale === 1.12 ? 'selected' : ''} aria-pressed={fontScale === 1.12} onClick={() => updateFontScale(1.12)}><b>A</b><span>Grande</span></button>
          </div>
          <div className="accessibility-options">
            <button className={`contrast-choice ${contrast ? 'selected' : ''}`} aria-pressed={contrast} onClick={() => updateContrast(!contrast)}><Icon name="contrast" size={28} /><span><b>Alto contraste</b><small>Aumenta a diferença entre texto e fundo</small></span><span className={`toggle ${contrast ? 'on' : ''}`}><span /></span></button>
            <button className={`contrast-choice ${reduceMotion ? 'selected' : ''}`} aria-pressed={reduceMotion} onClick={() => updateReduceMotion(!reduceMotion)}><Icon name="clock" size={28} /><span><b>Reduzir movimentos</b><small>Remove animações e rolagens suaves</small></span><span className={`toggle ${reduceMotion ? 'on' : ''}`}><span /></span></button>
            <button className={`read-aloud-button ${isSpeaking ? 'speaking' : ''}`} aria-pressed={isSpeaking} onClick={readCurrentScreen}><Icon name="volume" size={28} /><span><b>{isSpeaking ? 'Parar leitura' : 'Ler esta tela em voz alta'}</b><small>Usa a voz disponível no seu navegador</small></span><span>{isSpeaking ? '■' : '▶'}</span></button>
          </div>
          {speechMessage && <div className="speech-status" role="status">{speechMessage}</div>}
          <button className="primary full" onClick={() => navigate('inicio')}>Salvar e continuar</button>
        </section>}
      </main>

      {bookingSpecialty && <BookingModal unitLabel={selectedUnitData.name} specialty={bookingSpecialty} professionals={selectedUnitData.professionals.filter(item => item.specialty === bookingSpecialty).map(item => item.name)} blockedTimes={getServiceControl(selectedUnitData.name, bookingSpecialty).blockedTimes} predictable={userType === 'TEA'} initialDraft={pendingBooking} appointments={appointments} isAuthenticated={Boolean(authUser)} onRequireAuth={appointment => openAuthentication('ubs', appointment)} onBooked={saveAppointment} onViewAppointments={() => { setBookingSpecialty(null); setPendingBooking(null); navigate('consultas') }} onGoHome={() => { setBookingSpecialty(null); setPendingBooking(null); navigate('inicio') }} onClose={() => { setBookingSpecialty(null); setPendingBooking(null) }} />}

      {appointmentDetail && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAppointmentDetail(null)}>
        <div className="alert-modal appointment-detail-modal" onMouseDown={event => event.stopPropagation()}>
          <div className="modal-heading"><div className="calendar-icon"><Icon name="clock" size={25} /></div><div><span className="eyebrow">DETALHES DA CONSULTA</span><h2>{appointmentDetail.specialty}</h2></div><button onClick={() => setAppointmentDetail(null)} aria-label="Fechar">×</button></div>
          <div className="detail-status"><span className={`pill ${appointmentDetail.status === 'cancelled' ? 'red' : appointmentDetail.status === 'completed' || appointmentDetail.appointmentDate < today ? 'yellow' : 'green'}`}>{appointmentDetail.status === 'cancelled' ? 'Cancelada' : appointmentDetail.status === 'completed' || appointmentDetail.appointmentDate < today ? 'Concluída' : 'Confirmada'}</span><b>{appointmentDetail.code}</b></div>
          <div className="appointment-detail-grid"><span><b>Data e horário</b>{new Date(`${appointmentDetail.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR')} às {appointmentDetail.time}</span><span><b>Profissional</b>{appointmentDetail.professional}</span><span><b>Unidade</b>{appointmentDetail.unit}</span><span><b>Paciente</b>{appointmentDetail.patientName}</span></div>
          <div className="appointment-guidance"><b>Antes de sair</b><p>Chegue com 15 minutos de antecedência e leve um documento com foto e o Cartão SUS.</p></div>
          <div className="detail-actions"><button className="secondary" onClick={() => exportAppointment(appointmentDetail)}>Exportar ficha</button>{appointmentDetail.status === 'confirmed' && appointmentDetail.appointmentDate >= today && <button className="cancel-button" onClick={() => { setCancelTarget(appointmentDetail); setAppointmentDetail(null) }}>Cancelar consulta</button>}</div>
        </div>
      </div>}

      {cancelTarget && <div className="modal-backdrop" role="presentation" onMouseDown={() => setCancelTarget(null)}>
        <div className="choice-modal cancel-modal" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title" onMouseDown={event => event.stopPropagation()}>
          <div className="cancel-icon">!</div><span className="eyebrow">CONFIRME O CANCELAMENTO</span><h2 id="cancel-title">Cancelar esta consulta?</h2><p>{cancelTarget.specialty} em {new Date(`${cancelTarget.appointmentDate}T12:00:00`).toLocaleDateString('pt-BR')} às {cancelTarget.time}.</p><div className="cancel-warning">O horário será liberado para outra pessoa. Esta ação não pode ser desfeita neste protótipo.</div><div className="cancel-actions"><button className="secondary" onClick={() => setCancelTarget(null)}>Manter consulta</button><button className="cancel-button" onClick={() => cancelAppointment(cancelTarget.id)}>Sim, cancelar</button></div>
        </div>
      </div>}

      {scheduleChoice && <div className="modal-backdrop" role="presentation" onMouseDown={() => setScheduleChoice(false)}>
        <div className="choice-modal" onMouseDown={event => event.stopPropagation()}>
          <div className="choice-icon"><Icon name="heart" size={27} /></div>
          <span className="eyebrow">ÚLTIMA UNIDADE ACESSADA</span>
          <h2>Quer agendar nesta unidade?</h2>
          <div className="last-unit"><b>{selectedUnitData.name}</b><span>{selectedUnit === demoUnits[0].bookingName ? 'Favorita' : 'Última acessada'} · atendimento disponível hoje</span></div>
          <button className="primary full" onClick={() => { setScheduleChoice(false); navigate('ubs') }}>Sim, usar esta unidade</button>
          <button className="secondary full" onClick={() => { setScheduleChoice(false); setQuery(''); navigate('buscar') }}>Escolher outra unidade</button>
          <button className="choice-cancel" onClick={() => setScheduleChoice(false)}>Cancelar</button>
        </div>
      </div>}

      {view !== 'auth' && <nav className="bottom-nav" aria-label="Navegação principal">
        {userType === 'Idoso' ? <div className="guided-bottom-nav">
          <button className={view === 'inicio' ? 'active' : ''} onClick={() => navigate('inicio')}><Icon name="home" /><span>Início</span></button>
          <button className={view === 'consultas' ? 'active' : ''} onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}><Icon name="clock" /><span>Minhas consultas</span></button>
          <button className={view === 'ajuda' ? 'active' : ''} onClick={() => navigate('ajuda')}><span className="nav-question">?</span><span>Ajuda</span></button>
        </div> : userType === 'TEA' ? <div className="predictable-bottom-nav">
          <button className={view === 'inicio' ? 'active' : ''} onClick={() => navigate('inicio')}><span>1</span><b>Início</b></button>
          <button className={view === 'buscar' || view === 'ubs' ? 'active' : ''} onClick={() => navigate('buscar')}><span>2</span><b>Unidades</b></button>
          <button className={view === 'consultas' ? 'active' : ''} onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}><span>3</span><b>Consultas</b></button>
          <button className={view === 'ajuda' ? 'active' : ''} onClick={() => navigate('ajuda')}><span>4</span><b>Ajuda</b></button>
        </div> : userType === 'PCD' ? <div className="accessible-bottom-nav">
          <button className={view === 'inicio' ? 'active' : ''} onClick={() => navigate('inicio')}>Início</button>
          <button className={view === 'buscar' || view === 'ubs' ? 'active' : ''} onClick={() => navigate('buscar')}>Unidades</button>
          <button className={view === 'consultas' ? 'active' : ''} onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}>Consultas</button>
          <button className={view === 'ajuda' ? 'active' : ''} onClick={() => navigate('ajuda')}>Ajuda</button>
        </div> : <>
          <button className={view === 'inicio' || view === 'buscar' || view === 'ubs' ? 'active' : ''} onClick={() => navigate('inicio')}><Icon name="home" /><span>Início</span></button>
          <button className={view === 'alertas' || view === 'avisos' ? 'active' : ''} onClick={() => navigate('alertas')}><span className="notification-dot" /><Icon name="bell" /><span>Alertas</span></button>
          <button className={view === 'consultas' ? 'active' : ''} onClick={() => authUser ? navigate('consultas') : openAuthentication('consultas')}><Icon name="clock" /><span>Consultas</span></button>
          <button className={view === 'ajuda' ? 'active' : ''} onClick={() => navigate('ajuda')}><span className="nav-question">?</span><span>Ajuda</span></button>
          <button className={view === 'perfil' ? 'active' : ''} onClick={() => navigate('perfil')}><Icon name="user" /><span>Perfil</span></button>
        </>}
      </nav>}
    </div>
  )
}
