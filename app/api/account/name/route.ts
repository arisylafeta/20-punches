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

    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating name:', error);
    return NextResponse.json(
      { error: 'Failed to update name' },
      { status: 500 }
    );
  }
}
