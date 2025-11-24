import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const NewsEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = [
    {
      type: 'news',
      title: 'Annual Science Fair 2024',
      date: 'March 15, 2024',
      description: 'Students showcase innovative science projects',
      image: 'https://via.placeholder.com/400x250?text=Science+Fair',
    },
    {
      type: 'event',
      title: 'Sports Day Celebration',
      date: 'March 20, 2024',
      description: 'Join us for a day of fun and competition',
      image: 'https://via.placeholder.com/400x250?text=Sports+Day',
    },
    {
      type: 'news',
      title: 'New Library Opens',
      date: 'March 10, 2024',
      description: 'State-of-the-art library facility now available',
      image: 'https://via.placeholder.com/400x250?text=Library',
    },
    {
      type: 'event',
      title: 'Cultural Festival',
      date: 'March 25, 2024',
      description: 'Celebrating diversity and culture',
      image: 'https://via.placeholder.com/400x250?text=Cultural+Festival',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">News & Events</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {items.map((item, index) => (
                <div key={index} className="min-w-full">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
                    <div className="p-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                          item.type === 'news'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.type === 'news' ? 'News' : 'Event'}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <div className="flex items-center gap-4 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsEvents;

