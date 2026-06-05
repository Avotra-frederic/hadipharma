import React from 'react'
import type { ICardWithImageProps } from './Card.types'
import { Link } from 'react-router-dom'

function CardWithImage({ title, openHours, imageUrl, visitLink }: ICardWithImageProps) {
    const src = imageUrl || '/images/bg2.jpg';
    return (
        <React.Fragment>
            <article className="p-3 rounded-3xl shadow-xl shadow-gray-400 overflow-hidden bg-white dark:bg-slate-900 dark:border dark:border-slate-700">
                <div className="w-full h-44 overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
                    <img src={src} alt={title} className='w-full h-full object-cover' />
                </div>
                <div className='py-3 flex flex-col'>
                    <h2 className='text-lg font-semibold mb-1 text-slate-900 dark:text-white'>{title}</h2>
                    <p className='text-sm text-gray-600 dark:text-slate-300 mb-4'>Open Hours: {openHours || 'N/A'}</p>
                    <Link to={visitLink || '#'} className='px-14 py-3 bg-blue-500 text-center rounded-full mt-5 mx-5 shadow-xl shadow-blue-500/45 text-white'>Visit</Link>
                </div>
            </article>
        </React.Fragment>
    )
}

export default CardWithImage