import type { Metadata } from 'next'
import AdminDashboard from '../components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Gestão | Zelo',
  description: 'Dashboard operacional das unidades de saúde no Zelo.',
  robots: { index: false, follow: false },
}

export default function ManagementPage() {
  return <AdminDashboard />
}
