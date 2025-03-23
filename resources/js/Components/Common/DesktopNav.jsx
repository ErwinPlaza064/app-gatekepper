import { Link } from "@inertiajs/react";
import Dropdown from "../UI/Dropdown";
import AnimatedLink from "../UI/AnimatedLink";
import { links } from "../../../../public/links";

export default function DesktopNav({
    userSession,
    handleOnClick,
    showingNavigationDropdown,
}) {
    return (
        <div className="px-5">
            <div className="flex h-16 justify-between">
                <div className="flex gap-8">
                    <div className="flex shrink-0 items-center">
                        <Link href="/">
                            <strong>Registrador</strong>
                        </Link>
                    </div>

                    <ul className="hidden gap-7 md:flex">
                        {links.map((link, index) => (
                            <li key={index + link}>
                                <AnimatedLink
                                    href={link.href}
                                    variant={"black"}
                                    color={"black"}
                                    className={"h-full"}
                                >
                                    {link.name}
                                </AnimatedLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="hidden md:flex md:ms-6 md:items-center">
                    <div className="relative ms-3">
                        {userSession != null ? (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                        >
                                            {userSession.name}

                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="bg-black text-white hover:bg-gray-400"
                                    >
                                        Cerrar Sesión
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        ) : (
                            <>
                                <Link
                                    className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-700"
                                    href={"/ask_login"}
                                >
                                    Ingresa
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="-me-2 flex items-center sm:hidden">
                    <button
                        onClick={handleOnClick}
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                className={
                                    !showingNavigationDropdown
                                        ? "inline-flex"
                                        : "hidden"
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                            <path
                                className={
                                    showingNavigationDropdown
                                        ? "inline-flex"
                                        : "hidden"
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
