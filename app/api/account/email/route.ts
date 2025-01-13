import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/lib/db/users';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // First update auth.users
    const { error: authError } = await supabase.auth.updateUser({
      email: email
    });

    if (authError) throw authError;

    // Then update profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: email })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}
