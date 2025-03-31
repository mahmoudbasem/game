import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="mr-2 text-2xl font-gaming text-primary flex items-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
              GameCharge
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6 rtl:space-x-reverse">
          <Link href="/">
            <div className="hover:text-primary transition-colors cursor-pointer">الرئيسية</div>
          </Link>
          <Link href="/order">
            <div className="hover:text-primary transition-colors cursor-pointer">الألعاب</div>
          </Link>
          <Link href="/#howto">
            <div className="hover:text-primary transition-colors cursor-pointer">كيفية الشحن</div>
          </Link>
          <Link href="/#contact">
            <div className="hover:text-primary transition-colors cursor-pointer">تواصل معنا</div>
          </Link>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/profile">
                <Button variant="default" className="bg-primary hover:bg-primary-dark text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  الملف الشخصي
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="text-white hover:text-red-300"
                onClick={() => logout()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                خروج
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/login">
                <Button variant="default" className="bg-primary hover:bg-primary-dark text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  تسجيل الدخول
                </Button>
              </Link>
              
              <Link href="/register">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full">
                  تسجيل جديد
                </Button>
              </Link>
            </div>
          )}
          
          <button className="md:hidden text-2xl mr-4" onClick={toggleMobileMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden px-4 py-2 bg-gray-800 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <Link href="/">
          <div className="block py-2 hover:text-primary transition-colors cursor-pointer">الرئيسية</div>
        </Link>
        <Link href="/order">
          <div className="block py-2 hover:text-primary transition-colors cursor-pointer">الألعاب</div>
        </Link>
        <Link href="/#howto">
          <div className="block py-2 hover:text-primary transition-colors cursor-pointer">كيفية الشحن</div>
        </Link>
        <Link href="/#contact">
          <div className="block py-2 hover:text-primary transition-colors cursor-pointer">تواصل معنا</div>
        </Link>
        
        {user ? (
          <>
            <Link href="/profile">
              <div className="block py-2 hover:text-primary transition-colors cursor-pointer">الملف الشخصي</div>
            </Link>
            <div 
              className="block py-2 hover:text-red-300 transition-colors cursor-pointer"
              onClick={() => logout()}
            >
              تسجيل الخروج
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <div className="block py-2 hover:text-primary transition-colors cursor-pointer">تسجيل الدخول</div>
            </Link>
            <Link href="/register">
              <div className="block py-2 hover:text-primary transition-colors cursor-pointer">حساب جديد</div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
