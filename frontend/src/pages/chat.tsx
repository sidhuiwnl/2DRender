import PromptSpace from "../components/PromptSpace.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";

export default function Chat() {
    return (
        <div className="flex h-screen w-full">
            <AppSidebar />
            <SidebarTrigger/>
            <main className="flex-1 min-w-0">
                <PromptSpace />
            </main>
        </div>
    );
}
