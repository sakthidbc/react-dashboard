import { useEffect, useState } from 'react';
import Slider from '../components/Slider';
import FlashNews from '../components/FlashNews';
import WelcomeSection from '../components/WelcomeSection';
import PrincipalMessage from '../components/PrincipalMessage';
import NewsEvents from '../components/NewsEvents';
import CountSection from '../components/CountSection';
import SchoolSections from '../components/SchoolSections';
import { getActiveSliderImages } from '../../services/apiService';

const Home = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getActiveSliderImages();
      setSliders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
      setSliders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!loading && <Slider sliders={sliders} />}
      {loading && (
        <div className="h-[70vh] min-h-[500px] bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      )}
      <FlashNews />
      <WelcomeSection />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PrincipalMessage />
          <PrincipalMessage type="rector" />
        </div>
      </div>
      <NewsEvents />
      <CountSection />
      <SchoolSections />
    </div>
  );
};

export default Home;
