'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  isMember: boolean
}

export default function UserList({ initialUsers, usergroupId }: { initialUsers: User[]; usergroupId: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const usersPerPage = 10
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const handleToggleMembership = async (userId: string, isMember: boolean) => {
    setLoading(userId)
    try {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isMember: !isMember } : user
        )
      )

      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usergroupId: isMember ? null : usergroupId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update membership status')
      }

      toast.success(`User ${isMember ? 'removed from' : 'added to'} the group.`)
    } catch (error) {
      console.error(error)
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isMember: isMember } : user
        )
      )
      toast.error("Failed to update membership status. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold w-[75%]">User Management</h2>
        <div className="relative w-[50%] lg:w-[25%]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Membership</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={user.isMember}
                    onCheckedChange={() => handleToggleMembership(user.id, user.isMember)}
                    disabled={loading === user.id}
                  />
                  <span>{user.isMember ? 'Member' : 'Not a member'}</span>
                  {loading === user.id && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}