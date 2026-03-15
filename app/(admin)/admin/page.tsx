import { AdminDashboardClient } from './AdminDashboardClient'
import { getAdminUsers } from '@/app/actions/admin'

export default async function AdminPage() {
  const { users } = await getAdminUsers()
  
  return <AdminDashboardClient initialUsers={users} />
}
