import { Link } from 'wouter';
import MainLayout from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Game } from '@shared/schema';

export default function Home() {
  const { data: games, isLoading } = useQuery({ 
    queryKey: ['/api/games'],
  });

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">أفضل خدمة شحن ألعاب فورية</h1>
            <p className="text-lg mb-8">نقدم لك خدمة شحن سريعة وآمنة لجميع الألعاب الشهيرة بأفضل الأسعار</p>
            <Link href="/order">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors animate-pulse">
                اشحن الآن
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">الألعاب المتوفرة</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : (
            games?.map((game: Game) => (
              <div key={game.id} className="game-card bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                <img src={game.imageUrl} alt={game.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-gaming text-lg font-semibold">{game.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                  <Link href="/order">
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded transition-colors">
                      اشحن الآن
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 text-white py-16" id="howto">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار خدمتنا؟</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">سرعة التنفيذ</h3>
              <p className="text-gray-300">نقوم بتنفيذ طلبات الشحن بسرعة فائقة فور استلام الدفع والتأكد منه.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">أمان كامل</h3>
              <p className="text-gray-300">نضمن لك أمان بياناتك وحساباتك، ونستخدم طرق دفع آمنة وموثوقة.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">دعم متواصل</h3>
              <p className="text-gray-300">فريق خدمة العملاء متاح على مدار الساعة للرد على استفساراتك وحل أي مشكلة.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How To Section */}
      <div className="container mx-auto px-4 py-16" id="faq">
        <h2 className="text-3xl font-bold text-center mb-12">كيفية شحن حسابك</h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-start mb-12">
            <div className="flex-shrink-0 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">اختر اللعبة وقيمة الشحن</h3>
              <p className="text-gray-600">قم باختيار اللعبة التي تريد شحن حسابك فيها، ثم اختر قيمة الشحن المناسبة لك من الفئات المتوفرة.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start mb-12">
            <div className="flex-shrink-0 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">أدخل بيانات حسابك</h3>
              <p className="text-gray-600">قم بإدخال معرف اللاعب أو رقم الحساب، ورقم هاتفك حتى نتمكن من التواصل معك.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start mb-12">
            <div className="flex-shrink-0 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">اختر طريقة الدفع</h3>
              <p className="text-gray-600">نوفر لك عدة طرق للدفع مثل فودافون كاش وانستا باي والتحويل البنكي. اختر الطريقة المناسبة لك وقم بالدفع.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start">
            <div className="flex-shrink-0 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">استلم الشحن</h3>
              <p className="text-gray-600">بعد التأكد من الدفع، سنقوم بشحن حسابك مباشرة وإرسال تأكيد لك على رقم هاتفك.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/order">
            <Button className="bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-lg transition-colors">
              ابدأ الشحن الآن
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
