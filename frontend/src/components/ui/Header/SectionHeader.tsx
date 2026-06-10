import React from 'react'
import { Link } from 'react-router-dom'
import type { HearderProps } from './Header.types'

function SectionHeader({title,link}:HearderProps) {
    return (
        <React.Fragment>
            <div className='flex justify-between items-center'>
                <h1 className='text-xl font-bold'>{title}</h1>
                {link ? (
                  <Link to={link} className='text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors'>
                     Voir plus
                  </Link>
                ) : null}
            </div>
        </React.Fragment>
    )
}

export default SectionHeader