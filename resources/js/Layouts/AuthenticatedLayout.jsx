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
            <div className="min-h-screen bg-gray-50">
                <Toaster position="top-right" />
                <div className="relative">
                    <nav className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 shadow">
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
                <main className="min-h-screen">{children}</main>
            </div>
        </div>
    );
}
