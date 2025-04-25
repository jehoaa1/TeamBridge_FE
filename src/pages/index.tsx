import { useDashboard } from "@/client/sample/dashboard";
import { getDefaultLayout, IDefaultLayoutPage, IPageHeader } from "@/components/layout/default-layout";
import { useAuth } from "@/lib/auth/auth-provider";
import { useRouter } from "next/router";
import { useEffect } from "react";

const pageHeader: IPageHeader = {
  title: "Welcome",
};

const IndexPage: IDefaultLayoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { data, error } = useDashboard();

  useEffect(() => {
    router.replace("/teams");
  }, []);

  return null;
};

IndexPage.getLayout = getDefaultLayout;
IndexPage.pageHeader = pageHeader;

export default IndexPage;
