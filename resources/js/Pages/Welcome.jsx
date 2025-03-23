import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import HeroText from "@/Components/Hero/HeroText";
import Footer from "@/Components/Common/Footer";

export default function Welcome({ auth }) {
    const user = auth.user || null;
    return (
        <>
            <Authenticated user={user}>
                <Head title="Inicio" />
                <HeroText />
                <Footer />
            </Authenticated>
        </>
    );
}
