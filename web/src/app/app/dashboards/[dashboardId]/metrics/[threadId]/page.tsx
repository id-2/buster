import { ThreadContentController } from '@/app/app/_controllers/ThreadController';
import { AppAssetCheckLayout } from '@/app/app/_layouts';
import { getAppSplitterLayout } from '@/components/layout/splitContentHelper';
import React from 'react';

export default function DashboardThreadPage({
  params: { threadId }
}: {
  params: {
    threadId: string;
  };
}) {
  const threadLayout = getAppSplitterLayout('thread', ['auto', '360px']);

  return (
    <AppAssetCheckLayout threadId={threadId} type="thread">
      <ThreadContentController threadId={threadId} threadLayout={threadLayout} />
    </AppAssetCheckLayout>
  );
}
