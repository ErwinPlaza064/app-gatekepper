import { Link } from "@inertiajs/react";
import * as FaIcons from "react-icons/fa";
import React from "react";

export default function SidebarMenuItem({ item, activeTab, setActiveTab }) {
    if (item.isExternal) {
        return (
            <Link
                key={item.id}
                href={route(item.route)}
                className="flex items-center w-full px-4 py-4 space-x-4 font-medium text-gray-700 transition-all duration-300 group rounded-2xl hover:bg-white/50 hover:shadow-lg hover:scale-102"
            >
                <div className="text-2xl transition-transform group-hover:scale-110 grayscale">
                    {item.icon}
                </div>
                <span className="text-base">{item.label}</span>
            </Link>
        );
    }

    return (
        <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-2xl font-medium transition-all duration-300 ${
                activeTab === item.id
                    ? "bg-black text-white shadow-xl transform scale-105"
                    : "text-gray-700 bg-white hover:bg-white/50 hover:shadow-lg hover:scale-102"
            }`}
        >
            <div
                className={`text-2xl transition-transform group-hover:scale-110 ${
                    activeTab === item.id ? "text-white" : "grayscale"
                }`}
            >
                {item.icon && item.icon.startsWith("Fa") && FaIcons[item.icon]
                    ? React.createElement(FaIcons[item.icon])
                    : item.icon}
            </div>
            <span className="text-base">{item.label}</span>
            {activeTab === item.id && (
                <div className="w-2 h-2 ml-auto bg-white rounded-full animate-pulse"></div>
            )}
        </button>
    );
}
