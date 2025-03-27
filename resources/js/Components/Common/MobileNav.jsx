import { Link, usePage } from "@inertiajs/react";
import ResponsiveNavLink from "../UI/ResponsiveNavLink";
import { links } from "../../../../public/links";

export default function MobileNav({ showingNavigationDropdown, userSession }) {
    const { url } = usePage(); // Obtiene la ruta actual

    return (
        <div
            className={
                (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"
            }
        >
            <div className="px-4 pt-4 pb-1 bg-white border-t border-gray-200 rounded-lg shadow-lg">
                {userSession != null ? (
                    <>
                        <div className="mb-4">
                            <div className="text-base font-medium text-center text-gray-800">
                                {userSession.name}
                            </div>
                            <div className="text-sm font-medium text-center text-gray-500">
                                {userSession.email}
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {links.map((link, index) => {
                                const isActive = url === link.href;

                                return (
                                    <li key={index}>
                                        <ResponsiveNavLink
                                            href={link.href}
                                            className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${
                                                isActive
                                                    ? "border-b-2 border-black"
                                                    : ""
                                            }`}
                                        >
                                            {link.name}
                                        </ResponsiveNavLink>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="pt-4 mt-4 space-y-2 border-t">
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="block px-4 py-2 text-white bg-black rounded-md hover:bg-gray-400"
                            >
                                Cerrar sesión
                            </ResponsiveNavLink>
                        </div>
                    </>
                ) : (
                    <ul className="space-y-2">
                        {links.map((link, index) => {
                            const isActive = url === link.href;

                            return (
                                <li key={index}>
                                    <ResponsiveNavLink
                                        href={link.href}
                                        className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${
                                            isActive
                                                ? "border-b-2 border-black"
                                                : ""
                                        }`}
                                    >
                                        {link.name}
                                    </ResponsiveNavLink>
                                </li>
                            );
                        })}

                        <Link
                            className="block px-4 py-2 rounded-md hover:bg-gray-100"
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
