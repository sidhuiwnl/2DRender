import PromptSpace from "../components/PromptSpace.tsx";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";

export default function Chat() {
    return (
        <div className="w-screen h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full h-full">
                    {/*<SidebarTrigger />*/}
                    <PromptSpace />
                </main>
            </SidebarProvider>
        </div>
    );
}
