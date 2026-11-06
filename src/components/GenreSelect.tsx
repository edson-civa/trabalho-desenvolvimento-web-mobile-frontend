'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { GameCategory } from '@/types/category';

interface GenreSelectProps {
    categories: GameCategory[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    onBlur: () => void;
    invalid: boolean;
}

export default function GenreSelect({ categories, selectedIds, onChange, onBlur, invalid }: GenreSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const selected = categories.filter((category) => selectedIds.includes(category.id));

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
                onBlur();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                onBlur();
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onBlur]);

    const toggleCategory = (id: number) => {
        onChange(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
    };

    return (
        <div
            ref={containerRef}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsOpen(false);
                    onBlur();
                }
            }}
        >
            <div className="position-relative">
                <button
                    ref={triggerRef}
                    id="game-categoryIds"
                    type="button"
                    className={`form-control bg-body text-body rounded-3 py-2 text-start d-flex align-items-center justify-content-between gap-3 ${invalid ? 'border-danger' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="game-genre-options"
                    aria-labelledby="game-genres-label"
                    aria-invalid={invalid}
                    aria-describedby={invalid ? 'game-categoryIds-error' : undefined}
                >
                    <span className={selected.length ? '' : 'text-body-secondary'}>
                        {selected.length ? `${selected.length} ${selected.length === 1 ? 'gênero selecionado' : 'gêneros selecionados'}` : 'Selecione os gêneros'}
                    </span>
                    <ChevronDown size={18} className="flex-shrink-0 text-body-secondary" aria-hidden="true" />
                </button>

                {isOpen && (
                    <div
                        id="game-genre-options"
                        role="group"
                        aria-labelledby="game-genres-label"
                        className="position-absolute start-0 end-0 mt-2 p-2 bg-body-tertiary border rounded-3 shadow"
                        style={{ zIndex: 20, maxHeight: '260px', overflowY: 'auto' }}
                    >
                        {categories.map((category) => (
                            <label key={category.id} className="d-flex align-items-center gap-2 p-2 rounded-2" htmlFor={`game-genre-${category.id}`}>
                                <input
                                    id={`game-genre-${category.id}`}
                                    type="checkbox"
                                    className="form-check-input mt-0 flex-shrink-0"
                                    checked={selectedIds.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                />
                                <span className="small">{category.name}</span>
                            </label>
                        ))}
                        {!categories.length && <p className="small text-body-secondary p-2 mb-0">Nenhum gênero disponível.</p>}
                    </div>
                )}
            </div>

            {selected.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                    {selected.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 px-3 py-1"
                            style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}
                            onClick={() => toggleCategory(category.id)}
                            aria-label={`Remover gênero ${category.name}`}
                        >
                            {category.name}
                            <X size={12} aria-hidden="true" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
