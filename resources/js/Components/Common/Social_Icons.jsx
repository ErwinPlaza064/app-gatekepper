import { Link } from "@inertiajs/react";

export default function Social_Icons() {
    return (
        <div className="flex py-2 space-x-3">
            <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/Assets/Icon_Facebook.png"
                    alt="Facebook"
                    className="h-8 transition-transform duration-300 transform hover:scale-110"
                />
            </Link>
            <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/Assets/Icon_Instagram.png"
                    alt="Twitter"
                    className="h-8 transition-transform duration-300 transform hover:scale-110"
                />
            </Link>
            <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/Assets/Icon_Youtube.png"
                    alt="Instagram"
                    className="h-8 transition-transform duration-300 transform hover:scale-110"
                />
            </Link>
        </div>
    );
}
