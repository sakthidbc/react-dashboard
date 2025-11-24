import { useState, useEffect, useRef, useMemo } from 'react';
import { Users, GraduationCap, Award, BookOpen } from 'lucide-react';

const CountSection = () => {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, awards: 0, courses: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const targets = useMemo(() => ({ students: 2500, teachers: 150, awards: 500, courses: 50 }), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, targets]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers = [];

    Object.keys(targets).forEach((key) => {
      let current = 0;
      const increment = targets[key] / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targets[key]) {
          setCounts((prev) => ({ ...prev, [key]: targets[key] }));
          clearInterval(timer);
        } else {
          setCounts((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, stepDuration);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, targets]);

  const stats = [
    { icon: Users, label: 'Students', count: counts.students, color: 'blue' },
    { icon: GraduationCap, label: 'Teachers', count: counts.teachers, color: 'green' },
    { icon: Award, label: 'Awards', count: counts.awards, color: 'yellow' },
    { icon: BookOpen, label: 'Courses', count: counts.courses, color: 'purple' },
  ];

  return (
    <div ref={sectionRef} className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-10 h-10" />
                </div>
                <div className="text-5xl font-bold mb-2">{stat.count}+</div>
                <div className="text-xl">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CountSection;

