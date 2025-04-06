
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

export const resetAdminPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify admin email exists
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('Admin not found with email:', email);
      return { 
        success: false, 
        error: 'No admin account found with this email' 
      };
    }
    
    const admin = data as AdminCredentials;
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password in the database
    const { error: updateError } = await supabase
      .from('admin_credentials')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', admin.id);
    
    if (updateError) throw updateError;
    
    console.log('Password reset successful for admin:', email);
    return { success: true };
  } catch (error: any) {
    console.error('Error resetting admin password:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to reset password'
    };
  }
};

export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying admin credentials for email:', email);
    
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching admin credentials:', error);
      return false;
    }
    
    if (!data) {
      console.log('No admin found with email:', email);
      return false;
    }
    
    const admin = data as AdminCredentials;
    console.log('Admin found:', { id: admin.id, email: admin.email });
    
    // Set a default password for first-time login if the hash looks like a placeholder
    if (admin.password_hash.startsWith('$2a$10$xxxxxxx')) {
      console.log('Using default password for first login');
      // Check if using default password (password123)
      if (password === 'password123') {
        console.log('Default password matched');
        
        // Update with actual hash after successful login
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const { error: updateError } = await supabase
          .from('admin_credentials')
          .update({ 
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', admin.id);
        
        if (updateError) {
          console.error('Error updating default password:', updateError);
        } else {
          console.log('Default password hash updated');
        }
        
        return true;
      }
      return false;
    }
    
    console.log('Comparing password with hash');
    const isValid = await bcrypt.compare(password, admin.password_hash);
    console.log('Password valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

// Helper function to create initial admin account (run this once from the admin panel)
export const createInitialAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabase
      .from('admin_credentials')
      .insert({
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error creating initial admin account:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create admin account'
    };
  }
};
