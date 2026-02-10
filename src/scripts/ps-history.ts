class PSHistory {
    private static instance: PSHistory;
    private history: string[] = [];
    private currentLocation: string = "~";
    private static readonly HISTORY_KEY = "ps-history";
    private static readonly LOCATION_KEY = "ps-location";

    // When the user visits the website for the first time, we will set this commands to the history
    // to prevent showing an empty history, and breaking the UI.
    private static readonly PROJECT_NAME = "crt-blog";
    private static readonly SEED_COMMANDS = [
        `wet333@PC:~$ git clone https://github.com/wet333/${PSHistory.PROJECT_NAME}.git`,
        `wet333@PC:~$ cd ${PSHistory.PROJECT_NAME}`,
        `wet333@PC:${PSHistory.PROJECT_NAME}$ npm install`,
        `wet333@PC:${PSHistory.PROJECT_NAME}$ npm run build && npm run dev`,
        `wet333@PC:${PSHistory.PROJECT_NAME}$ cd ~`,
    ];

    private constructor() {
        const storedHistory = localStorage.getItem(PSHistory.HISTORY_KEY);
        if (storedHistory) {
            this.history = JSON.parse(storedHistory);
        } else {
            this.history = PSHistory.SEED_COMMANDS;
            localStorage.setItem(PSHistory.HISTORY_KEY, JSON.stringify(this.history));
        }

        const storedLocation = localStorage.getItem(PSHistory.LOCATION_KEY);
        if (storedLocation) this.currentLocation = storedLocation;
    }

    static getInstance(): PSHistory {
        if (!PSHistory.instance) PSHistory.instance = new PSHistory();
        return PSHistory.instance;
    }

    add(command: string): void {
        const entry = `wet333@PC:${this.currentLocation}$ ${command}`;
        this.history.push(entry);
        localStorage.setItem(PSHistory.HISTORY_KEY, JSON.stringify(this.history));

        if (command.startsWith("cd ")) {
            this.currentLocation = command.slice(3).trim();
            localStorage.setItem(PSHistory.LOCATION_KEY, this.currentLocation);
        }

        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("ps-history-updated"));
        }, 600);
    }

    getLatest(count: number): string[] {
        return this.history.slice(-count);
    }

    getLocation(): string {
        return this.currentLocation;
    }
}

export function addPS(command: string): void {
    PSHistory.getInstance().add(command);
}

export function getPSHistory(count: number = 5): string[] {
    return PSHistory.getInstance().getLatest(count);
}

export function getCurrentLocation(): string {
    return PSHistory.getInstance().getLocation();
}
