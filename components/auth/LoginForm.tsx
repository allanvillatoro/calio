'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions/login.action';
import { clearStoredAuthToken, setStoredAuthToken } from '@/lib/auth-client';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const loginResult = await login(values);
      setStoredAuthToken(loginResult.token);
      toast.success('Sesión iniciada correctamente');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      clearStoredAuthToken();
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesión';
      setSubmitError(message);
      setError('root', {
        type: 'server',
        message,
      });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenida</CardTitle>
          <CardDescription>Ingresa tus credenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Correo</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@calio.com"
                  aria-invalid={!!errors.email}
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Ingresa un correo valido',
                    },
                  })}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register('password', {
                    required: 'La contrasena es obligatoria',
                    minLength: {
                      value: 6,
                      message: 'La contrasena debe tener al menos 6 caracteres',
                    },
                  })}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
                <FieldError
                  errors={submitError ? [{ message: submitError }] : undefined}
                />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
