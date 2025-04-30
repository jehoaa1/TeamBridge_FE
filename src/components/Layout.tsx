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
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    try {
      if (!userStr || !token) {
        if (router.pathname !== "/login") {
          router.replace("/login");
        }
      } else {
        const userData = JSON.parse(userStr);
        setUser(userData);

        // 로그인 페이지에 있을 때만 teams로 리다이렉트
        if (router.pathname === "/login") {
          router.replace("/teams");
        }
      }
    } catch (err) {
      console.error("Layout - Auth Error:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      if (router.pathname !== "/login") {
        router.replace("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // 의존성 배열을 비워서 마운트 시에만 실행

  const handleLogout = () => {
    console.log("handleLogout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // 로그인 페이지는 별도 처리
  if (router.pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 인증되지 않은 경우
  if (!user) {
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

      <div className="flex">
        {/* Left Navigation Bar */}
        <div className="w-64 min-h-screen bg-white shadow-sm">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img className="h-8 w-auto" src="/logo.png" alt="TeamBridge" />
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  href="/teams"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname === "/teams"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  팀 관리
                </Link>
                <Link
                  href="/employees"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname.startsWith("/employees")
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  직원 관리
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{getUserRole(user?.grade || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
