
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AdminCredentials {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export const getAdminCredentials = async (): Promise<AdminCredentials | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    return data as AdminCredentials;
  } catch (error) {
    console.error('Error fetching admin credentials:', error);
    return null;
  }
};

export const updateAdminEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentAdmin = await getAdminCredentials();
    
    if (!currentAdmin) {
      throw new Error('Admin credentials not found');
    }
    
    const { error } = await supabase
      .from('admin_credentials')
      .update({ 
        email,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentAdmin.id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update email'
    };
  }
};

export const updateAdminPassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const admin = await getAdminCredentials();
    
    if (!admin) {
      throw new Error('Admin credentials not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash);
    
    if (!isPasswordValid) {
      return { 
        success: false, 
        error: 'Current password is incorrect' 
      };
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password in the database
    const { error } = await supabase
      .from('admin_credentials')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', admin.id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin password:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update password'
    };
  }
};

export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    const admin = data as AdminCredentials;
    return bcrypt.compare(password, admin.password_hash);
  } catch {
    return false;
  }
};
