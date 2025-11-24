import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WebsiteNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeChildSubmenu, setActiveChildSubmenu] = useState(null);

  const menuItems = [
    {
      label: 'Home',
      path: '/',
    },
    {
      label: 'About',
      path: '/about',
      submenu: [
        { label: 'Our History', path: '/about/history' },
        { label: 'Mission & Vision', path: '/about/mission' },
        { label: 'Leadership', path: '/about/leadership' },
      ],
    },
    {
      label: 'Academics',
      path: '/academics',
      submenu: [
        {
          label: 'Programs',
          path: '/academics/programs',
          childSubmenu: [
            { label: 'Elementary', path: '/academics/programs/elementary' },
            { label: 'Middle School', path: '/academics/programs/middle' },
            { label: 'High School', path: '/academics/programs/high' },
          ],
        },
        { label: 'Curriculum', path: '/academics/curriculum' },
        { label: 'Faculty', path: '/academics/faculty' },
      ],
    },
    {
      label: 'Admissions',
      path: '/admissions',
      submenu: [
        { label: 'Apply Now', path: '/admissions/apply' },
        { label: 'Requirements', path: '/admissions/requirements' },
        { label: 'Tuition', path: '/admissions/tuition' },
      ],
    },
    {
      label: 'News & Events',
      path: '/news',
    },
    {
      label: 'Contact',
      path: '/contact',
    },
  ];

  const handleMainMenuClick = (item) => {
    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.label ? null : item.label);
      setActiveChildSubmenu(null);
    } else {
      setIsMenuOpen(false);
      setActiveSubmenu(null);
      setActiveChildSubmenu(null);
    }
  };

  const handleSubmenuClick = (subItem) => {
    if (subItem.childSubmenu) {
      setActiveChildSubmenu(activeChildSubmenu === subItem.label ? null : subItem.label);
    } else {
      setIsMenuOpen(false);
      setActiveSubmenu(null);
      setActiveChildSubmenu(null);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg font-bold text-xl">
                School Logo
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    to={item.path}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-1"
                  >
                    {item.label}
                    {item.submenu && <ChevronRight className="w-4 h-4 rotate-90" />}
                  </Link>
                  {item.submenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <div key={subItem.label} className="relative group/sub">
                            <Link
                              to={subItem.path}
                              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                            >
                              {subItem.label}
                              {subItem.childSubmenu && <ChevronRight className="w-4 h-4" />}
                            </Link>
                            {subItem.childSubmenu && (
                              <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300">
                                <div className="py-2">
                                  {subItem.childSubmenu.map((childItem) => (
                                    <Link
                                      key={childItem.label}
                                      to={childItem.path}
                                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                      {childItem.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Offcanvas Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg font-bold">
                  Menu
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() => handleMainMenuClick(item)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    <Link to={item.path} onClick={() => !item.submenu && setIsMenuOpen(false)}>
                      {item.label}
                    </Link>
                    {item.submenu && (
                      <ChevronRight
                        className={`w-5 h-5 transition-transform ${activeSubmenu === item.label ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>
                  {item.submenu && activeSubmenu === item.label && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <div key={subItem.label}>
                          <button
                            onClick={() => handleSubmenuClick(subItem)}
                            className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Link to={subItem.path} onClick={() => !subItem.childSubmenu && setIsMenuOpen(false)}>
                              {subItem.label}
                            </Link>
                            {subItem.childSubmenu && (
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${activeChildSubmenu === subItem.label ? 'rotate-90' : ''}`}
                              />
                            )}
                          </button>
                          {subItem.childSubmenu && activeChildSubmenu === subItem.label && (
                            <div className="ml-4 mt-2 space-y-1">
                              {subItem.childSubmenu.map((childItem) => (
                                <Link
                                  key={childItem.label}
                                  to={childItem.path}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block px-4 py-2 text-gray-500 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {childItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WebsiteNavbar;

