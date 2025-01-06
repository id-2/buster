import { BusterSocketResponseRoute } from '@/api/buster-socket';
import {
  BusterSocketResponseBase,
  BusterSocketResponseMessage
} from '@/api/buster-socket/baseInterfaces';
import { ThreadResponses } from '@/api/buster-socket/threads';
import { DashboardResponses } from '@/api/buster-socket/dashboards';
import { isDev } from '@/config';
import { DatasetResponses } from '@/api/buster-socket/datasets';
import { UserResponses } from '@/api/buster-socket/user';
import { CollectionResponses } from '@/api/buster-socket/collections';
import { DatasourceResponses } from '@/api/buster-socket/datasources/datasourceResponses';
import { TermsResponses } from '@/api/buster-socket/terms/termsResponses';
import { PermissionsResponses } from '@/api/buster-socket/permissions';
import { TeamResponses } from '@/api/buster-socket/user/teamResponses';
import { SearchResponses } from '@/api/buster-socket/search';
import { OrganizationResponses } from '@/api/buster-socket/organizations';
import { SQLResponses } from '@/api/buster-socket/sql';

export const createBusterResponse = (
  message: BusterSocketResponseMessage
): BusterSocketResponseBase => {
  const parsedMessage = message;
  const { route, payload, error, event } = parsedMessage;
  const routeAndEvent = `${route}:${event}` as BusterSocketResponseRoute;
  if (isDev) {
    isKnownMessageRoute(parsedMessage);
  }

  return {
    route: routeAndEvent,
    payload,
    error
  };
};

const isKnownMessageRoute = (parsedMessage: BusterSocketResponseMessage) => {
  const allResponses = {
    ...ThreadResponses,
    ...DashboardResponses,
    ...DatasetResponses,
    ...UserResponses,
    ...CollectionResponses,
    ...DatasourceResponses,
    ...SQLResponses,
    ...TermsResponses,
    ...PermissionsResponses,
    ...TeamResponses,
    ...SearchResponses,
    ...OrganizationResponses
  };
  const event = parsedMessage?.event;
  const route = parsedMessage?.route;
  const payload = parsedMessage?.payload;
  const allBusterSocketRoutes = Object.keys(allResponses);
  const allValues = Object.values(allBusterSocketRoutes) as string[];
  const combinedRoute = `${route}:${event}`;
  const isFound = allValues.includes(route) || allValues.includes(combinedRoute);
  if (!isFound) {
    console.warn('Unknown route:', combinedRoute, payload);
  }
};
