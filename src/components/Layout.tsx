import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { User } from "../types/auth";

interface LayoutProps {
  children: ReactNode;
}

const getUserRole = (grade: number): string => {
  switch (grade) {
    case 1:
      return "관리자";
    case 2:
      return "팀장";
    default:
      return "일반 사용자";
  }
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        console.log("Layout - Current Path:", router.pathname);
        console.log("Layout - Token:", token);
        console.log("Layout - UserStr:", userStr);

        if (userStr && token) {
          const userData = JSON.parse(userStr);
          console.log("Layout - UserData:", userData);
          setUser(userData);
        } else if (router.pathname !== "/login") {
          console.log("Layout - Redirecting to login (no auth)");
          router.push("/login");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Layout - Auth Error:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        if (router.pathname !== "/login") {
          router.push("/login");
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // router.pathname 의존성 제거

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (router.pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user && router.pathname !== "/login") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/teams" className="text-xl font-bold text-indigo-600">
                  TeamBridge
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/teams"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === "/teams"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  팀 관리
                </Link>
                <Link
                  href="/employees"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname.startsWith("/employees")
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  직원 관리
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  {user && (
                    <span className="text-sm text-gray-500">
                      {user.name} ({getUserRole(user.grade)})
                    </span>
                  )}
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
