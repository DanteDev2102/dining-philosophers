export namespace main {
	
	export class Philosopher {
	    id: number;
	    name: string;
	    fileName: string;
	    stateStr: string;
	
	    static createFrom(source: any = {}) {
	        return new Philosopher(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.fileName = source["fileName"];
	        this.stateStr = source["stateStr"];
	    }
	}
	export class SimulationState {
	    philosophers: Philosopher[];
	    forks: number[];
	    running: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SimulationState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.philosophers = this.convertValues(source["philosophers"], Philosopher);
	        this.forks = source["forks"];
	        this.running = source["running"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

