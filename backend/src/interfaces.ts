
export type TLang = 'en' | 'ru'

export type TLangText = {
    [key in TLang]: string
}

export type TId = string

export interface ICatalogItem { //one category name
    name: TLangText
    total: number //total amount of products in category
    active: number //amount of active products in category
    _id: TId
}


export interface IImage {
    sizeName: string
    size: {
        h: number
        w: number
    }
    path: string
}


export interface ISizesItem {
    h: number
    w: number
}

export interface IImageSizes {
    thumb: ISizesItem
    preview: ISizesItem
    extraSmall:ISizesItem
    small: ISizesItem
    medium: ISizesItem
    large: ISizesItem
    extraLarge: ISizesItem
    huge: ISizesItem
    full: ISizesItem
    carouselMaxFull: ISizesItem
    carouselMaxMedium: ISizesItem
    carouselMaxSmall: ISizesItem
}

export type TImageSizes = keyof IImageSizes

export interface IImageSubFolder {
    subFolder: TImageSizes,
    h: number
    w: number
}

export interface IImages {
    basePath: string
    files: string[]
    sizes: IImageSubFolder[]
}