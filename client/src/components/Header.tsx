import { Leaf, ChevronDown, LogOut } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { UserSwitcher } from './UserSwitcher';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
          <Leaf className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900">
          {t('header.appName')}
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">{user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <UserSwitcher />
        
        <div className="relative">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
            className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="mr">मर</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </header>
  );
}
