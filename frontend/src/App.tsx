import Main from "@/pages/Main.tsx";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


const queryClient = new QueryClient({
    defaultOptions :{
        queries: {
            gcTime : 1000 * 60 * 60 * 24
        }
    }
})

function App() {


    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex h-screen w-full">
                <SidebarProvider>
                    <main className="flex-1 min-w-0 h-full">
                        <Main/>
                    </main>
                </SidebarProvider>
            </div>
        </QueryClientProvider>
    )
}

export default App