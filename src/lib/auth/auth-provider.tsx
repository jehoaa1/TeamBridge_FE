/**
 * 백오피스 특성상 기본적으로 인증 필요
 * 인증된 사용자 정보를 얻거나 로그인 페이지로 이동
 */
import Spinner from "@/components/shared/spinner";
import { useRouter } from "next/router";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { User } from "../../types/auth";

interface IAuthProviderProps {}

interface IAuthContext {
  initialized: boolean;
  user: User | null;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export function useAuth() {
  const result = useContext(AuthContext);
  if (!result?.initialized) {
    throw new Error("Auth context must be used within a AuthProvider!");
  }
  return result;
}

const publicPageList = ["/login"];

const isPublicPage = (pathname: string) => {
  return publicPageList.includes(pathname);
};

const AuthProvider = ({ children }: PropsWithChildren<IAuthProviderProps>) => {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (userStr && token) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        if (isPublicPage(router.pathname)) {
          router.replace("/teams");
        }
      } catch (err) {
        console.error("Auth Error:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        if (!isPublicPage(router.pathname)) {
          router.replace("/login");
        }
      }
    } else if (!isPublicPage(router.pathname)) {
      router.replace("/login");
    }

    setInitialized(true);
  }, [router.pathname]);

  if (!initialized) {
    return <Spinner />;
  }

  if (isPublicPage(router.pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    return <Spinner />;
  }

  return <AuthContext.Provider value={{ initialized, user }}>{children}</AuthContext.Provider>;
};

export default React.memo(AuthProvider);
