import CustomerPortalForm from '@/components/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/AccountForms/EmailForm';
import NameForm from '@/components/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/lib/db/users';

export default async function Account() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/login');
  }

  return (
    <section className="mb-32">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-center sm:text-6xl">
            Account Settings
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-muted-foreground sm:text-center sm:text-2xl">
            Manage your account settings and subscription
          </p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <CustomerPortalForm />
        <NameForm />
        <EmailForm />
      </div>
    </section>
  );
}
