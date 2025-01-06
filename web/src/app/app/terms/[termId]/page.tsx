import React from 'react';
import { getAppSplitterLayout } from '@/components/layout/splitContentHelper';
import { TermIndividualContainer } from './TermIndividualContainer';

export default function TermIdPage({ params: { termId } }: { params: { termId: string } }) {
  const termPageIdLayout = getAppSplitterLayout('term-page', ['auto', '300px']);

  return <TermIndividualContainer termPageIdLayout={termPageIdLayout} termId={termId} />;
}
