export function Frame({
    children,
    className = "",
    contentClassName = "p-6",
}: {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    return (
        <div className={`relative border border-border bg-surface ${className}`}>
            <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-accent" />
            <span className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-accent" />
            <span className="absolute -left-px -bottom-px h-3 w-3 border-l-2 border-b-2 border-accent" />
            <span className="absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-accent" />
            <div className={contentClassName}>{children}</div>
        </div>
    );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
            {children}
        </p>
    );
}