
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
