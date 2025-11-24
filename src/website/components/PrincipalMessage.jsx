import { User } from 'lucide-react';

const PrincipalMessage = ({ type = 'principal' }) => {
  const isPrincipal = type === 'principal';
  const title = isPrincipal ? 'Principal\'s Message' : 'Rector\'s Message';
  const name = isPrincipal ? 'Dr. John Smith' : 'Rev. Michael Johnson';
  const role = isPrincipal ? 'Principal' : 'Rector';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-blue-600 font-semibold">{name}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">
        It is with great pleasure that I welcome you to our school. We are committed to providing
        a nurturing environment where students can grow academically, socially, and personally.
        Our dedicated team of educators works tirelessly to ensure that every student reaches their
        full potential.
      </p>
      <p className="text-gray-700 leading-relaxed">
        We believe in fostering a love for learning, encouraging critical thinking, and developing
        well-rounded individuals who will make a positive impact on society. Thank you for being
        part of our educational journey.
      </p>
    </div>
  );
};

export default PrincipalMessage;

