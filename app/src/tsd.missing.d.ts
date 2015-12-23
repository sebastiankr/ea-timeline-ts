// missing definitions
declare module d3 {
    function tip(): any;
	function contextMenu(any): any;
}

declare module moment {
    interface Duration {
        format(format: string): string;
    }
}
