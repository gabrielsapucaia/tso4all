import { supabase } from '@/lib/supabase/client'

// Get all equipamentos (read-only)
export const getEquipamentos = async () => {
  const { data, error } = await supabase
    .from('equipament')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching equipamentos:', error)
    return { data: [], error }
  }

  return { data, error }
}

// Get table structure (for initial discovery)
export const getEquipamentosTableStructure = async () => {
  const { data, error } = await supabase
    .from('equipament')
    .select('*')
    .limit(1)

  return { data, error }
}