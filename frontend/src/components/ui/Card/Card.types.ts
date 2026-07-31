import type { ReactNode } from 'react'

export interface ICardWithImageProps{
    title:string,
    description?:string,
    openHours?:string,
    imageUrl:string,
    id?:string,
    tag?:string,
    price?:number,
    visitLink?:string,
    onClick?:()=>void,
    onView?:()=>void,
    onAction?:()=>void,
    onFavorite?:()=>void,
    isFavorite?:boolean,
    children?: ReactNode

}
