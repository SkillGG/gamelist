let games = [];			// array of Game objects
let LOADED = false;		// has games been loaded from file yet?
/**
	Game class
	Hold information about single game
PARAMS:
	name: "",
	state: "",
	no: 0
VALUES:
	Name: "",
	State: "",
	ID: 0
*/
class Game {
	constructor(name, state, no){
		this.Name = name;
		this.State = state;
		this.ID = no;
	}
}
/**
	Adds new Game to array given name and state
PARAMS:
	name: "",	// if null or empty - ABORT
	state: ""	// if null or empty - ABORT
*/
let addGame = (name,state)=>{
	if(!name||!state)
		return;
	games.push(new Game(name,state,games.length + 1));
}
/**
	Loads Game data from file.
PARAMS:
	conf:{
		path: "nData.txt"
	}
*/
let loadFromFile = async (conf)=>{
	conf = conf || {
		// default config values
		path: "nData.txt"
	};
	// load as long string
	let rawData = await fetch(conf.path)
	.then(d=>d.text())
	.catch(console.error);
	// break to lines
	let lineData = rawData.replace(/\r/g, "").split(/[\n\r]/);
	lineData.forEach(e=>{	// foreach line
		// check if syntactically correct
		let ex;
		if(!e || !(ex = /\[(.*?)\]\{([0-9])\}/.exec(e)))
			return;
		else						// correct
			addGame(ex[1], ex[2]);	// add as new game
	});
}
/**
	Filter class
	It holds info and generates filtering functiolns from strings and values.
PARAMS:
	type: "0",
	data: [0,1000],
	d: 0
*/
class Filter {
	constructor(type, data, d){
		// set defaults
		d = this.Depth = d || 0;
		this.type = type || "id";
		data = data || [0,1000];
		// segregate data
		let andor_rx = /^(?:[no.,])|(?:and)|(?:or)$/;
		if(andor_rx.exec(type) && d === 0)	// if multi-filter w/ ()
			this.conf = typeof data==="string"?data.split(`|`):Object.values(data);
		else if(andor_rx.exec(type) && d === 1)		// if multi-filter w/ []
			this.conf = typeof data==="string"?data.split(`;`):Object.values(data);
		else if(andor_rx.exec(type) && d === 2)		// if multi-filter w/ <>
			this.conf = typeof data==="string"?data.split(`^`):Object.values(data);
		else											// if single-filter
			this.conf = typeof data==="string"?data.split(`,`):Object.values(data);
	}
}
/**
	Generates Filter from given string
PARAM:
	s: ""
SYNTAX:
	<name><par><data></par>
	<name>:
		name of filter used (or id)
	<par>: 
		parenthesis (), [], <>, {}
		() used for single and main-multi
		[], <>, {} used for deeper multi-filter purposes.
	<data>:
		data separated by , | ; ^
		',' used to separate values inside functions
		'|' ';' '^' used to separate functions inside multi-filters 
		!! use as ',' each for their respective depth levels !!
		'|' inside ()
		';' inside []
		'^' inside {} 
EXAMPLE:
o(o[n<one{4300}>;o<0{3000,3300}^0{2500, 2550}>]|n[id<500,1000>;regx</sin/i>]|id(0,100))
	o(									// MULTI (or)
		o[									// MULTI (or)
			one{4300}							// ID==4300
			;									// OR
			o<									// MULTI (or)
				0{3000,3300}						// 3000<ID<3300
				^									// OR
				0{2500, 2550}						// 2500<ID<2550
			>									//
		]									//
		|								//OR
		n[									// MULTI (and)
			id<500,1000>						// 500<ID<1000
			;									// AND
			regx</sin/i>						// /sin/i.matches(NAME)
		]									//
		|								// OR
		id(0,100)						// 0<id<100
	)
(Simplified):
	o(n[0<500,1000>;regx</sin/i>]|0[0,100]|0[3000,3300]|0[2500,2550]|one{4300})

	540 [Sinder] +
	4300 [Cider] +
	200 [Sinner] -

*/
Filter.fromString = function(s, pd){
	let Fexe;
	// check for respective depth values
	if(Fexe = /(.*?)\((.*?)\)/.exec(s))			// normal filter (depth: 0)
		return new Filter(Fexe[1], Fexe[2]);
	else if(Fexe = /(.*?)\[(.*?)\]/.exec(s))	// inside first multi (depth: 1)
		return new Filter(Fexe[1], Fexe[2], ++pd);
	else if(Fexe = /(.*?)\<(.*?)\>/.exec(s))	// inside second multi (depth: 2)
		return new Filter(Fexe[1], Fexe[2], ++pd);
	else if(Fexe = /(.*?)\{(.*?)\}/.exec(s))	// inside third multi (depth: 3)
		return new Filter(Fexe[1], Fexe[2], ++pd);
	return Filter.fromString(`id(0,1000)`);		// not matching any (depth: 0)
}
/**
	Generates filter description
*/
Filter.prototype.desc = function(){
	let Desc, gF;
	switch(`${this.type.toLowerCase()}`){
		case "o":
		case "or":
			// If `or` get desc()s of each inside func and use as desc
			Desc = `(`;
			gF = [];
			this.conf.forEach(i=>{
				gF.push(Filter.fromString(i, this.Depth));
			});
			gF.forEach(f=>{
				Desc += ` ${f.desc()} ||`;
			});
			Desc = `${Desc.substr(0, Desc.length-2)}) [${countFilter(this)}]`;
			return Desc;
		case "n":
		case "and":
		// If `and` get desc()s of each inside func and use as desc
			Desc = `(`;
			gF = [];
			this.conf.forEach(i=>{
				gF.push(Filter.fromString(i, this.Depth));
			});
			gF.forEach(f=>{
				Desc += ` ${f.desc()} &`;
			});
			Desc = `${Desc.substr(0, Desc.length-1)}) [${countFilter(this)}]`;
			return Desc;
		case "1":
		case "stat":
		case "status":
			// status is equal
			return `Status==${this.conf[0]} [${countFilter(this)}]`;
		case "2":
		case "xid":
		case "one":
		case "position":
			// position equals
			return `Position==${this.conf[0]} [${countFilter(this)?"1":"0"}]`;
		case "regx":
		case "regexpmatch":
			// name matches regex
			return `RegExpMatch(${this.conf[0]}) [${countFilter(this)}]`;
		case "name":
			// name equals
			return `Name==${this.conf[0]} [${countFilter(this)?"1":"0"}]`;
		case "0":
		case "id":
		case "pos_between":
		default:
			// is between
			return `Pos_between(${this.conf[0]}, ${this.conf[1]}) [${countFilter(this)}]`;
	}
}
/**
	Returns generates Filtering function callback
*/
Filter.prototype.getFunc = function() {
	let gF, pass;
	switch(`${this.type.toLowerCase()}`){
		case "o":
		case "or":
			// OR MultiFilter
			return e=>{
				// get all inside-filters
				gF = [];
				this.conf.forEach(i=>{
					gF.push(Filter.fromString(i, this.Depth));
				});
				// pass `e` by all filters
				pass = false;
				gF.forEach(f=>{
					if(!pass){				// if not already passed
						if((f.getFunc())(e))	// check
							pass = true;		// passed
					}
				});
				return pass;
			};
		case "n":
		case "and":
			// AND MultiFilter
			return e=>{
				// get all inside-filters
				gF = [];
				this.conf.forEach(i=>{
					gF.push(Filter.fromString(i, this.Depth));
				});
				// pass `e` by all filters
				pass = true;
				gF.forEach(f=>{
					if(pass){				// if not already failed
						if(!(f.getFunc())(e))	// check
							pass = false;		// failed
					}
				});
				return pass;
			};
		case "1":
		case "stat":
		case "status":
			// State SingleFilter
			return e=>`${e.State}` === `${this.conf[0]||"0"}`;
		case "2":
		case "xid":
		case "one":
		case "position":
			// IDEquals SingleFilter
			return e=>e.ID === parseInt(this.conf[0]||1);
		case "regx":
		case "regexpmatch":
			// Regex SingleFilter
			return e=>{
				let name = e.Name;
				let rxV;
				let rn, rf;
				if(rxV = /\/(.*?)\/(.*)/.exec(this.conf[0])){
					rn = rxV[1];
					rf = rxV[2];
				}
				else{
					rn = this.conf[0];
					rf = "i";
				}
				return !!((new RegExp(rn,rf)).exec(name));
			}
		case "name":
			// NAMEEquals SingleFilter
			return e=>e.Name === this.conf[0];
		case "0":
		case "id":
		case "pos_between":
		default:
			// IDBetween SingleFilter
			return e=>
			e.ID >= parseInt(this.conf[0]||0) && e.ID <= parseInt(this.conf[1]||1000);
	}
};
/**
	class CustomFilter to create unstandarized filters
*/
class CustomFilter {constructor(f){this.func = f;}}
CustomFilter.prototype.getFunc = function(){return this.func;}

