import { BusterRoutes, createBusterRoute } from './busterRoutes';

export const pathNameToRoute = (pathName: string, params: any): BusterRoutes => {
  const route = Object.values(BusterRoutes).find((r) => {
    return r === pathName || createBusterRoute({ route: r, ...params }) === pathName;
  });

  const paramRoutesToParent: Record<string, BusterRoutes> = {
    [BusterRoutes.APP_THREAD_ID]: BusterRoutes.APP_THREAD
  };
  if (route && paramRoutesToParent[route as string]) {
    return paramRoutesToParent[route as string];
  }

  return route || BusterRoutes.ROOT;
};
