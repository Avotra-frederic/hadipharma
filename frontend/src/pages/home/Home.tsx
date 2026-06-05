import React from 'react'
import { LiaArrowRightSolid, } from 'react-icons/lia'
import { Link } from 'react-router-dom'
import SearchBar from '../../components/widgets/SearchBar'
import FeaturesSection from '../../features/pharmacy/components/FeaturesSection'
import NearbySection from '../../features/pharmacy/components/NearbySection'
import AllSection from '../../features/pharmacy/components/AllSection'

function Home() {
    return (
        <React.Fragment>


            <section className='h-[40vh] md:h-[80vh] bg-[#053229] bg-[url("/images/bg1.jpg")] bg-cover bg-center bg-blend-soft-light rounded-bl-[3rem] md:rounded-bl-[6rem] rounded-br-[3rem] md:rounded-br-[6rem] relative'>
                <div className="container mx-auto h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                        <div className='h-full flex flex-col justify-center text-white px-4 md:px-0'>
                            <h1 className='text-4xl md:text-8xl mb-3'>Welcome to Hadipharma</h1>
                            <p className='text-sm md:text-base'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus, repellat.</p>
                        </div>
                    </div>
                </div>

                <div className=" absolute w-full px-4 md:px-16 -bottom-10">
                    <SearchBar />
                </div>
            </section>

            <FeaturesSection />

            <NearbySection />


            <section className='p-4 md:p-16'>
                <div className="h-80 md:h-140 bg-sky-700 rounded-2xl md:rounded-4xl">
                    <div className='w-full h-full flex flex-row items-center px-4 md:px-16 justify-between text-white py-8 md:py-0'>
                        <div className='text-left mb-6 md:mb-0'>
                            <h1 className='text-2xl md:text-5xl mb-3'>Register yours pharmacy</h1>
                            <p className='text-sm md:text-base'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi nulla doloremque</p>
                        </div>
                        <Link to={"/pharmacy/register"} className='bg-blue-500 px-4 md:px-5 py-3 md:py-5 rounded-full text-white animate-pulse'>
                            <LiaArrowRightSolid size={30} />
                        </Link>
                    </div>
                </div>
            </section>

            <AllSection />

        </React.Fragment>
    )
}

export default Home