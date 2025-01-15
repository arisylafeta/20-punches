import { createClient } from "@/utils/supabase/client"

export async function getVideoUrl(fileName: string) {
  console.log('getVideoUrl called with fileName:', fileName);
  const supabase = createClient()
  
  try {
    console.log('Getting public URL from Supabase...');
    const { data } = supabase
      .storage
      .from('videos')
      .getPublicUrl(fileName)
    
    console.log('Supabase response:', data);
    
    if (!data?.publicUrl) {
      console.error('No publicUrl in response');
      throw new Error('Could not get video URL')
    }
    
    return data.publicUrl
  } catch (error) {
    console.error('Error getting video URL:', error)
    throw error
  }
}

export async function uploadVideo(file: File) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .storage
      .from('videos')
      .upload(file.name, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage error:', error)
      throw error
    }
    
    if (!data) {
      throw new Error('Video upload failed - no data returned')
    }
    
    return data
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}