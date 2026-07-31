import { Link, Outlet } from "react-router-dom";
import Navbar from "../partials/Navbar";
import MobileBottomNav from "../partials/MobileBottomNav";

function Main() {
    return (
        <>
            <Navbar />
            <main className="pb-20 md:pb-0">
                <Outlet/>
            </main>
            <MobileBottomNav />
            <footer className="py-10 hidden md:block">
                <div className="container mx-auto">
                    <p className="text-center">
                        Copyright &copy; par <Link to={""}>Hadipharma</Link>
                    </p>
                </div>
            </footer>
        </>
    );
}

export default Main;
