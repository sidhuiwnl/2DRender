    import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
    import { Trash } from "lucide-react";
    import { useRef, useState,memo } from "react";

    export const  SidebarSessionItem = memo(({
                                           session,
                                           onRename,
                                           onDelete,
                                           onNavigate,
                                           onPrefetch,
                                       }: {
        session: { id: string; name: string };
        onRename: (id: string, name: string) => void;
        onDelete: (id: string) => void;
        onNavigate: (id: string) => void;
        onPrefetch: (id: string) => void;
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempName, setTempName] = useState(session.name);
        const inputRef = useRef<HTMLInputElement>(null);

        const handleBlur = () => {
            setIsEditing(false);
            if (tempName !== session.name) {
                onRename(session.id, tempName);
            }
        };

        const handleDoubleClick = () => {
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 0);
        };

        return (
            <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                    onDoubleClick={handleDoubleClick}
                    onClick={() => onNavigate(session.id)}
                    onMouseEnter={() => onPrefetch(session.id)}
                    asChild
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-300 hover:text-black text-sm bg-gray-200 text-black transition-all duration-150 shadow-sm"
                >
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") inputRef.current?.blur();
                            }}
                            className="bg-transparent border-none outline-none text-white w-full"
                        />
                    ) : (
                        <div className="flex items-center justify-between w-full group">
                <span className="truncate">
                  <span className="flex flex-row justify-center gap-2">{session.name}</span>
                </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-black rounded-sm p-1 transform -translate-x-2 group-hover:translate-x-0 cursor-pointer transition-all duration-300 ease-in-out"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    })
