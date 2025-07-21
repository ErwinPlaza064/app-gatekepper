import { useEffect } from "react";
import toast from "react-hot-toast";

export default function NotificationListener({ userId, onNotification }) {
    useEffect(() => {
        if (!window.Echo || !userId) return;

        const channel = window.Echo.private(`App.Models.User.${userId}`);

        channel.notification((notification) => {
            if (onNotification) {
                onNotification(notification);
            } else {
                toast(notification.title + ": " + notification.body);
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [userId]);

    return null;
}
