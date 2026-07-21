import React, { useState } from 'react';
import { LiaStarSolid } from 'react-icons/lia';
import { useToast } from '../../../features/ui/toast';

interface RatePharmacyProps {
  pharmacyId: string;
  onRatingSubmitted?: () => void;
}

const RatePharmacy: React.FC<RatePharmacyProps> = ({ pharmacyId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Veuillez sélectionner une note', 'warning');
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/rating`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la note');
      }

      showToast('Merci pour votre évaluation !', 'success');
      setRating(0);
      setReview('');
      onRatingSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast(error instanceof Error ? error.message : 'Erreur lors de la soumission', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-lg md:rounded-lg shadow-md">
      <h3 className="text-base sm:text-base md:text-lg font-semibold mb-3 sm:mb-3 md:mb-4">Évaluer cette pharmacie</h3>

      <form onSubmit={handleSubmitRating}>
        {/* Star Rating */}
        <div className="mb-4 sm:mb-4 md:mb-4">
          <label className="block text-xs sm:text-xs md:text-sm font-medium mb-2">Note</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-colors"
              >
                <LiaStarSolid
                  size={24}
                  className={
                    (hoveredRating || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Votre note: {rating}/5
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-4">
          <label htmlFor="review" className="block text-xs sm:text-xs md:text-sm font-medium mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{review.length}/500</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:py-2 sm:px-3 md:py-2 md:px-4 rounded-md transition-colors text-xs sm:text-xs md:text-sm"
        >
          {loading ? 'Envoi en cours...' : 'Soumettre'}
        </button>
      </form>
    </div>
  );
};

export default RatePharmacy;
