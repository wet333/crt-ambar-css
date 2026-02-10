export function getTerminalPS(pathname: string): string {
    const path = pathname === "/" ? "~" : `~${pathname}`;
    return `wet333@PC:${path}$`;
}
