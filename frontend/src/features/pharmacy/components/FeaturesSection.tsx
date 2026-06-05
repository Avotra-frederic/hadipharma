import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import SectionHeader from "../../../components/ui/Header/SectionHeader"
import { useFeatured } from "../hooks/useFeatured"
import FeaturedCard from "./ui/FeaturedCard";

function FeaturesSection() {
    const { data, isLoading } = useFeatured();

    return (
        <section className='py-16 px-4 md:px-16'>
            <div className="mb-12">
                <SectionHeader title={'Popular pharmacy'} link={'/pharmacies'} />
            </div>
            {!isLoading && data.length > 0 && (
                <Swiper
                    modules={[FreeMode, Autoplay]}
                    freeMode={true}
                    autoplay={{ delay: 4000, disableOnInteraction: true }}
                    spaceBetween={12}
                    slidesPerView="auto"
                    // className="w-full"
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