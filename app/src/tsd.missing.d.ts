// missing 
declare module d3 {
    export function tip(): any;
	export function contextMenu(any): any;
	export interface Base {
		timeline: any;
		contextMenu: any;
		barChart: any;
	}
}

declare module moment {
    interface Duration {
        format(format: string): string;
        format(): string;
    }
}

// d3 tip
declare var define, tip;
