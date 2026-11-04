export type EstablishmentType = 'public' | 'private'

export type DemoUnit = {
  id: string
  bookingName: string
  name: string
  type: EstablishmentType
  organization: string
  city: string
  region: string
  address: string
  distance: string
  hours: string
  phone: string
  status: string
  services: string[]
  professionals: Array<{ name: string; specialty: string }>
  nextSlots: string[]
}

export const demoUnits: DemoUnit[] = [
  {
    id: 'central',
    bookingName: 'UBS Policlínica Lessa de Andrade',
    name: 'Unidade de Saúde Central',
    type: 'public',
    organization: 'Rede Municipal de Saúde',
    city: 'Recife',
    region: 'Santo Amaro',
    address: 'Rua da Aurora, 1.239',
    distance: '1,2 km',
    hours: 'Aberta até 17h',
    phone: '(81) 3355-0101',
    status: 'Atendimento normal',
    services: ['Clínico geral', 'Pediatria', 'Vacinação', 'Curativos'],
    professionals: [
      { name: 'Dra. Ana Martins', specialty: 'Clínico geral' },
      { name: 'Dr. Rafael Costa', specialty: 'Pediatria' },
    ],
    nextSlots: ['Hoje, 14:30', 'Amanhã, 08:30', 'Amanhã, 10:30'],
  },
  {
    id: 'jardim',
    bookingName: 'UBS Sítio Wanderley',
    name: 'Unidade de Saúde Jardim',
    type: 'public',
    organization: 'Rede Municipal de Saúde',
    city: 'Recife',
    region: 'Casa Forte',
    address: 'Rua das Acácias, 280',
    distance: '2,4 km',
    hours: 'Aberta até 16h',
    phone: '(81) 3355-0142',
    status: 'Atendimento parcial',
    services: ['Clínico geral', 'Odontologia', 'Farmácia', 'Exames'],
    professionals: [
      { name: 'Dra. Carla Freire', specialty: 'Odontologia' },
      { name: 'Dr. Bruno Lima', specialty: 'Clínico geral' },
    ],
    nextSlots: ['Amanhã, 09:00', 'Amanhã, 13:30', 'Sexta, 10:00'],
  },
  {
    id: 'vida-plena',
    bookingName: 'USF Alto do Céu',
    name: 'Clínica Vida Plena',
    type: 'private',
    organization: 'Grupo Vida Plena',
    city: 'Recife',
    region: 'Espinheiro',
    address: 'Avenida Norte, 650',
    distance: '3,1 km',
    hours: 'Aberta até 20h',
    phone: '(81) 3030-2020',
    status: 'Horários disponíveis',
    services: ['Clínico geral', 'Pediatria', 'Cardiologia', 'Dermatologia'],
    professionals: [
      { name: 'Dra. Marina Alves', specialty: 'Cardiologia' },
      { name: 'Dr. Lucas Rocha', specialty: 'Dermatologia' },
    ],
    nextSlots: ['Hoje, 16:00', 'Hoje, 17:30', 'Amanhã, 09:30'],
  },
]
