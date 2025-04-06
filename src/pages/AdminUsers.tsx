
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';

type UserWithRole = {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Fetch users from auth schema
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      if (!authUsers?.users?.length) {
        setUsers([]);
        return;
      }

      // Fetch roles for users
      const userIds = authUsers.users.map(user => user.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Fetch profiles for display names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create combined user data
      const usersWithRoles: UserWithRole[] = authUsers.users.map(user => {
        const userRole = roles?.find(r => r.user_id === user.id);
        const userProfile = profiles?.find(p => p.id === user.id);
        
        return {
          id: user.id,
          email: user.email || '',
          display_name: userProfile?.display_name || null,
          role: userRole?.role || 'user',
          created_at: user.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user: UserWithRole) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleDeleteUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      if (selectedUser.role === 'admin') {
        // Demote admin to user
        const { error } = await supabase.rpc('demote_to_user', {
          user_id_to_demote: selectedUser.id
        });
        
        if (error) throw error;
        toast.success(`${selectedUser.display_name || selectedUser.email} is now a regular user`);
      } else {
        // Promote user to admin
        const { error } = await supabase.rpc('promote_to_admin', {
          user_id_to_promote: selectedUser.id
        });
        
        if (error) throw error;
        toast.success(`${selectedUser.display_name || selectedUser.email} is now an admin`);
      }
      
      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Failed to change user role');
    } finally {
      setProcessing(false);
      setRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      
      if (error) throw error;
      
      toast.success(`User ${selectedUser.display_name || selectedUser.email} has been deleted`);
      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name/Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          {user.display_name && (
                            <div className="font-medium">{user.display_name}</div>
                          )}
                          <div className={user.display_name ? "text-sm text-muted-foreground" : ""}>{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.role === 'admin' ? (
                            <>
                              <ShieldAlert className="h-4 w-4 mr-1 text-destructive" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>User</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(user)}
                          >
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.role === 'admin'
                ? 'Remove Admin Rights'
                : 'Grant Admin Rights'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.role === 'admin'
                ? `Are you sure you want to remove admin rights from ${selectedUser?.display_name || selectedUser?.email}?`
                : `Are you sure you want to grant admin rights to ${selectedUser?.display_name || selectedUser?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRoleChange();
              }}
              disabled={processing}
              className={selectedUser?.role === 'admin' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedUser?.role === 'admin' ? (
                'Remove Admin'
              ) : (
                'Grant Admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for {selectedUser?.display_name || selectedUser?.email}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteUser();
              }}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
