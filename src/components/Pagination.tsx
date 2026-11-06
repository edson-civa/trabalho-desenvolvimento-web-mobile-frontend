'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    label: string;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, totalItems, label, onPageChange }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-top border-body-subtle pt-3 mt-3 small text-body-secondary">
            <span aria-live="polite">Exibindo {firstItem}–{lastItem} de {totalItems}</span>
            <nav aria-label={label} className="d-flex align-items-center gap-2">
                <button type="button" className="btn btn-sm border-0 text-body-secondary d-inline-flex align-items-center gap-1 px-2" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft size={16} aria-hidden="true" />
                    <span className="d-none d-sm-inline">Anterior</span>
                    <span className="visually-hidden d-sm-none">Página anterior</span>
                </button>
                <span aria-live="polite" aria-atomic="true" className="text-nowrap">Página {page} de {totalPages}</span>
                <button type="button" className="btn btn-sm border-0 d-inline-flex align-items-center gap-1 px-2" style={{ color: '#7C3AED' }} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    <span className="d-none d-sm-inline">Próxima</span>
                    <span className="visually-hidden d-sm-none">Próxima página</span>
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
}
