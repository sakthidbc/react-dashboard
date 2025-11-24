import { Outlet } from 'react-router-dom';
import WebsiteTopbar from './components/WebsiteTopbar';
import WebsiteNavbar from './components/WebsiteNavbar';
import WebsiteFooter from './components/WebsiteFooter';

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <WebsiteTopbar />
      <WebsiteNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <WebsiteFooter />
    </div>
  );
};

export default WebsiteLayout;

