import Authenticated from "@/Layouts/AuthenticatedLayout";
import Footer from "@/Components/Common/Footer";
import Hero from "@/Components/Welcome/Hero";
import Illustration from "@/Components/Welcome/Illustration";
import WhyUs from "@/Components/Welcome/WhyUs";
import Stats from "@/Components/Welcome/Stats";
import CallToAction from "@/Components/Welcome/CallToAction";
import { Head } from "@inertiajs/react";

export default function Welcome({ auth }) {
    const user = auth.user || null;
    return (
        <>
            <Authenticated user={user}>
                <Head title="Bienvenido" />
                <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between min-h-screen py-6 lg:flex-row">
                            <Hero />
                            <Illustration />
                        </div>
                    </div>
                </div>
                <WhyUs />
                <Stats />
                <CallToAction />
                <Footer />
            </Authenticated>
        </>
    );
}
