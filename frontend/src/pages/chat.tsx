import PromptSpace from "../components/PromptSpace.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {useParams} from "react-router";

export default function Chat() {
    const { id } = useParams();


    return (
        <div className="flex h-screen w-full">
            <AppSidebar />
            <SidebarTrigger/>
            <main className="flex-1 min-w-0">
                <PromptSpace id={id as string} />
            </main>
        </div>
    );
}
