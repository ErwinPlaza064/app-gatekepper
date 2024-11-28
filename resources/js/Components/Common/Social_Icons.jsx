import { Link } from "@inertiajs/react";

export default function Social_Icons() {
    return (
        <div className="flex space-x-3 py-2">
            <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/Assets/Icon_Facebook.png"
                    alt="Facebook"
                    className="h-8"
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
                    className="h-8"
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
                    className="h-8"
                />
            </Link>
        </div>
    );
}
