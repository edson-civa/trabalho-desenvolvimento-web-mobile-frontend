'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, ImagePlus, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import GenreSelect from '@/components/GenreSelect';
import type { GameCategory } from '@/types/category';
import { getGameFormValues, isImageUrl, parseDecimal, validateGameForm } from '@/lib/game-form';
import type { GalleryImageField, GameFormFields, GameFormValues } from '@/lib/game-form';
import styles from './GameForm.module.css';

interface GameFormProps {
    categories: GameCategory[];
    publisherName: string;
    initialValues?: Partial<GameFormValues>;
    mode?: 'create' | 'edit';
    onSubmit?: (values: GameFormValues) => void | Promise<void>;
}

function GameImage({ src, alt, compact = false }: { src: string; alt: string; compact?: boolean }) {
    const [failedUrl, setFailedUrl] = useState('');
    const hasImage = isImageUrl(src) && failedUrl !== src;

    return (
        <div
            className="position-relative rounded-3 bg-body border border-body-subtle overflow-hidden d-flex flex-column align-items-center justify-content-center text-body-secondary"
            style={{ aspectRatio: '16/9' }}
        >
            {hasImage ? (
                <img src={src} alt={alt} className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain bg-body" onError={() => setFailedUrl(src)} />
            ) : (
                <>
                    <ImageIcon size={compact ? 18 : 28} strokeWidth={1.5} aria-hidden="true" />
                    {!compact && <span className="small mt-2">{failedUrl === src && src ? 'Imagem indisponível' : 'Prévia da capa'}</span>}
                </>
            )}
        </div>
    );
}

