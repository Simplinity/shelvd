import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }
  
  // Get user to delete
  const { userId } = await request.json()
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }
  
  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }
  
  // Check if target user is admin (protect admins)
  const { data: targetProfile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  if (targetProfile?.is_admin) {
    return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 })
  }
  
  // Delete user's data (cascade will handle book_contributors, user_profiles)
  // First delete books
  const { error: booksError } = await supabase
    .from('books')
    .delete()
    .eq('user_id', userId)
  
  if (booksError) {
    return NextResponse.json({ error: 'Failed to delete user books: ' + booksError.message }, { status: 500 })
  }
  
  // Delete user_stats if exists
  await supabase
    .from('user_stats')
    .delete()
    .eq('user_id', userId)
  
  // Delete user profile (cascade from auth.users should handle this, but be explicit)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId)
  
  if (profileError) {
    return NextResponse.json({ error: 'Failed to delete user profile: ' + profileError.message }, { status: 500 })
  }
  
  // Delete from auth.users via admin API
  // Note: This requires service_role key or Supabase admin API
  // For now, we'll use the admin.deleteUser if available
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  
  if (authError) {
    return NextResponse.json({ error: 'Failed to delete auth user: ' + authError.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
