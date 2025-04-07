
import { supabase } from "@/integrations/supabase/client";

// Fix for the UserRating component error - ensure we return a success boolean
export async function addUserRating(data: {
  project_id: string;
  rating: number;
  comment: string;
  user_id?: string | null;
  photo_url?: string | null;
}) {
  const { error } = await supabase
    .from('user_ratings')
    .insert([data]);
    
  return { error, success: !error };
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

// Helper functions for company logo management
export async function fetchCompanyLogos() {
  return await supabase
    .from('company_logos')
    .select('*')
    .order('display_order', { ascending: true });
}

export async function addCompanyLogo(data: {
  name: string;
  logo_url: string;
  website?: string;
  display_order: number;
}) {
  return await supabase
    .from('company_logos')
    .insert([data]);
}

export async function updateCompanyLogo(id: string, data: {
  name?: string;
  logo_url?: string;
  website?: string | null;
  display_order?: number;
}) {
  return await supabase
    .from('company_logos')
    .update(data)
    .eq('id', id);
}

export async function deleteCompanyLogo(id: string) {
  return await supabase
    .from('company_logos')
    .delete()
    .eq('id', id);
}

export async function updateCompanyLogoOrder(logo1Id: string, logo1Order: number, logo2Id: string, logo2Order: number) {
  const updates = [
    supabase
      .from('company_logos')
      .update({ display_order: logo2Order })
      .eq('id', logo1Id),
    
    supabase
      .from('company_logos')
      .update({ display_order: logo1Order })
      .eq('id', logo2Id)
  ];
  
  return Promise.all(updates);
}