export default function GameForm({ categories, publisherName, initialValues, mode = initialValues ? 'edit' : 'create', onSubmit }: GameFormProps) {
    
    const [fields, setFields] = useState<GameFormFields>(() => ({
        name: initialValues?.name ?? '',
        imageUrl: initialValues?.imageUrl ?? '',
        description: initialValues?.description ?? '',
        longDescription: initialValues?.longDescription ?? '',
        categoryIds: [...(initialValues?.categoryIds ?? [])],
        price: initialValues?.price !== undefined ? String(initialValues.price).replace('.', ',') : '',
        currentDiscount: initialValues?.currentDiscount ? String(initialValues.currentDiscount).replace('.', ',') : '',
    }));
    const [images, setImages] = useState<GalleryImageField[]>(() => (initialValues?.screenshots ?? []).map((url, id) => ({ id, url })));
    const nextImageId = useRef(images.length);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitting = useRef(false);
    const [notice, setNotice] = useState('');
    const [submitError, setSubmitError] = useState('');

    const errors = validateGameForm(fields, images, categories.map((category) => category.id));
    const selectedCategories = categories.filter((category) => fields.categoryIds.includes(category.id));
    const price = errors.price ? 0 : parseDecimal(fields.price);
    const discount = errors.currentDiscount ? 0 : parseDecimal(fields.currentDiscount);
    const finalPrice = Number((price * (1 - discount / 100)).toFixed(2));
    const gallery = images.filter((image) => isImageUrl(image.url));

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isInvalid = (field: string) => Boolean(touched[field] && errors[field]);
    const markTouched = (field: string) => setTouched((previous) => ({ ...previous, [field]: true }));

    const clearFeedback = () => {
        setNotice('');
        setSubmitError('');
    };

    const updateField = (field: Exclude<keyof GameFormFields, 'categoryIds'>, value: string) => {
        setFields((previous) => ({ ...previous, [field]: value }));
        clearFeedback();
    };

    const renderError = (field: string) => isInvalid(field) ? (
        <div id={`game-${field}-error`} className="invalid-feedback d-block" aria-live="polite">{errors[field]}</div>
    ) : null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current) return;
        clearFeedback();
        setTouched(Object.fromEntries([...Object.keys(fields), ...images.map((image) => `screenshot-${image.id}`)].map((field) => [field, true])));

        const firstError = Object.keys(errors)[0];
        if (firstError) {
            event.currentTarget.querySelector<HTMLElement>(`#game-${firstError}`)?.focus();
            return;
        }

        if (!onSubmit) {
            setNotice(mode === 'edit' ? 'As alterações ainda não podem ser salvas.' : 'A publicação ainda não está disponível.');
            return;
        }

        submitting.current = true;
        setIsSubmitting(true);
        try {
            await onSubmit(getGameFormValues(fields, images));
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar o jogo. Tente novamente.');
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <h1 className="fw-bold fs-2 text-body mb-4 pb-2">{mode === 'edit' ? 'Editar jogo' : 'Publicar jogo'}</h1>

            <form className={`${styles.form} row g-4 align-items-start`} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                <div className="col-12 col-lg-8">
                    <fieldset disabled={isSubmitting} className="border-0 p-0 m-0 d-flex flex-column gap-4">
                        <section className="bg-body-tertiary border border-body-subtle rounded-4 p-4 shadow-sm" aria-labelledby="game-info-title">
                            <h2 id="game-info-title" className="fw-bold fs-5 mb-4">Informações do jogo</h2>

                            <div className="mb-4">
                                <label htmlFor="game-imageUrl" className="form-label small fw-semibold">URL da capa <span aria-hidden="true">*</span></label>
                                <div className="border border-body-subtle rounded-3 p-3">
                                    <div className="row g-3 align-items-center">
                                        <div className="col-12 col-sm-4">
                                            <GameImage src={fields.imageUrl.trim()} alt="Prévia da capa do jogo" compact />
                                        </div>
                                        <div className="col-12 col-sm-8">
                                            <input
                                                id="game-imageUrl"
                                                name="imageUrl"
                                                type="url"
                                                autoComplete="off"
                                                placeholder="https://site.com/capa.jpg"
                                                value={fields.imageUrl}
                                                onChange={(event) => updateField('imageUrl', event.target.value)}
                                                onBlur={() => markTouched('imageUrl')}
                                                className={`form-control bg-body text-body rounded-3 py-2 ${isInvalid('imageUrl') ? 'is-invalid' : ''}`}
                                                aria-invalid={isInvalid('imageUrl')}
                                                aria-describedby={isInvalid('imageUrl') ? 'game-imageUrl-error' : undefined}
                                                required
                                            />
                                            {renderError('imageUrl')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="game-name" className="form-label small fw-semibold">Nome do jogo <span aria-hidden="true">*</span></label>
                                <input
                                    id="game-name"
                                    name="name"
                                    type="text"
                                    maxLength={150}
                                    placeholder="Nome do seu jogo"
                                    value={fields.name}
                                    onChange={(event) => updateField('name', event.target.value)}
                                    onBlur={() => markTouched('name')}
                                    className={`form-control bg-body text-body rounded-3 py-2 ${isInvalid('name') ? 'is-invalid' : ''}`}
                                    aria-invalid={isInvalid('name')}
                                    aria-describedby={isInvalid('name') ? 'game-name-error' : undefined}
                                    required
                                />
                                {renderError('name')}
                            </div>

                            <div className="mb-4">
                                <label id="game-genres-label" htmlFor="game-categoryIds" className="form-label small fw-semibold">Gêneros <span aria-hidden="true">*</span></label>
                                <GenreSelect
                                    categories={categories}
                                    selectedIds={fields.categoryIds}
                                    onChange={(ids) => {
                                        setFields((previous) => ({ ...previous, categoryIds: ids }));
                                        clearFeedback();
                                    }}
                                    onBlur={() => markTouched('categoryIds')}
                                    invalid={isInvalid('categoryIds')}
                                />
                                {renderError('categoryIds')}
                            </div>

                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                    <label htmlFor="game-description" className="form-label small fw-semibold">Descrição curta <span aria-hidden="true">*</span></label>
                                    <span className="small text-body-secondary">{fields.description.length}/500</span>
                                </div>
                                <textarea
                                    id="game-description"
                                    name="description"
                                    rows={2}
                                    maxLength={500}
                                    placeholder="Uma breve apresentação do jogo"
                                    value={fields.description}
                                    onChange={(event) => updateField('description', event.target.value)}
                                    onBlur={() => markTouched('description')}
                                    className={`form-control bg-body text-body rounded-3 py-2 ${isInvalid('description') ? 'is-invalid' : ''}`}
                                    aria-invalid={isInvalid('description')}
                                    aria-describedby={isInvalid('description') ? 'game-description-error' : undefined}
                                    required
                                />
                                {renderError('description')}
                            </div>

                            <div>
                                <label htmlFor="game-longDescription" className="form-label small fw-semibold">Descrição completa <span aria-hidden="true">*</span></label>
                                <textarea
                                    id="game-longDescription"
                                    name="longDescription"
                                    rows={6}
                                    placeholder="Conte mais sobre a história e a experiência do jogo"
                                    value={fields.longDescription}
                                    onChange={(event) => updateField('longDescription', event.target.value)}
                                    onBlur={() => markTouched('longDescription')}
                                    className={`form-control bg-body text-body rounded-3 py-2 ${isInvalid('longDescription') ? 'is-invalid' : ''}`}
                                    aria-invalid={isInvalid('longDescription')}
                                    aria-describedby={isInvalid('longDescription') ? 'game-longDescription-error' : undefined}
                                    required
                                />
                                {renderError('longDescription')}
                            </div>
                        </section>

                        <section className="bg-body-tertiary border border-body-subtle rounded-4 p-4 shadow-sm" aria-labelledby="game-gallery-title">
                            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                                <h2 id="game-gallery-title" className="fw-bold fs-5 mb-0">Outras imagens</h2>
                                <span className="small text-body-secondary">Opcional</span>
                            </div>

                            {images.length === 0 && (
                                <div className="d-flex align-items-center gap-3 text-body-secondary mb-4">
                                    <ImagePlus size={24} strokeWidth={1.5} className="flex-shrink-0" aria-hidden="true" />
                                    <p className="small mb-0">Adicione imagens para a galeria do jogo.</p>
                                </div>
                            )}

                            <div className="d-flex flex-column gap-3">
                                {images.map((image, index) => (
                                    <div key={image.id}>
                                        <label htmlFor={`game-screenshot-${image.id}`} className="form-label small fw-semibold">Imagem {index + 1}</label>
                                        <div className="d-flex align-items-start gap-2">
                                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                <input
                                                    id={`game-screenshot-${image.id}`}
                                                    name="screenshots"
                                                    type="url"
                                                    placeholder="https://site.com/imagem.jpg"
                                                    value={image.url}
                                                    onChange={(event) => {
                                                        setImages((previous) => previous.map((entry) => entry.id === image.id ? { ...entry, url: event.target.value } : entry));
                                                        clearFeedback();
                                                    }}
                                                    onBlur={() => markTouched(`screenshot-${image.id}`)}
                                                    className={`form-control bg-body text-body rounded-3 py-2 ${isInvalid(`screenshot-${image.id}`) ? 'is-invalid' : ''}`}
                                                    aria-invalid={isInvalid(`screenshot-${image.id}`)}
                                                    aria-describedby={isInvalid(`screenshot-${image.id}`) ? `game-screenshot-${image.id}-error` : undefined}
                                                />
                                                {renderError(`screenshot-${image.id}`)}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn text-body-secondary border border-body-subtle rounded-3 py-2 d-inline-flex align-items-center justify-content-center"
                                                onClick={() => {
                                                    setImages((previous) => previous.filter((entry) => entry.id !== image.id));
                                                    clearFeedback();
                                                }}
                                                aria-label={`Remover imagem ${index + 1}`}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className={`btn rounded-3 d-inline-flex align-items-center gap-2 px-3 py-2 ${images.length ? 'mt-3' : ''}`}
                                style={{ color: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
                                onClick={() => {
                                    const id = nextImageId.current++;
                                    setImages((previous) => [...previous, { id, url: '' }]);
                                    clearFeedback();
                                }}
                            >
                                <Plus size={16} aria-hidden="true" />
                                Adicionar imagem
                            </button>
                        </section>

                        <section className="bg-body-tertiary border border-body-subtle rounded-4 p-4 shadow-sm" aria-labelledby="game-price-title">
                            <h2 id="game-price-title" className="fw-bold fs-5 mb-4">Preço</h2>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6">
                                    <label htmlFor="game-price" className="form-label small fw-semibold">Preço de venda <span aria-hidden="true">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-body text-body-secondary">R$</span>
                                        <input
                                            id="game-price"
                                            name="price"
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0,00"
                                            value={fields.price}
                                            onChange={(event) => updateField('price', event.target.value)}
                                            onBlur={() => markTouched('price')}
                                            className={`form-control bg-body text-body py-2 ${isInvalid('price') ? 'is-invalid' : ''}`}
                                            aria-invalid={isInvalid('price')}
                                            aria-describedby={isInvalid('price') ? 'game-price-error' : undefined}
                                            required
                                        />
                                    </div>
                                    {renderError('price')}
                                </div>
                            </div>
                            <p className="small text-body-secondary mt-3 mb-0">Os descontos são definidos pela loja.</p>
                        </section>

                        {submitError && <div className="alert alert-danger small mb-0" role="alert">{submitError}</div>}

                        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-end gap-3">
                            {notice && <p className="small text-body-secondary mb-0 me-sm-auto" role="status">{notice}</p>}
                            <button
                                type="submit"
                                className="btn text-white fw-semibold rounded-3 px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 buy-btn-hover"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                <ArrowRight size={17} aria-hidden="true" />
                                {isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Publicar jogo'}
                            </button>
                        </div>
                    </fieldset>
                </div>

                <aside className={`col-12 col-lg-4 ${styles.preview}`} aria-labelledby="game-preview-title">
                    <div className="bg-body-tertiary border border-body-subtle rounded-4 p-4 shadow-sm">
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                            <h2 id="game-preview-title" className="fw-bold fs-6 mb-0">Prévia na loja</h2>
                            <Eye size={18} className="text-body-secondary" aria-hidden="true" />
                        </div>

                        <GameImage src={fields.imageUrl.trim()} alt={fields.name || 'Capa do jogo'} />

                        {gallery.length > 0 && (
                            <div className="row g-2 mt-1">
                                {gallery.slice(0, 3).map((image, index) => (
                                    <div key={image.id} className="col-4">
                                        <GameImage src={image.url.trim()} alt={`Imagem ${index + 1} do jogo`} compact />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            {selectedCategories.map((category) => (
                                <span key={category.id} className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>
                                    {category.name}
                                </span>
                            ))}
                        </div>

                        <h3 className="fw-bold fs-4 text-break mt-3 mb-2">{fields.name.trim() || 'Nome do jogo'}</h3>
                        <p className="text-body-secondary small text-break mb-4" style={{ lineHeight: 1.7 }}>
                            {fields.description.trim() || 'A descrição curta aparecerá aqui.'}
                        </p>
                        <p className="text-body-secondary small text-break mb-4">{publisherName}</p>

                        <div className="border-top border-body-subtle pt-3">
                            {discount > 0 && (
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="text-body-secondary text-decoration-line-through small">{formatCurrency(price)}</span>
                                    <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}>-{discount}%</span>
                                </div>
                            )}
                            <span className="fw-bold fs-3">{formatCurrency(finalPrice)}</span>
                        </div>
                    </div>
                </aside>
            </form>
        </>
    );
}
