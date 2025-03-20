import Typography from "../UI/Typography";

export default function Banner({ title }) {
    return (
        <div className="p-40 flex justify-center items-center bg-black">
            <Typography
                className="text-center"
                as={"h1"}
                variant={"h1"}
                color={"white"}
            >
                {title}
            </Typography>
        </div>
    );
}
