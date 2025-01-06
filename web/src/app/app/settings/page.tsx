'use client';

import React, { useContext } from 'react';
import { permanentRedirect } from 'next/navigation';
import { BusterRoutes, createBusterRoute } from '@/routes';

export default function SettingsPage() {
  return permanentRedirect(
    createBusterRoute({
      route: BusterRoutes.SETTINGS_GENERAL
    })
  );
}
