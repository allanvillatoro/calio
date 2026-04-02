import Image from 'next/image';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col">
        <div className="flex justify-center">
          <div className="relative w-[180px] sm:w-[220px] md:w-[260px] aspect-[4/3]">
            <Image
              src="/images/logo.png"
              alt="CALIO Joyería"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 260px"
            />
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
