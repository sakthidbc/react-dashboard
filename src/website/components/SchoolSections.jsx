import { Library, Microscope, Music, Paintbrush, Dumbbell, Laptop } from 'lucide-react';

const SchoolSections = () => {
  const sections = [
    {
      icon: Library,
      title: 'Library',
      description: 'Extensive collection of books and digital resources',
      color: 'blue',
    },
    {
      icon: Microscope,
      title: 'Science Lab',
      description: 'Fully equipped laboratories for hands-on learning',
      color: 'green',
    },
    {
      icon: Music,
      title: 'Music Room',
      description: 'Dedicated space for music education and practice',
      color: 'purple',
    },
    {
      icon: Paintbrush,
      title: 'Art Studio',
      description: 'Creative space for artistic expression',
      color: 'pink',
    },
    {
      icon: Dumbbell,
      title: 'Sports Complex',
      description: 'State-of-the-art sports facilities',
      color: 'orange',
    },
    {
      icon: Laptop,
      title: 'Computer Lab',
      description: 'Modern technology for digital learning',
      color: 'indigo',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className={`${colorClasses[section.color]} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600">{section.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchoolSections;

