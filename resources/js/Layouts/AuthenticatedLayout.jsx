import { useState } from "react";
import DesktopNav from "@/Components/Common/DesktopNav";
import MobileNav from "@/Components/Common/MobileNav";
import { Toaster } from "react-hot-toast";

export default function Authenticated({ user, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const handleOnClick = () =>
        setShowingNavigationDropdown((previousState) => !previousState);

    const userSession = user || null;

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Toaster position="top-right" />
                <div className="relative">
                    <nav className="fixed top-0 left-0 right-0 z-10 border-b shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-700/50">
                        <DesktopNav
                            userSession={userSession}
                            handleOnClick={handleOnClick}
                            showingNavigationDropdown={
                                showingNavigationDropdown
                            }
                        />

                        <MobileNav
                            userSession={userSession}
                            showingNavigationDropdown={
                                showingNavigationDropdown
                            }
                        />
                    </nav>
                </div>
                <main className="min-h-screen pt-16">{children}</main>
            </div>
        </div>
    );
}
