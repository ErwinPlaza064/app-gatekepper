import Typography from "@/Components/UI/Typography";

export default function ProfileCard({ auth }) {
    return (
        <div className="p-5 bg-white rounded-lg shadow-md">
            <Typography
                as={"h2"}
                variant={"h2"}
                color={"black"}
                className="mb-3 text-xl font-semibold"
            >
                Tu Perfil
            </Typography>
            <Typography as={"p"} variant={"p"} color={"black"}>
                Nombre: {auth.user.name}
                <br />
                Dirección: {auth.user.address ?? "No disponible"}
            </Typography>
        </div>
    );
}
