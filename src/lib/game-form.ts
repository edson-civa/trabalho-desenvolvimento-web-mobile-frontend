export interface GameFormValues {
    name: string;
    imageUrl: string;
    description: string;
    longDescription: string;
    categoryIds: number[];
    price: number;
    currentDiscount: number;
    screenshots: string[];
}

export interface GameFormFields {
    name: string;
    imageUrl: string;
    description: string;
    longDescription: string;
    categoryIds: number[];
    price: string;
    currentDiscount: string;
}

export interface GalleryImageField {
    id: number;
    url: string;
}

export function isImageUrl(value: string): boolean {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function parseDecimal(value: string): number {
    return Number(value.trim().replace(',', '.'));
}

export function validateGameForm(fields: GameFormFields, images: GalleryImageField[], availableCategoryIds: number[]): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!fields.imageUrl.trim()) errors.imageUrl = 'Informe a URL da capa.';
    else if (!isImageUrl(fields.imageUrl)) errors.imageUrl = 'Use uma URL começando com http:// ou https://.';

    if (!fields.name.trim()) errors.name = 'Informe o nome do jogo.';
    else if (fields.name.trim().length > 150) errors.name = 'Use até 150 caracteres.';

    if (!fields.categoryIds.length) errors.categoryIds = 'Selecione pelo menos um gênero.';
    else if (fields.categoryIds.some((id) => !availableCategoryIds.includes(id))) errors.categoryIds = 'Selecione os gêneros disponíveis na lista.';

    if (!fields.description.trim()) errors.description = 'Escreva uma descrição curta.';
    else if (fields.description.length > 500) errors.description = 'Use até 500 caracteres.';

    if (!fields.longDescription.trim()) errors.longDescription = 'Escreva a descrição completa.';
    else if (fields.longDescription.length > 10000) errors.longDescription = 'Use até 10.000 caracteres.';

    images.forEach((image) => {
        if (image.url.trim() && !isImageUrl(image.url)) errors[`screenshot-${image.id}`] = 'Informe uma URL válida ou remova esta imagem.';
    });

    if (!/^\d+(?:[.,]\d{1,2})?$/.test(fields.price.trim()) || !Number.isFinite(parseDecimal(fields.price))) {
        errors.price = 'Informe um preço válido, como 59,90.';
    }

    if (fields.currentDiscount.trim() && (
        !/^\d+(?:[.,]\d{1,2})?$/.test(fields.currentDiscount.trim())
        || !Number.isFinite(parseDecimal(fields.currentDiscount))
        || parseDecimal(fields.currentDiscount) > 100
    )) {
        errors.currentDiscount = 'Use um desconto entre 0 e 100%.';
    }

    return errors;
}

export function getGameFormValues(fields: GameFormFields, images: GalleryImageField[]): GameFormValues {
    return {
        name: fields.name.trim(),
        imageUrl: fields.imageUrl.trim(),
        description: fields.description.trim(),
        longDescription: fields.longDescription.trim(),
        categoryIds: [...new Set(fields.categoryIds)],
        price: parseDecimal(fields.price),
        currentDiscount: fields.currentDiscount.trim() ? parseDecimal(fields.currentDiscount) : 0,
        screenshots: images.map((image) => image.url.trim()).filter(Boolean),
    };
}
