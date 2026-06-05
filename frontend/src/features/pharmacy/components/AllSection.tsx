import React from 'react'
import CardWithImage from '../../../components/ui/Card/CardWithImage'
import SectionHeader from '../../../components/ui/Header/SectionHeader'
import { useAllPharmacies } from '../hooks/useAllPharmacies';
import { getUploadImageUrl } from '../../../utils/image';

function AllSection() {
    const {isLoading, data} = useAllPharmacies();
  return (
    <React.Fragment>
        <section className='px-4 md:px-16 pb-16'>
                <div className="mb-12">
                    <SectionHeader title={'Subscribes pharmacy'} link={'/pharmacies'}/>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    data.map((pharmacy) => (
                        <CardWithImage
                            key={pharmacy._id}
                            title={pharmacy.name}
                            openHours={pharmacy.openHours}
                            imageUrl={pharmacy.photo ? getUploadImageUrl(pharmacy.photo) : '/images/bg2.jpg'}
                            visitLink={`/pharmacy/${pharmacy._id}`}
                        />
                    ))
                )}
                </div>
            </section>
    </React.Fragment>
  )
}

export default AllSection