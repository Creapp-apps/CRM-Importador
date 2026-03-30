import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSuperAdmin = (session.user as any).isSuperAdmin === true;

  redirect(isSuperAdmin ? '/super-admin' : '/dashboard');
}
