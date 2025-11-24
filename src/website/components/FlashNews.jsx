import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const FlashNews = () => {
  const [currentNews, setCurrentNews] = useState(0);
  const news = [
    'New Admissions Open for Academic Year 2024-2025',
    'Annual Sports Day scheduled for next month',
    'Parent-Teacher Meeting on Saturday',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [news.length]);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 text-white">
          <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-scroll">
              {news.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full text-center font-semibold"
                  style={{ transform: `translateX(-${currentNews * 100}%)` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashNews;

