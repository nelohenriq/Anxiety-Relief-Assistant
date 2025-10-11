import React from 'react';

interface CalmImageProps {
    imageUrl: string | null;
    isLoading: boolean;
}

/**
 * A React functional component that displays a calming image based on the provided `imageUrl`.
 * It includes a skeleton loader while the image is loading.
 *
 * @component
 * @param {object} props - The props object for the component.
 * @param {string | undefined} props.imageUrl - The URL of the image to display. If not provided, the skeleton loader is shown.
 * @param {boolean} props.isLoading - A flag indicating whether the image is currently loading.
 *
 * @returns {JSX.Element} A styled container with a title, an image, or a skeleton loader.
 */
const CalmImage: React.FC<CalmImageProps> = ({ imageUrl, isLoading }) => {
    return (
        <div className="w-full mt-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-neutral-800 dark:text-neutral-100 mb-4">A Visual for Your Calm</h2>
            <div className="relative aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden border border-neutral-300 dark:border-neutral-700">
                {/* Skeleton Loader */}
                {(isLoading && !imageUrl) && (
                    <div className="w-full h-full bg-neutral-300 dark:bg-neutral-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer"></div>
                    </div>
                )}
                
                {/* Image */}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="A calming, AI-generated image based on your feelings."
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        </div>
    );
};

export default CalmImage;
