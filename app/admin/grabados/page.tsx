import { redirect } from 'next/navigation';
import { AdminLaserEngravingsContent } from '@/components/admin/AdminLaserEngravingsContent';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export default async function AdminLaserEngravingsPage() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-center pb-6">
        Administrar grabados laser
      </h1>

      <AdminLaserEngravingsContent />
    </div>
  );
}
