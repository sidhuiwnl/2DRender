import Main from "@/pages/Main.tsx";
import {SidebarProvider,SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";


function App() {
    return (
        <div className="flex h-screen w-full">
            <SidebarProvider>
                <AppSidebar/>
                <SidebarTrigger/>
                <main className="flex-1 min-w-0 h-full">
                    <Main/>
                </main>
            </SidebarProvider>
        </div>
    )
}

export default App