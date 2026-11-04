'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type AppointmentState = {
  success: boolean
  message: string
}

const allowedSpecialties = ['Clínico geral', 'Pediatria', 'Odontologia'] as const
const allowedTimes = ['07:30', '08:30', '09:30', '10:30', '13:30', '14:30', '15:30'] as const
const allowedUnits = [
  'UBS Policlínica Lessa de Andrade',
  'UBS Sítio Wanderley',
  'USF Alto do Céu',
  'UBS Professor Monteiro de Moraes',
] as const

function isAllowed<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.some(option => option === value)
}

export async function createAppointment(
  _previousState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const patientName = String(formData.get('patientName') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const unit = String(formData.get('unit') ?? '').trim()
  const specialty = String(formData.get('specialty') ?? '').trim()
  const appointmentDate = String(formData.get('appointmentDate') ?? '').trim()
  const time = String(formData.get('time') ?? '').trim()

  if (
    patientName.length < 3 ||
    phone.length < 8 ||
    !isAllowed(unit, allowedUnits) ||
    !isAllowed(specialty, allowedSpecialties) ||
    !isAllowed(time, allowedTimes) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
  ) {
    return { success: false, message: 'Confira os dados informados e tente novamente.' }
  }

  const selectedDate = new Date(`${appointmentDate}T12:00:00.000Z`)
  if (Number.isNaN(selectedDate.getTime()) || selectedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    return { success: false, message: 'Escolha uma data válida a partir de hoje.' }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'appointments',
      data: {
        patientName,
        phone,
        unit,
        specialty,
        appointmentDate: selectedDate.toISOString(),
        time,
      },
      overrideAccess: false,
    })
    return { success: true, message: 'Consulta agendada com sucesso.' }
  } catch {
    return { success: false, message: 'Não foi possível agendar agora. Tente novamente.' }
  }
}
