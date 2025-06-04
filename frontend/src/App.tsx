import Main from "@/pages/Main.tsx";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";


function App() {
    return (
        <div className="flex h-screen w-full">
            <SidebarProvider>
                <main className="flex-1 min-w-0 h-full">
                    <Main/>
                </main>
            </SidebarProvider>
        </div>
    )
}

export default App