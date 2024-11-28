import Typography from "../UI/Typography";

export default function Banner({ title }) {
    return (
        <div className="p-40 flex justify-center items-center  bg-primary">
            <Typography
                className="text-center"
                as={"h1"}
                variant={"h1"}
                color={"white"}
            >
                CONOCE NUESTRAS FORMAS DE CONTACTO
            </Typography>
        </div>
    );
}
