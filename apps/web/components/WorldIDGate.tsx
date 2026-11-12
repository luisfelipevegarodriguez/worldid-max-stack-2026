'use client';

import dynamic from 'next/dynamic';

const WorldIDButton = dynamic(() => import('@/components/WorldIDButton'), { ssr: false });

type Props = {
  action?: string;
  mode?: 'nullifier' | 'session';
  onSuccess?: (nullifier: string) => void;
};

export default function WorldIDGate(props: Props) {
  return <WorldIDButton {...props} />;
}
