import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  MessageSquareText, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Download
} from 'lucide-react';

let globalDeferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  globalDeferredPrompt = e;
  window.dispatchEvent(new Event('deferredPromptReady'));
});

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);

  useEffect(() => {
    const handleReady = () => setDeferredPrompt(globalDeferredPrompt);
    if (globalDeferredPrompt) setDeferredPrompt(globalDeferredPrompt);
    window.addEventListener('deferredPromptReady', handleReady);
    return () => window.removeEventListener('deferredPromptReady', handleReady);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
    { name: 'AI Insights', href: '/ai-insights', icon: MessageSquareText },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-surface border-r border-border pt-5 pb-4">
          <div className="flex items-center justify-between px-4">
            <span className="text-2xl font-bold text-primary">FinSight</span>
            <button onClick={() => setSidebarOpen(false)} className="text-muted-text hover:text-text">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8 flex-1 space-y-2 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-primary text-surface'
                      : 'text-text hover:bg-border hover:text-primary'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-4 h-6 w-6 ${location.pathname === item.href ? 'text-surface' : 'text-muted-text'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-surface border-r border-border pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-3xl font-bold text-primary">FinSight</span>
          </div>
          <nav className="mt-8 flex-1 space-y-2 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-primary text-surface'
                      : 'text-text hover:bg-border hover:text-primary'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${location.pathname === item.href ? 'text-surface' : 'text-muted-text'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:bg-border/50 p-2 rounded-lg transition-colors -mx-2" onClick={() => setProfileModalOpen(true)}>
              <div className="flex items-center overflow-hidden">
                <div className="ml-1 truncate">
                  <p className="text-sm font-medium text-text truncate">{user?.name}</p>
                  <p className="text-xs font-medium text-muted-text truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="ml-2 flex-shrink-0 p-2 text-error rounded-md hover:bg-error/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:pl-64 h-screen">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-surface border-b border-border lg:bg-transparent lg:border-none pt-2 lg:pt-4">
          <button
            type="button"
            className="border-r border-border px-4 text-muted-text focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4 lg:justify-end pr-4 lg:pr-8">
            <span className="text-xl font-semibold text-primary lg:hidden">FinSight</span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-text rounded-full hover:bg-border transition-colors shadow-sm bg-surface border border-border"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="p-2 text-primary rounded-full hover:bg-primary/10 transition-colors shadow-sm bg-surface border border-border flex items-center justify-center"
                  title="Install App"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-auto bg-background">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
    </div>
  );
}
