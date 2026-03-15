'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Mail, Calendar, CheckCircle, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AdminUser } from '@/app/actions/admin'

interface Props {
  initialUsers: AdminUser[]
}

type FilterStatus = 'all' | 'admin' | 'active' | 'waitlist'

export function AdminDashboardClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkActivating, setBulkActivating] = useState(false)

  // Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastStep, setBroadcastStep] = useState<'compose' | 'preview'>('compose')
  const [broadcastAudience, setBroadcastAudience] = useState<'waitlist' | 'active'>('waitlist')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)

  // Edit User State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editAdminToggle, setEditAdminToggle] = useState(false)
  const [editSubMonth, setEditSubMonth] = useState('')
  const [savingUser, setSavingUser] = useState(false)

  // Derive stats (needs to be above the handlers that use it)
  const stats = useMemo(() => {
    let total = users.length
    let active = 0
    let admins = 0
    let waitlist = 0

    users.forEach(u => {
      if (u.is_admin) admins++
      else if (u.active_subscription_month) active++
      else waitlist++
    })

    return { total, active, admins, waitlist }
  }, [users])

  async function handleActivate(userId: string, email: string) {
    if (actingOn) return
    setActingOn(userId)
    
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      })

      if (!res.ok) throw new Error('Failed to activate')
      
      const json = await res.json()
      
      // Update local state optimistically
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, active_subscription_month: json.active_subscription_month } 
          : u
      ))
    } catch (err) {
      console.error(err)
      alert("Failed to activate user.")
    } finally {
      setActingOn(null)
    }
  }

  async function confirmBulkActivate() {
    setBulkActivating(true)
    
    // Find all users who are strictly waitlisters
    const waitlisters = users.filter(u => !u.is_admin && !u.active_subscription_month)
    const usersToActivate = waitlisters.map(u => ({ id: u.id, email: u.email }))

    try {
      const res = await fetch('/api/admin/bulk-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usersToActivate })
      })

      if (!res.ok) throw new Error('Failed to bulk activate')
      
      const json = await res.json()
      
      setUsers(prev => prev.map(u => 
        (!u.is_admin && !u.active_subscription_month)
          ? { ...u, active_subscription_month: json.active_subscription_month } 
          : u
      ))
      
      setShowBulkModal(false)
    } catch (err) {
      console.error(err)
      alert("Failed to bulk activate users.")
    } finally {
      setBulkActivating(false)
    }
  }

  async function handleSendBroadcast() {
    setBroadcasting(true)

    // Determine recipients
    const recipients = users
      .filter(u => {
        if (u.is_admin) return false
        if (broadcastAudience === 'waitlist') return !u.active_subscription_month
        if (broadcastAudience === 'active') return !!u.active_subscription_month
        return false
      })
      .map(u => u.email)

    if (recipients.length === 0) {
      alert("No recipients found for this audience.")
      setBroadcasting(false)
      return
    }

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: broadcastSubject, 
          body: broadcastBody, 
          recipients 
        })
      })

      if (!res.ok) throw new Error('Failed to send broadcast')
      
      setShowBroadcastModal(false)
      setBroadcastStep('compose')
      setBroadcastSubject('')
      setBroadcastBody('')
      alert(`Broadcast sent to ${recipients.length} users!`)
    } catch (err) {
      console.error(err)
      alert("Failed to send broadcast.")
    } finally {
      setBroadcasting(false)
    }
  }

  function openEditModal(user: AdminUser) {
    setEditingUser(user)
    setEditAdminToggle(user.is_admin)
    setEditSubMonth(user.active_subscription_month || '')
  }

  async function handleSaveUser() {
    if (!editingUser) return
    setSavingUser(true)

    try {
      // If role changed
      if (editingUser.is_admin !== editAdminToggle) {
        const roleRes = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId: editingUser.id, isAdmin: editAdminToggle })
        })
        if (!roleRes.ok) throw new Error('Failed to update role')
      }

      // If subscription changed
      const normalizedSubMonth = editSubMonth.trim() === '' ? null : editSubMonth
      if (editingUser.active_subscription_month !== normalizedSubMonth) {
        const subRes = await fetch('/api/admin/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId: editingUser.id, activeSubscriptionMonth: normalizedSubMonth })
        })
        if (!subRes.ok) throw new Error('Failed to update subscription')
      }

      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, is_admin: editAdminToggle, active_subscription_month: normalizedSubMonth }
          : u
      ))

      setEditingUser(null)
    } catch (err) {
      console.error(err)
      alert("Failed to update user.")
    } finally {
      setSavingUser(false)
    }
  }

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Search Query
      if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // 2. Status Filter
      if (statusFilter !== 'all') {
        const isUserAdmin = user.is_admin
        const isUserActive = !isUserAdmin && !!user.active_subscription_month
        const isUserWaitlist = !isUserAdmin && !user.active_subscription_month

        if (statusFilter === 'admin' && !isUserAdmin) return false
        if (statusFilter === 'active' && !isUserActive) return false
        if (statusFilter === 'waitlist' && !isUserWaitlist) return false
      }

      return true
    })
  }, [users, searchQuery, statusFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-lexend font-bold text-terracotta-900 text-2xl lg:text-3xl tracking-tight mb-2">
            Waitlist Dashboard
          </h1>
          <p className="font-inter text-sage-600 text-sm">
            Manage product access and audience broadcasts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setBroadcastStep('compose')
              setShowBroadcastModal(true)
            }}
          >
            Broadcast
          </Button>
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => setShowBulkModal(true)}
            disabled={stats.waitlist === 0}
            className="gap-2"
          >
            Launch Day <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{stats.waitlist}</span>
          </Button>
        </div>
      </div>

      {/* 8.7 Stats Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-soft">
          <p className="text-sm font-inter text-sage-500 mb-1">Total Signups</p>
          <p className="text-3xl font-lexend font-bold text-terracotta-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-soft">
          <p className="text-sm font-inter text-sage-500 mb-1">Waitlist Focus</p>
          <p className="text-3xl font-lexend font-bold text-amber-600">{stats.waitlist}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-soft">
          <p className="text-sm font-inter text-sage-500 mb-1">Active Subscribers</p>
          <p className="text-3xl font-lexend font-bold text-sage-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-soft">
          <p className="text-sm font-inter text-sage-500 mb-1">Admin Accounts</p>
          <p className="text-3xl font-lexend font-bold text-terracotta-400">{stats.admins}</p>
        </div>
      </div>

      {/* Tables & Filters */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-cream-300 bg-cream-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-cream-400 font-inter text-sm text-terracotta-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
            />
          </div>
          
          <div className="flex bg-cream-200 p-1 rounded-2xl w-full sm:w-auto">
            {['all', 'waitlist', 'active', 'admin'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab as FilterStatus)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-semibold font-inter transition-all ${
                  statusFilter === tab 
                    ? 'bg-white text-terracotta-900 shadow-sm' 
                    : 'text-sage-500 hover:text-sage-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Data list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="px-6 py-4 font-lexend font-medium text-xs text-sage-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-lexend font-medium text-xs text-sage-500 uppercase tracking-wider">Signup Date</th>
                <th className="px-6 py-4 font-lexend font-medium text-xs text-sage-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-lexend font-medium text-xs text-sage-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sage-500 font-inter text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isWaitlog = !user.is_admin && !user.active_subscription_month;
                  const isActive = !user.is_admin && !!user.active_subscription_month;
                  
                  return (
                    <tr key={user.id} className="hover:bg-cream-50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-3.5 h-3.5 text-sage-500" />
                          </div>
                          <span className="font-inter text-sm font-medium text-terracotta-900 truncate max-w-[200px] sm:max-w-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-sage-600 font-inter">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium font-inter ${
                          user.is_admin 
                            ? 'bg-terracotta-100 text-terracotta-800' 
                            : isActive 
                              ? 'bg-sage-100 text-sage-700' 
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {user.is_admin && <ShieldAlert className="w-3 h-3" />}
                          {isActive && <CheckCircle className="w-3 h-3" />}
                          {isWaitlog && <Clock className="w-3 h-3" />}
                          
                          {user.is_admin ? 'Admin' : isActive ? 'Active' : 'Waitlist'}
                        </span>
                        {isActive && (
                          <div className="text-[10px] text-sage-400 mt-1 pl-1">
                            {user.active_subscription_month}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isWaitlog && (
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="py-1.5 px-3 h-auto text-xs"
                            onClick={() => handleActivate(user.id, user.email)}
                            disabled={actingOn === user.id}
                          >
                            {actingOn === user.id ? 'Activating...' : 'Activate'}
                          </Button>
                        )}
                        {!isWaitlog && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="py-1.5 px-3 h-auto text-xs opacity-0 group-hover:opacity-100 transition"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Activate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-soft-xl"
          >
            <div className="w-12 h-12 bg-terracotta-100 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-terracotta-700" strokeWidth={1.5} />
            </div>
            
            <h3 className="font-lexend font-bold text-lg text-terracotta-900 mb-2">
              Activate All Waitlist Users?
            </h3>
            
            <p className="font-inter text-sage-600 text-sm mb-6 leading-relaxed">
              This will grant dashboard access to all <strong>{stats.waitlist} users</strong> currently on the waitlist and send them a "Your dashboard is ready!" welcome email.
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowBulkModal(false)}
                disabled={bulkActivating}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBulkActivate}
                disabled={bulkActivating}
                variant="primary"
                className="flex-1 border-0"
              >
                {bulkActivating ? 'Activating...' : 'Confirm'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-lg w-full shadow-soft-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-lexend font-bold text-xl text-terracotta-900">
                {broadcastStep === 'compose' ? 'Compose Broadcast' : 'Preview Broadcast'}
              </h3>
              <div className="w-10 h-10 bg-cream-200 rounded-2xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-sage-600" strokeWidth={1.5} />
              </div>
            </div>

            {broadcastStep === 'compose' ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-sage-700 font-inter mb-1.5">Audience</label>
                  <select 
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value as 'waitlist' | 'active')}
                    className="w-full px-4 py-2.5 rounded-2xl border border-cream-400 font-inter text-sm text-terracotta-900 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition appearance-none bg-white"
                  >
                    <option value="waitlist">Waitlist Users ({stats.waitlist})</option>
                    <option value="active">Active Subscribers ({stats.active})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 font-inter mb-1.5">Subject Line</label>
                  <input 
                    type="text" 
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="E.g. Exciting news from Lua Learn!"
                    className="w-full px-4 py-2.5 rounded-2xl border border-cream-400 font-inter text-sm text-terracotta-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 font-inter mb-1.5">Body</label>
                  <textarea 
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    rows={6}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 rounded-2xl border border-cream-400 font-inter text-sm text-terracotta-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowBroadcastModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setBroadcastStep('preview')}
                    disabled={!broadcastSubject.trim() || !broadcastBody.trim()}
                    className="flex-1 border-0"
                  >
                    Preview Email
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-cream-50 p-4 rounded-2xl border border-cream-300">
                  <div className="text-sm font-inter text-sage-600 mb-1">
                    <span className="font-semibold text-sage-800">To:</span> All {broadcastAudience} users
                  </div>
                  <div className="text-sm font-inter text-sage-600 mb-4 pb-4 border-b border-cream-200">
                    <span className="font-semibold text-sage-800">Subject:</span> {broadcastSubject}
                  </div>
                  
                  {/* Pseudo Render of the email body */}
                  <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm mx-auto max-w-sm">
                    <div className="bg-terracotta-600 text-white text-center py-4 rounded-t-xl -mt-6 -mx-6 mb-6 font-lexend font-bold">
                      Lua Learn
                    </div>
                    <div className="font-inter text-sm text-sage-800 space-y-4">
                      {broadcastBody.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="min-h-[1em]">{paragraph}</p>
                      ))}
                    </div>
                    <div className="mt-8 text-center text-xs text-sage-400">
                      Standard email footer applied automatically.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setBroadcastStep('compose')}
                    disabled={broadcasting}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleSendBroadcast}
                    disabled={broadcasting}
                    variant="primary"
                    className="flex-1 border-0"
                  >
                    {broadcasting ? 'Sending...' : 'Send Broadcast'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-soft-xl"
          >
            <h3 className="font-lexend font-bold text-lg text-terracotta-900 mb-1">
              Edit User Settings
            </h3>
            <p className="font-inter text-sage-500 text-xs mb-6 truncate">
              {editingUser.email}
            </p>
            
            <div className="space-y-5">
              {/* Role Toggle */}
              <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <div>
                  <div className="font-lexend font-medium text-sm text-terracotta-900">Admin Privileges</div>
                  <div className="font-inter text-xs text-sage-500">Grants full Studio access</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditAdminToggle(!editAdminToggle)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editAdminToggle ? 'bg-terracotta-600' : 'bg-cream-400'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    editAdminToggle ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Active Sub Month Input */}
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <label className="block font-lexend font-medium text-sm text-terracotta-900 mb-1">
                  Active Subscription Month
                </label>
                <div className="font-inter text-xs text-sage-500 mb-3">
                  Format: YYYY-MM. Clear this input to revoke active access.
                </div>
                <input 
                  type="text" 
                  value={editSubMonth}
                  onChange={(e) => setEditSubMonth(e.target.value)}
                  placeholder="e.g. 2024-03"
                  className="w-full px-3 py-2 rounded-xl border border-cream-400 font-inter text-sm text-terracotta-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setEditingUser(null)}
                disabled={savingUser}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={savingUser}
                variant="primary"
                className="flex-1 border-0"
              >
                {savingUser ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
