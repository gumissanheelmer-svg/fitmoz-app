import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => (
  <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
    <Outlet />
    <BottomNav />
  </div>
);

export default AppLayout;
