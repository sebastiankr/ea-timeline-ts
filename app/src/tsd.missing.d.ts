// missing 
declare module Meteor {
	function npmRequire(path?: string);
	var Collection: any;
	function defer(fub:any);
}
declare var Deps;


declare module d3 {
	export function tip():any;
	export function contextMenu(any):any;
	export interface Base {

		timeline: any;
		contextMenu:any;
		barChart:any;
	}
}

declare module moment {
    interface Duration {
        format(format: string): string;
        format(): string;
    }
}

declare var cytoscape;


declare var addResizeListener;
// d3 tip
declare var define, tip;
