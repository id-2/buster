import { createBusterResponse } from '@/context/BusterWebSocket/helpers';
import { BusterRoutes, createBusterRoute } from '@/routes';
import { permanentRedirect } from 'next/navigation';

export default function Page() {
  permanentRedirect(createBusterRoute({ route: BusterRoutes.APP_USERS }));
  return <></>;
}
