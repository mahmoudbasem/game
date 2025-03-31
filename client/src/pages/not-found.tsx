import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MainLayout from "@/components/layouts/main-layout";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">404</h1>
              <h2 className="text-xl font-semibold text-gray-700 mt-2">الصفحة غير موجودة</h2>
            </div>

            <p className="my-4 text-center text-gray-600">
              يبدو أن الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
            </p>

            <div className="flex justify-center mt-6">
              <Link href="/">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
