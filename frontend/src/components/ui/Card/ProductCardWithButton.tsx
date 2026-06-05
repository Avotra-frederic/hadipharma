import React from 'react'
import type { ICardWithImageProps } from './Card.types'
import { LiaShoppingCartSolid } from 'react-icons/lia'

function ProductCardWithButton({ title, description, imageUrl, price, onClick, tag, children }: ICardWithImageProps) {
    const src = imageUrl || '/images/bg2.jpg';
    return (
        <React.Fragment>
            <article className="transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl p-3 rounded-3xl shadow-xl shadow-gray-400 overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-700">
                <div className="w-full h-44 overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
                    <img src={src} alt={title} className='w-full h-full object-cover' />
                </div>
                <div className='py-3 flex flex-col'>
                    <div className='mb-3'>
                        <h2 className='text-lg font-semibold mb-1 text-slate-900 dark:text-white'>{title}</h2>
                        {tag && (
                            <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                                {tag}
                            </span>
                        )}
                    </div>
                    <p className='text-sm text-gray-600 dark:text-slate-300 mb-4'>{description}</p>
                    {children}
                    <div className='flex justify-between items-center rounded-full mt-5 px-5 py-2 bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl shadow-2xl border border-slate-100 dark:border-slate-700'>
                        <div className='flex flex-col justify-center'>
                            <span className='text-slate-700 dark:text-slate-300'>Prix :</span>
                            <span className='font-bold text-lg text-slate-900 dark:text-white'>{price?.toFixed(2)} Ar</span>
                        </div>
                        <button type='button' onClick={onClick} className='px-10 py-3 bg-slate-200 dark:bg-slate-700 text-center rounded-full shadow-xl text-slate-700 dark:text-slate-200'>
                            <LiaShoppingCartSolid size={30} />
                        </button>
                    </div>
                </div>
            </article>
        </React.Fragment>
    )
}

export default ProductCardWithButton