import { Home, MessageCircle, Plus,Loader2,Trash,AlignLeft } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"
import { useState,useRef,useMemo  } from "react"
import {useNavigate} from "react-router";
import {useSessionsQuery,useUpdateSessionMutation,useCreateSession} from "@/queryOptions/createSessionMutation.ts";
import {SignedOut,SignInButton,SignedIn,UserButton} from "@clerk/clerk-react";
import {useUser} from "@clerk/clerk-react";


export function AppSidebar() {
    const navigate = useNavigate();
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
    const [tempName, setTempName] = useState<string>("");


    const { user } = useUser();

    const username = user?.fullName || "Profile";
    const emailAddress = user?.emailAddresses[0].emailAddress || "example@clerk.clerk.com";

    const inputRef = useRef<HTMLInputElement>(null);

    const userId = localStorage.getItem("userId") as string;



    const { data, isLoading : fetchingSessions,  } = useSessionsQuery(userId);
    const { mutate : updateSession} = useUpdateSessionMutation()
    const { mutate, isPending} = useCreateSession();


    const handleDoubleClick = (sessionId : string,currentName :string) => {
        setEditingSessionId(sessionId)
        setTempName(currentName)
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    const handleBlur = async (sessionId : string) => {
        setEditingSessionId(null)
        setUpdatingSessionId(sessionId)
        updateSession({
            sessionId,
            tempName,
        },{
            onSettled : () => setUpdatingSessionId(null)
        })
    }

    const renderNewChatButton = useMemo(() => {

        return isPending ? (
            <>
                <Loader2 className="animate-spin" size={18} />
                <span>Creating...</span>
            </>
        ) : (
            <>
                <Plus size={18} />
                <span>New Chat</span>
            </>
        );
    }, [isPending]);

    return (
        <Sidebar className="border-none">
            <SidebarContent className="flex flex-col justify-between h-full">
                <div>
                    <SidebarGroup>
                        <SidebarGroupLabel>Plura</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="#">
                                            <Home />
                                            <span>Home</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="#">
                                            <MessageCircle />
                                            <span>My Chat</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <div className="p-4 space-y-2">
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                onClick={() => {
                                                    mutate(userId)
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border hover:bg-neutral-800 cursor-pointer"
                                            >
                                                {renderNewChatButton}
                                            </SidebarMenuButton>

                                        </SidebarMenuItem>
                                        <h1 className="mt-5">Prompt History</h1>
                                        { fetchingSessions ? (
                                            <Loader2  className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {data?.data.sessions.map((session) => (
                                                    <SidebarMenuItem key={session.id}>
                                                        <SidebarMenuButton
                                                            onDoubleClick={() => handleDoubleClick(session.id,session.name)}
                                                            onClick={() => navigate(`/chats/${session.id}`)}
                                                            asChild
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer  hover:bg-neutral-300 hover:text-black  text-sm bg-gray-200 text-black transition-all duration-150 shadow-sm"
                                                        >
                                                            {editingSessionId === session.id ? (
                                                                <input
                                                                    ref={inputRef}
                                                                    type="text"
                                                                    value={tempName}
                                                                    onChange={(e) => setTempName(e.target.value)}
                                                                    onBlur={() => handleBlur(session.id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") inputRef.current?.blur();
                                                                    }}
                                                                    className="bg-transparent border-none outline-none  w-full"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-between w-full group">
                                                                      <span className="truncate">
                                                                        {updatingSessionId === session.id ? (
                                                                            <Loader2 className="animate-spin" size={20} />
                                                                        ) : (

                                                                            <span className="flex flex-row justify-center gap-2">
                                                                                <AlignLeft size="20"/>
                                                                                {session.name}
                                                                            </span>
                                                                        )}
                                                                      </span>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 text-black rounded-sm p-1 transform -translate-x-2 group-hover:translate-x-0 cursor-pointer transition-all duration-300 ease-in-out"
                                                                    >
                                                                        <Trash className="w-4 h-4  " />
                                                                    </button>
                                                                </div>
                                                            )}

                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                </div>
                <div className="p-4 flex">
                    <SignedIn>
                        <UserButton />
                        <div className="flex flex-col ml-2 ">
                            <span className="text-sm">{username}</span>
                            <span className="text-sm text-neutral-400">{emailAddress}</span>
                        </div>

                    </SignedIn>
                    <SignedOut>
                        <SignInButton/>
                    </SignedOut>
                </div>

            </SidebarContent>
        </Sidebar>
    )
}

