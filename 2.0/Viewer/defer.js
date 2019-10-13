// get PHP data
let gotF = document.querySelector("#filters").value;
// set checker for LOADED flag
let xti = setInterval(()=>{
	if(LOADED){
		// LOADED
		clearInterval(xti);	// stop checking
		// get stats
		document.querySelector(`#snp`).innerText = `${games.length}`;
		document.querySelector(`#s0p`).innerText = 
		`${countFilter(new CustomFilter(e=>e.State===`0`))}`;
		document.querySelector(`#s1p`).innerText =
		`${countFilter(new CustomFilter(e=>e.State===`1`))}`;
		document.querySelector(`#s2p`).innerText = 
		`${countFilter(new CustomFilter(e=>e.State===`2`))}`;
		document.querySelector(`#s3p`).innerText = 
		`${countFilter(new CustomFilter(e=>e.State===`3`))}`;
		document.querySelector(`#s4p`).innerText = 
		`${countFilter(new CustomFilter(e=>e.State===`4`))}`;
		// load to DOM with given Filter
		loadFiltered(games, Filter.fromString(gotF));
	}
}, 10);

document.querySelector(`#filterBtn`).onclick = ()=>{
	let fstr;	// ask for filter
	do{
		fstr = prompt("Filter", gotF || "id(0,100)");
		if(fstr === null)
			return;
		if(!fstr)
			fstr = gotF;
	}while(!/^.*?\(.*?\)$/.exec(fstr));
	loadFiltered(games, Filter.fromString(fstr));
	window.history.pushState("", "", `?f=${encodeURIComponent(fstr)}`);
	gotF = document.querySelector(`#filters`).value = fstr;
}