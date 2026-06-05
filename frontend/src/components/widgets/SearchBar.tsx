import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiaSearchSolid } from 'react-icons/lia'

function SearchBar() {
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmed = query.trim()
        navigate(trimmed ? `/pharmacies?q=${encodeURIComponent(trimmed)}` : '/pharmacies')
    }

    return (
        <React.Fragment>
            <form onSubmit={handleSubmit} className='w-full flex items-center bg-white dark:bg-slate-900 dark:border-gray-700 border border-slate-100 shadow-2xl rounded-full'>
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder='Rechercher une pharmacie, quartier, ville...'
                    className='w-full py-8 px-8 rounded-full outline-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                />
                <button type="submit" className='px-6 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-sky-700 transition-colors'>
                    <LiaSearchSolid size={30} />
                </button>
            </form>
        </React.Fragment>
    )
}

export default SearchBar