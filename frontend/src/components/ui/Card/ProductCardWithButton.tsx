import React from 'react'
import type { ICardWithImageProps } from './Card.types'

function ProductCardWithButton({ title, description, imageUrl, price, onView, onAction, tag, children }: ICardWithImageProps) {
    const src = imageUrl || '/images/bg2.jpg';
    const excerpt = (description || '').length > 120 ? (description || '').slice(0, 120).trim() + '…' : description || '';
    return (
        <React.Fragment>
            <article className="transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl p-2 sm:p-2 md:p-3 rounded-2xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-lg md:shadow-xl shadow-gray-400 overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-700">
                <div className="w-full h-28 sm:h-32 md:h-40 lg:h-44 overflow-hidden rounded-xl sm:rounded-xl md:rounded-2xl bg-gray-100 dark:bg-slate-800">
                    <img src={src} alt={title} className='w-full h-full object-cover' />
                </div>
                <div className='py-2 sm:py-2 md:py-3 flex flex-col'>
                    <div className='mb-2 sm:mb-2 md:mb-3'>
                        <h2 className='text-base sm:text-base md:text-lg font-semibold mb-1 text-slate-900 dark:text-white line-clamp-2'>{title}</h2>
                        {tag && (
                            <span className='inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                                {tag}
                            </span>
                        )}
                    </div>
                    <p className='text-xs sm:text-xs md:text-sm text-gray-600 dark:text-slate-300 mb-3 sm:mb-3 md:mb-4 line-clamp-2'>
                        {excerpt}
                        {(description || '').length > 120 && onView && (
                            <button type="button" onClick={onView} className="ml-2 text-emerald-600 hover:underline font-semibold">Voir</button>
                        )}
                    </p>
                    {children}
                    <div className='flex flex-col bg-slate-300/5 shadow  rounded-2xl sm:flex-col md:flex-row justify-between items-center sm:items-start md:items-center gap-2 sm:gap-2 md:gap-3 mt-3 sm:mt-3 md:mt-4'>
                        <div className='px-5'>
                            
                            <span className='font-extrabold text-lg sm:text-lg md:text-xl text-slate-900 dark:text-white'>{price?.toFixed(2)} €</span>
                        </div>
                        <div className='flex flex-col sm:flex-col md:flex-row gap-2 w-full md:w-auto'>
                            {onView && (
                                <button type='button' onClick={onView} className='flex-1 text-gray-50 md:flex-initial px-3 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-slate-600 border border-slate-200 rounded-lg sm:rounded-lg md:rounded-2xl text-xs sm:text-xs md:text-sm font-semibold hover:bg-emerald-50'>Voir</button>
                            )}
                            {onAction && (
                                <button type='button' onClick={onAction} className='flex-1 md:flex-initial px-3 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-emerald-600 text-white rounded-lg sm:rounded-lg md:rounded-xl text-xs sm:text-xs md:text-sm font-semibold hover:bg-emerald-700 shadow'>Ajouter</button>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </React.Fragment>
    )
}

export default ProductCardWithButton
