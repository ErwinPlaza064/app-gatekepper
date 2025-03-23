import { Link } from "@inertiajs/react";
import ResponsiveNavLink from "../UI/ResponsiveNavLink";
import { links } from "../../../../public/links";

export default function MobileNav({ showingNavigationDropdown, userSession }) {
    return (
        <div
            className={
                (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"
            }
        >
            <div className="rounded-lg border-t border-gray-200 bg-white px-4 pb-1 pt-4 shadow-lg">
                {userSession != null ? (
                    <>
                        <div className="mb-4">
                            <div className="text-base font-medium text-gray-800">
                                {userSession.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {userSession.email}
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {links.map((link, index) => (
                                <li key={index + link}>
                                    <ResponsiveNavLink
                                        href={link.href}
                                        className="block rounded-md px-4 py-2 hover:bg-gray-100"
                                    >
                                        {link.name}
                                    </ResponsiveNavLink>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 space-y-2 border-t pt-4">
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="block rounded-md px-4 py-2 hover:bg-gray-100"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </>
                ) : (
                    <ul className="space-y-2">
                        {links.map((link, index) => (
                            <li key={index + link}>
                                <ResponsiveNavLink
                                    href={link.href}
                                    className="block rounded-md px-4 py-2 hover:bg-gray-100"
                                >
                                    {link.name}
                                </ResponsiveNavLink>
                            </li>
                        ))}
                        <Link
                            className="block rounded-md px-4 py-2 hover:bg-gray-100"
                            href={route("login")}
                        >
                            Ingresa
                        </Link>
                    </ul>
                )}
            </div>
        </div>
    );
}
