'use server';

import { AppProviders } from '@/context/AppProviders';
import { useSupabaseServerContext } from '@/context/Supabase/useSupabaseContext';
import React from 'react';
import { AppLayout } from './_controllers/AppLayout';
import { getAppSplitterLayout } from '@/components/layout/splitContentHelper';
import { getUserInfo } from '@/api/busterv2/users/requests';
import { useBusterSupabaseAuthMethods } from '@/hooks/useBusterSupabaseAuthMethods';
import { createBusterRoute } from '@/routes';
import { BusterAppRoutes } from '@/routes/busterRoutes/busterAppRoutes';
import { headers, cookies } from 'next/headers';
import { ClientRedirect } from './_components/ClientRedirect';
import { AppLayoutClient } from './layoutClient';

export default async function Layout({
  children,
  ...rest
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const supabaseContext = await useSupabaseServerContext();
  const userInfo = await getUserInfo({ jwtToken: supabaseContext.accessToken });
  const defaultLayout = getAppSplitterLayout('app-layout', ['230px', 'auto']);
  const { signOut } = useBusterSupabaseAuthMethods();
  const pathname = headersList.get('x-next-pathname') as string;
  const cookiePathname = cookies().get('x-next-pathname')?.value;
  const newUserRoute = createBusterRoute({ route: BusterAppRoutes.NEW_USER });

  if (
    (!userInfo?.organizations[0]?.id || !userInfo?.user?.name) &&
    !cookiePathname?.includes(newUserRoute) &&
    pathname !== newUserRoute &&
    supabaseContext.accessToken //added to avoid bug with anon user
  ) {
    return <ClientRedirect to={newUserRoute} />;
  }

  return (
    <AppLayoutClient
      userInfo={userInfo}
      supabaseContext={supabaseContext}
      defaultLayout={defaultLayout}
      signOut={signOut}>
      {children}
    </AppLayoutClient>
  );
}
