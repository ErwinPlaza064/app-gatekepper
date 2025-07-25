export default function Illustration() {
    return (
        <div className="relative flex items-center justify-center flex-1 py-10 lg:py-0">
            <div className="relative">
                <div className="absolute bg-blue-200 rounded-full -top-4 -left-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute delay-1000 bg-purple-200 rounded-full -bottom-4 -right-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="relative z-10 p-8 bg-white shadow-2xl rounded-2xl">
                    <img
                        src="/Assets/computer.svg"
                        alt="Ilustración de registro"
                        className="mx-auto w-80 lg:w-96"
                    />
                </div>
            </div>
        </div>
    );
}
