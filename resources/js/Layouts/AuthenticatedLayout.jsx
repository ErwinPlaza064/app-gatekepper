import { useState } from "react";
import DesktopNav from "@/Components/Common/DesktopNav";
import MobileNav from "@/Components/Common/MobileNav";

export default function Authenticated({ user, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const handleOnClick = () =>
        setShowingNavigationDropdown((previousState) => !previousState);

    const userSession = user || null;

    return (
        <div>
            <div className="min-h-screen bg-gray-50">
                <div className="relative">
                    <nav className="bg-white border-b border-gray-100 shadow fixed top-0 left-0 right-0 z-10">
                        <DesktopNav
                            userSession={userSession}
                            handleOnClick={handleOnClick}
                            showingNavigationDropdown={
                                showingNavigationDropdown
                            }
                        />
                    </nav>
                </div>
                <MobileNav
                    userSession={userSession}
                    showingNavigationDropdown={showingNavigationDropdown}
                />
                <main className="min-h-screen">{children}</main>
            </div>
        </div>
    );
}
