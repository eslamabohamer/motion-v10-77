
import { supabase } from "@/integrations/supabase/client";

// Fix for the UserRating component error - ensure we return a success boolean
export async function addUserRating(data: {
  project_id: string;
  rating: number;
  comment: string;
  user_id?: string | null;
  photo_url?: string | null;
}) {
  try {
    // Ensure the storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'user-photos');
    
    if (!bucketExists) {
      // Create user-photos bucket if it doesn't exist
      console.log('Creating user-photos bucket');
      await supabase.storage.createBucket('user-photos', {
        public: true, // Make bucket public
        fileSizeLimit: 5242880 // 5MB in bytes
      });
    }
    
    const { error } = await supabase
      .from('user_ratings')
      .insert([data]);
      
    return { error, success: !error };
  } catch (error) {
    console.error('Error in addUserRating:', error);
    return { 
      error, 
      success: false 
    };
  }
}

// Helper to handle project sections
export async function getProjectSections(sectionId: string) {
  return await supabase
    .from('project_sections')
    .select('project_id')
    .eq('section_id', sectionId);
}

// Helper to handle adding project sections
export async function addProjectSections(projectId: string, sectionIds: string[]) {
  // First delete any existing sections for this project
  await supabase
    .from('project_sections')
    .delete()
    .eq('project_id', projectId);
    
  // Nothing to add
  if (sectionIds.length === 0) {
    return { error: null };
  }
  
  // Create the data to insert
  const dataToInsert = sectionIds.map(sectionId => ({
    project_id: projectId,
    section_id: sectionId
  }));
  
  // Insert the new sections
  return await supabase
    .from('project_sections')
    .insert(dataToInsert);
}

// Helper to fetch site sections
export async function fetchSiteSections() {
  return await supabase
    .from('site_sections')
    .select('*')
    .order('display_order', { ascending: true });
}

// Helper to update a site section
export async function updateSiteSection(id: string, data: any) {
  return await supabase
    .from('site_sections')
    .update(data)
    .eq('id', id);
}

// Helper to add a site section
export async function addSiteSection(data: any) {
  return await supabase
    .from('site_sections')
    .insert([data]);
}

// Helper to delete a site section
export async function deleteSiteSection(id: string) {
  return await supabase
    .from('site_sections')
    .delete()
    .eq('id', id);
}

// Helper to adjust site section order
export async function updateSiteSectionOrder(section1Id: string, section1Order: number, section2Id: string, section2Order: number) {
  const updates = [
    supabase
      .from('site_sections')
      .update({ display_order: section2Order })
      .eq('id', section1Id),
    
    supabase
      .from('site_sections')
      .update({ display_order: section1Order })
      .eq('id', section2Id)
  ];
  
  return Promise.all(updates);
}

// Helper to get projects with their sections
export async function getProjectsWithSections() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    const { data: projectSectionsData, error: sectionsError } = await supabase
      .from('project_sections')
      .select('project_id, section_id');
      
    if (sectionsError) {
      console.error('Error fetching project sections:', sectionsError);
    }
    
    const { data: siteSectionsData, error: siteSectionsError } = await fetchSiteSections();
    
    if (siteSectionsError) {
      console.error('Error fetching site sections:', siteSectionsError);
    }
    
    const projectsWithSections = projects?.map(project => {
      const projectSectionIds = projectSectionsData
        ?.filter(ps => ps.project_id === project.id)
        .map(ps => ps.section_id) || [];
        
      const projectSections = siteSectionsData
        ?.filter(section => projectSectionIds.includes(section.id)) || [];
      
      return {
        ...project,
        sections: projectSections
      };
    }) || [];
    
    return projectsWithSections;
  } catch (error) {
    console.error('Error fetching projects with sections:', error);
    throw error;
  }
}

// Helper to fetch team members with their expertise sections
export async function getTeamMembersWithSections() {
  try {
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return teamMembers;
  } catch (error) {
    console.error('Error fetching team members with sections:', error);
    throw error;
  }
}

// Add a function to get projects by section for team members' expertise
export async function getProjectsBySectionForTeam(sectionId: string) {
  try {
    // First get all project IDs that belong to this section
    const { data: projectSections, error: sectionsError } = await supabase
      .from('project_sections')
      .select('project_id')
      .eq('section_id', sectionId);
      
    if (sectionsError) {
      throw sectionsError;
    }
    
    if (!projectSections || projectSections.length === 0) {
      return [];
    }
    
    // Get all project IDs
    const projectIds = projectSections.map(ps => ps.project_id);
    
    // Now get the actual projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return projects || [];
  } catch (error) {
    console.error('Error fetching projects by section:', error);
    return [];
  }
}
