import type { ReactNode } from 'react';
import RequireAuth from '@/components/RequireAuth';

export default function LibraryLayout({ children }: { children: ReactNode }) {
    return <RequireAuth>{children}</RequireAuth>;
}
