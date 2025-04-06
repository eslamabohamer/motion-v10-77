
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'user';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // We need to fetch from auth.users but we can't directly through the API
        // So we'll use two queries and join them client-side
        const { data: users, error: usersError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name');

        if (usersError || profilesError) {
          console.error('Error fetching users:', usersError || profilesError);
          toast.error('Failed to load users');
          return;
        }

        // Join the data
        const userList = users.map(user => {
          const profile = profiles.find(p => p.id === user.user_id);
          return {
            id: user.user_id,
            display_name: profile?.display_name || 'Unknown',
            email: '', // We don't have this from our query
            role: user.role,
          };
        });

        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    
    if (confirmed) {
      try {
        // First remove from our roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (roleError) {
          throw roleError;
        }

        // Then remove their profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) {
          throw profileError;
        }

        // Finally delete the user from auth
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) {
          throw error;
        }
        
        toast.success("User deleted successfully");
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDemoteToUser = async (userId: string) => {
    if (userId === currentUserId) {
      const confirmed = window.confirm("Are you sure you want to demote yourself from admin? You will lose admin privileges.");
      if (!confirmed) return;
    }

    try {
      const { error } = await supabase.rpc('demote_to_user', {
        user_id_to_demote: userId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("User has been demoted to regular user");
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'user' } : user
      ));
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error("Failed to demote user");
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        user_id_to_promote: userId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("User has been promoted to admin");
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'admin' } : user
      ));
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error("Failed to promote user");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Button onClick={() => navigate('/register')} variant="outline" size="sm">
                Add New User
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.display_name || 'Unnamed User'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role === 'admin' ? (
                              <ShieldAlert className="mr-1 h-3 w-3" />
                            ) : (
                              <UserX className="mr-1 h-3 w-3" /> 
                            )}
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {user.role === 'admin' ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDemoteToUser(user.id)}
                                disabled={user.id === currentUserId && users.filter(u => u.role === 'admin').length <= 1}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Demote
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handlePromoteToAdmin(user.id)}
                              >
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Promote
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUserId}
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
