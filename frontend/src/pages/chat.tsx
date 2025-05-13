import PromptSpace from "../components/PromptSpace.tsx";

export default function Chat() {
    return (
        <div className="h-screen w-screen flex p-4">
            <div className="w-1/2 h-full ">
                <PromptSpace />

            </div>
            <div className="w-1/2 h-full  ">
                <div className="p-4">Left Side</div>
            </div>
        </div>
    );
}
