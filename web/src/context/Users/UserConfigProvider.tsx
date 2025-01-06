import { BusterOrganizationRole, BusterUserPalette, BusterUserResponse } from '@/api/busterv2';
import React, { PropsWithChildren, useRef, useState } from 'react';
import { useBusterWebSocket } from '../BusterWebSocket';
import { useMemoizedFn } from 'ahooks';
import { useFavoriteProvider } from './useFavoriteProvider';
import { getUserInfo } from '@/api/busterv2/users/requests';
import { useSupabaseContext } from '../Supabase';
import {
  ContextSelector,
  createContext,
  useContextSelector
} from '@fluentui/react-context-selector';
import { useBusterNotifications } from '../BusterNotifications';
import { timeout } from '@/utils';

export const useUserConfigProvider = ({ userInfo }: { userInfo: BusterUserResponse | null }) => {
  const busterSocket = useBusterWebSocket();
  const { openSuccessMessage } = useBusterNotifications();
  const isAnonymousUser = useSupabaseContext((state) => state.isAnonymousUser);
  const accessToken = useSupabaseContext((state) => state.accessToken);
  const [userResponse, setUserResponse] = useState<BusterUserResponse | null>(userInfo);
  const useMountedUser = useRef(false);
  const [userPalettes, setUserPalettes] = React.useState<BusterUserPalette[]>([]);
  const user = userResponse?.user;
  const userTeams = userResponse?.teams || [];
  const userOrganizations = userResponse?.organizations[0];
  const userRole = userOrganizations?.role;
  const isUserRegistered =
    !!userResponse && !!userResponse?.organizations?.[0]?.id && !!userResponse?.user?.name;
  const isAdmin =
    userRole === BusterOrganizationRole.owner || userRole === BusterOrganizationRole.admin;

  const allOptions = [
    ...[], //import { colorOptions as defaultColorOptions } from '@/app/app/_controllers/ThreadController/ThreadControllerEditContent/SidebarChartApp';
    ...userPalettes.map((p) => ({ id: p.id, colors: p.palette }))
  ];

  const _onGetInitialUserColorPalettes = useMemoizedFn((palettes: BusterUserPalette[]) => {
    setUserPalettes(palettes);
  });

  const _onCreateUserColorPalette = useMemoizedFn((palettes: BusterUserPalette[]) => {
    return _onGetInitialUserColorPalettes(palettes);
  });

  const onGetInitialUserColorPalettes = useMemoizedFn(async () => {
    if (!useMountedUser.current) {
      busterSocket.emit({
        route: '/users/colors/list',
        payload: {}
      });
      busterSocket.on({
        route: '/users/colors/list:listUserColorPalettes',
        callback: _onGetInitialUserColorPalettes
      });
      useMountedUser.current = true;
    }
  });

  const createNewPalette = useMemoizedFn(async (colors: string[]) => {
    const res = busterSocket.emitAndOnce({
      emitEvent: {
        route: '/users/colors/post',
        payload: { color_palette: colors }
      },
      responseEvent: {
        route: '/users/colors/post:createUserColorPalette',
        callback: _onCreateUserColorPalette
      }
    });
  });

  const updatePalette = useMemoizedFn(async (id: string, colors: string[]) => {
    const newPalettes = userPalettes.map((p) => {
      if (p.id === id) {
        return { ...p, palette: colors };
      }
      return p;
    });
    setUserPalettes(newPalettes);
    busterSocket.emit({
      route: '/users/colors/update',
      payload: { id, color_palette: colors }
    });
  });

  const deletePalette = useMemoizedFn(async (id: string) => {
    const newPalettes = userPalettes.filter((p) => p.id !== id);
    setUserPalettes(newPalettes);

    busterSocket.emit({
      route: '/users/colors/delete',
      payload: { id }
    });
  });

  const inviteUsers = useMemoizedFn(async (emails: string[], team_ids?: string[]) => {
    busterSocket.emit({
      route: '/users/invite',
      payload: { emails, team_ids }
    });
    await timeout(350);
    openSuccessMessage('Invites sent');
  });

  const onCreateUserOrganization = useMemoizedFn(
    async ({
      name,
      company,
      alreadyHasCompany
    }: {
      name: string;
      company: string;
      alreadyHasCompany?: boolean;
    }) => {
      if (!alreadyHasCompany) {
        const orgRes = await busterSocket.emitAndOnce({
          emitEvent: {
            route: '/organizations/post',
            payload: { name: company }
          },
          responseEvent: {
            route: '/organizations/post:post',
            callback: (v) => v
          }
        });
      }
      const userRes = await busterSocket.emitAndOnce({
        emitEvent: {
          route: '/permissions/users/update',
          payload: { name, id: user?.id! }
        },
        responseEvent: {
          route: '/permissions/users/update:updateUserPermission',
          callback: (v) => v
        }
      });
      await updateUserInfo();

      return;
    }
  );

  const updateUserInfo = useMemoizedFn(async () => {
    const res = await getUserInfo({ jwtToken: accessToken });
    if (res) {
      setUserResponse(res);
    }
  });

  //TEAM CONFIG
  // const teamConfig = useTeamConfigProvider();
  const favoriteConfig = useFavoriteProvider();

  return {
    onCreateUserOrganization,
    inviteUsers,
    onGetInitialUserColorPalettes,
    userPalettes,
    createNewPalette,
    updatePalette,
    deletePalette,
    allOptions,
    userTeams,
    loadedUserTeams: !!userResponse,
    user,
    userRole,
    isAdmin,
    userOrganizations,
    isUserRegistered,
    isAnonymousUser,
    ...favoriteConfig
  };
};

const BusterUserConfig = createContext<ReturnType<typeof useUserConfigProvider>>(
  {} as ReturnType<typeof useUserConfigProvider>
);

export const BusterUserConfigProvider = React.memo<
  PropsWithChildren<{ userInfo: BusterUserResponse | undefined }>
>(({ children, userInfo }) => {
  const userConfig = useUserConfigProvider({
    userInfo: userInfo || null
  });

  return <BusterUserConfig.Provider value={userConfig}>{children}</BusterUserConfig.Provider>;
});
BusterUserConfigProvider.displayName = 'BusterUserConfigProvider';

export const useUserConfigContextSelector = <T,>(
  selector: ContextSelector<ReturnType<typeof useUserConfigProvider>, T>
) => useContextSelector(BusterUserConfig, selector);
