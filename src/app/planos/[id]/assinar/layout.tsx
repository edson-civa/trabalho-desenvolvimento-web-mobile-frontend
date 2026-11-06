import type { ReactNode } from 'react';
import RequireAuth from '@/components/RequireAuth';

export default function SubscribeLayout({ children }: { children: ReactNode }) {
    return <RequireAuth>{children}</RequireAuth>;
}
