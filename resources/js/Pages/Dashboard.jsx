import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Typography from "@/Components/UI/Typography";
import QRGenerator from "@/Components/Common/QRGenerator";
import NotificationCard from "@/Components/Cards/NotificationCard";
import VisitsCard from "@/Components/Cards/VisitsCard";
import ProfileCard from "@/Components/Cards/ProfileCard";
import ComplaintsCard from "@/Components/Cards/ComplaintsCard";
import IsAdmin from "@/Components/UI/IsAdmin";

export default function Dashboard({ auth, visits }) {
    const isAdmin =
        auth.user.rol === "administrador" ||
        auth.user.rol === "portero" ||
        auth.user.rol === "adminresidencial";

    return (
        <Authenticated user={auth.user}>
            <Head title="Dashboard" />
            <section className="px-10 py-20 max-w-7xl mx-aut">
                {isAdmin ? (
                    <IsAdmin />
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <NotificationCard />
                        <VisitsCard visits={visits} />
                        <ProfileCard auth={auth} />
                        <ComplaintsCard />
                        <QRGenerator userId={auth.user.id} />
                    </div>
                )}
            </section>
        </Authenticated>
    );
}
