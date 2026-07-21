import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import SectionHeader from "../../../components/ui/Header/SectionHeader"
import { useFeatured } from "../hooks/useFeatured"
import FeaturedCard from "./ui/FeaturedCard";

function FeaturesSection() {
    const { data, isLoading } = useFeatured();

    return (
        <section className='py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-8 lg:px-16'>
            <div className="mb-8 sm:mb-10 md:mb-12">
                <SectionHeader title={'Pharmacies populaires'} link={'/pharmacies'} />
            </div>
            {!isLoading && data.length > 0 && (
                <Swiper
                    modules={[FreeMode, Autoplay]}
                    freeMode={true}
                    autoplay={{ delay: 4000, disableOnInteraction: true }}
                    spaceBetween={8}
                    slidesPerView="auto"
                  >
                    {data.map((p) => (
                      <SwiperSlide key={p._id} style={{ width: 'auto' }}>
                            <FeaturedCard pharmacy={p} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    )
}

export default FeaturesSection