/**
	Changes #filterstatus and #collectionstatus texts
*/
let setStatus = (cs, fs)=>{
	fs = fs || document.querySelector(`#filterstatus`).innerText;
	cs = cs || document.querySelector(`#collectionstatus`).innerText;
	document.querySelector(`#collectionstatus`).innerText = cs;
	document.querySelector(`#filterstatus`).innerText = fs;
}
/**
	Counts how many records given Filter hits
*/
let countFilter = (f)=>{
	if(!games||!((f instanceof Filter)||(f instanceof CustomFilter)))
		return;
	let r = 0;
	games.forEach(e=>{
		if((f.getFunc())(e))
			r++;
	});
	return r;
}
/**
	Show on site only those who passed given filter
*/
let loadFiltered = async (a, f)=>{
	// is input correct?
	if(!a||!((f instanceof Filter)||(f instanceof CustomFilter)))
		return;
	// function that shoves given game to DOM
	let toTable = (e)=>{
		// create elements
		let tr = document.createElement(`tr`);
		let td1 = document.createElement(`td`);
		let td2 = document.createElement(`td`);
		let td3 = document.createElement(`td`)
		// ID collumn
		td1.innerText = `${e.ID}.`;
		// NAME collumn
		td2.innerText = `${e.Name}`;
		// STATE collume
		td3.classList.add("statechange");
		td3.setAttribute("itemid", e.ID);
		td3.innerHTML = `${e.State}`;
		// add to DOM
		tr.append(td1,td2,td3);
		document.querySelector(`table#maintable tbody#list`).append(tr);
	};
	// clear the table
	document.querySelector(`table#maintable tbody#list`).innerHTML = ``;
	// Check each Game through Filter
	a.forEach(e=>{
		if((f.getFunc())(e)){	// if passed
			toTable(e);			// add to DOM
		}
	});
	setStatus(`${f.desc(f) || ""}`, `Filtered! 'Found: ${countFilter(f)}/${games.length}`);
	return;
}
loadFromFile()		// load data from file
.then(_=>LOADED = true);	// set LOADED flag