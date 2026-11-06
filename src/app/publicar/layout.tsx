import type { ReactNode } from 'react';
import RequireAuth from '@/components/RequireAuth';

export default function PublishGameLayout({ children }: { children: ReactNode }) {
    return <RequireAuth>{children}</RequireAuth>;
}
