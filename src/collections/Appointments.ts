import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: {
    singular: 'Agendamento',
    plural: 'Agendamentos',
  },
  admin: {
    group: 'Atendimento',
    useAsTitle: 'patientName',
    defaultColumns: ['patientName', 'unit', 'specialty', 'appointmentDate', 'time', 'status'],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'patientName', label: 'Nome do paciente', type: 'text', required: true },
    { name: 'phone', label: 'Telefone', type: 'text', required: true },
    {
      name: 'unit',
      label: 'Unidade de saúde',
      type: 'select',
      required: true,
      options: [
        'UBS Policlínica Lessa de Andrade',
        'UBS Sítio Wanderley',
        'USF Alto do Céu',
        'UBS Professor Monteiro de Moraes',
      ],
    },
    {
      name: 'specialty',
      label: 'Especialidade',
      type: 'select',
      required: true,
      options: ['Clínico geral', 'Pediatria', 'Odontologia'],
    },
    { name: 'appointmentDate', label: 'Data da consulta', type: 'date', required: true },
    {
      name: 'time',
      label: 'Horário',
      type: 'select',
      required: true,
      options: ['07:30', '08:30', '09:30', '10:30', '13:30', '14:30', '15:30'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Agendado', value: 'scheduled' },
        { label: 'Confirmado', value: 'confirmed' },
        { label: 'Cancelado', value: 'cancelled' },
        { label: 'Concluído', value: 'completed' },
      ],
      access: {
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
      },
    },
  ],
}
