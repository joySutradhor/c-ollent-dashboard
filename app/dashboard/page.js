import DashboardHome from "@/components/dashboardHome/page";
import AuthRedirect from "./Hooks/AuthRedirect";

export default function Home() {
  return (
    <section>
      <DashboardHome /> 
      {/* <AuthRedirect /> */}
    </section>
  );
}
