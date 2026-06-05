import React from 'react'
import type { ICardWithImageProps } from './Card.types'
import { LiaShoppingCartSolid } from 'react-icons/lia'

function ProductCard({ title, imageUrl, price, tag = "" }: ICardWithImageProps) {
    return (
        <React.Fragment>
            <article className="rounded-3xl shadow-xl shadow-gray-400 relative bg-white dark:bg-slate-900 dark:border dark:border-slate-700 overflow-hidden">
                <img src={imageUrl} alt="" className='rounded-2xl h-full object-cover' />
                <div className='absolute w-full px-4 bottom-4'>
                    <div className='py-3 px-5 flex flex-col gap-1 rounded-xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl shadow-2xl border border-white/50 dark:border-slate-700'>
                        <h2 className='flex items-center justify-between'>
                            <span className='text-xl font-semibold text-slate-900 dark:text-white'>{title}</span>
                            <span className='text-slate-900 dark:text-white'>$ {price}</span>
                        </h2>
                        <p className='text-slate-700 dark:text-slate-300'>{tag}</p>
                    </div>
                </div>
                <div className='p-5 bg-white/70 dark:bg-slate-950/70 absolute top-2 right-2 text-gray-500 dark:text-slate-200 cursor-pointer rounded-full'>
                    <LiaShoppingCartSolid size={30}/>
                </div>
            </article>
        </React.Fragment>
    )
}

export default ProductCard