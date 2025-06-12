import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ 
  images = [], 
  autoAdvanceTime = 20000, 
  showDots = true, 
  className = '',
  onImageClick = null,
  maxImages = 8 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Limit images to maxImages
  const limitedImages = images.slice(0, maxImages);

  // Auto-advance functionality
  useEffect(() => {
    if (!isAutoPlaying || limitedImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % limitedImages.length);
    }, autoAdvanceTime);

    return () => clearInterval(interval);
  }, [isAutoPlaying, limitedImages.length, autoAdvanceTime]);

  // Reset index if images change
  useEffect(() => {
    if (currentIndex >= limitedImages.length && limitedImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [limitedImages.length, currentIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? limitedImages.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % limitedImages.length;
    goToSlide(newIndex);
  };

  if (limitedImages.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <p>No images uploaded</p>
          <p className="text-sm">Upload PNG images to view carousel</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Main Image Display */}
      <div className="relative w-full h-full">
        {limitedImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src || image.preview || image.dataUrl}
              alt={image.alt || `Carousel image ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onImageClick && onImageClick(image, index)}
              onError={(e) => {
                console.error('Failed to load carousel image:', image);
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {limitedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {limitedImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {limitedImages.length}
          </div>
        )}

        {/* Auto-play indicator */}
        {limitedImages.length > 1 && isAutoPlaying && (
          <div className="absolute top-4 left-4 bg-green-500 bg-opacity-70 text-white px-2 py-1 rounded-full text-xs z-10 flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            AUTO
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {showDots && limitedImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {limitedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {limitedImages.length > 1 && isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-30 z-10">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % autoAdvanceTime) / autoAdvanceTime) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;