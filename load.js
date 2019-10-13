let combinedData = [];
combinedData.loaded = false;
let ncH = {cache: "no-cache", headers:{"Cache-Control":"no-cache", "Pragma":"no-cache"}};
let start = async ()=>{
	let names = await fetch('data.txt', ncH).then(r=>r.text()).catch(console.error);
	names = names.split('\n');
	names.forEach((e,i,a)=>{a[i]=e.replace(/\r/g, "")});
	let data = await fetch('saveData.txt', ncH).then(r=>r.text()).catch(console.error);
	data = data.split('\n');
	data.forEach((e,i,a)=>{a[i]=e.replace(/\r/g, "")});
	return {names, data};
};

start().then((e)=>{
	console.log(e);
	e.names.forEach((n,i)=>{
		combinedData.push({
			name: n, 
			inCol: e.data[i].split('@')[0].split('.')[1]==='true'?true:false, 
			link: e.data[i].split('@')[1],
			state: parseInt(e.data[i].split('@')[0].split('.')[0])
		});

	});
	combinedData.checkLinks();
	combinedData.loadToTable().then((r)=>{
		document.querySelector('#info').innerText = 
		`Showed everything! You can now explore freely!`;
	});
	recount();
}).catch(console.error);

combinedData.checkLinks = function(){
	this.forEach((e,i,a)=>{
		if(e.link)
			if(!(/https?:\/\/[^.]+\.[^/]+(?:.+)*/.test(e.link))){
				e.link = e.link.replace(/\/\//g, "");
				a[i].link = `https://${e.link}`;
			}
	});
}

combinedData.loadToTable = async function(){
	document.querySelector('table #check').innerHTML = "";
	let z;
	let step = 100;
	for(z=0; z < (combinedData.length-1)/step; z += 1){
		await new Promise((rs,rj)=>{
			setTimeout(()=>{
				for(let x = 0; x < step; x++){
					let a = combinedData;
					let i = z*step + x;
					if(!(i < a.length))
						return rs();
					let e = combinedData[i];
					document.querySelector(`#info`).innerText = `Showing ${i+1}/${combinedData.length}. Please wait calmly!`;
					let tr = document.createElement('tr');
					let td = document.createElement('td');
					td.innerText = `${i+1}.`;
					let td1 = document.createElement('td');
					let td2 = document.createElement('td');
					let td3 = document.createElement('td');
					td1.innerText = e.name;
					let stateInput = document.createElement('input');
					stateInput.type = 'number';
					stateInput.value = e.state;
					let checkBox = document.createElement('input');
					checkBox.type = 'checkbox';
					checkBox.onchange = (ev)=>{
						a[i].inCol = ev.target.checked;
						if(!ev.target.checked)
							stateInput.value = 1;
						else if(ev.target.checked && stateInput.value < 2)
							stateInput.value = 6;
						a[i].state = parseInt(stateInput.value);
						recount();
					};
					stateInput.onkeyup = (ev)=>{
						ev.target.value = (parseInt(ev.target.value) || checkBox.checked?6:1);
						if(!checkBox.checked)
							ev.target.value = 1;
						else if(ev.target.value > 6)
							ev.target.value = 6;
						else if(ev.target.value < 1)
							ev.target.value = 1;
						a[i].state = parseInt(ev.target.value);
						recount();
					}
					stateInput.onchange = (ev)=>{
						if(!checkBox.checked)
							ev.target.value = 1;
						else if(ev.target.value > 6)
							ev.target.value = 6;
						else if(ev.target.value < 1)
							ev.target.value = 1;
						a[i].state = parseInt(ev.target.value);
						recount();
					}
					checkBox.checked = e.inCol;
					td2.append(checkBox, stateInput);
					let linkInput = document.createElement('input');
					linkInput.type = "text";
					linkInput.onkeyup = (ev)=>{
						a[i].link = ev.target.value;
					}
					linkInput.value = e.link;
					let goSpan = document.createElement('Span');
					goSpan.classList.add('go');
					goSpan.innerText = "GO";
					goSpan.onclick = (ev)=>{
						let ax = document.createElement('a');
						ax.style.display = "none";
						ax.target = '_blank';
						ax.href = linkInput.value;
						document.body.append(ax);
						ax.click();
						recount();
					};
					td3.append(linkInput, goSpan);
					tr.style.display = "table-row";
					tr.append(td, td1, td2, td3);
					e.element = tr;
					document.querySelector('table #check').append(tr);
				
				}
				rs();
			});
		});
	}
	this.loaded = true;
	return;
}

// filter:
// [{var: 'name', regx:/[^ ]+/i}, {var: 'state', equal: 1}]
// show every with stage 1 and without any spaces
combinedData.loadOnlyToTable = async function(filter){
	document.querySelector('#info').innerHTML = "Started filtering";
	let table = document.querySelector('table #check');
	let sall = false;
	if(!filter)
		sall = true;
	else if(!Array.isArray(filter))
		sall = true;
	else if(filter.length === 0)
		sall = true;

	if(sall){
		let z;
		let step = 100;
		for(z=0; z < (combinedData.length-1)/step; z += 1){
			await new Promise((rs,rj)=>{
				setTimeout(()=>{
					for(let x = 0; x < step; x++){
						let a = combinedData;
						let i = z*step + x;
						if(!(i < a.length))
							return rs();
						let e = combinedData[i];
						document.querySelector(`#info`).innerText = `Filtering ${i+1}/${combinedData.length}. Please wait calmly!`;
						e.element.style.display = "table-row";
					}
					rs();
				});
			});
		}

		document.querySelector('#info').innerHTML = "ERROR#01 Occured!";
		return;
	}

	let pass = true;
	filter.forEach((e)=>{
		if(!e.var)
			return pass = false;
		if(/!name/i.test(e.var)){
			e.var = 'name';
			if(e.regx)
				e.check = (v)=>{return !e.regx.test(v);};
			if(e.equal)
				e.check = (v)=>{return !(v === e.equal);};
		}else if(/name/i.test(e.var)){
			if(e.regx)
				e.check = (v)=>{return e.regx.test(v);};
			if(e.equal)
				e.check = (v)=>{return (v === e.equal);};
		}else if(/(?:check|checked)/i.test(e.var)){
			e.var = "checked";
			if(e.equal || e.equal === false)
				e.check = (v)=>{return (v===e.equal);};
		}else if(/state/i.test(e.var)){
			e.var = "state";
			if(e.regx)
				e.check = (v)=>{return e.regx.test(v);};
			if(e.equal)
				e.check = (v)=>{return (v===e.equal);};
		}else if(/link/i.test(e.var)){
			e.var = "link";
			if(e.regx)
				e.check = (v)=>{return e.regx.test(v);};
		}
		else if(/num(?:ber)?/i.test(e.var)){
			e.var = "i+2";
			if(e.start && e.end)
				e.check = (v)=>{return ((v > e.start)&&(v < e.end+2));}
		}
		if(!e.check){
			console.error(`One of filters has been wrongly set!`);
			return pass = false;
		}

	});

	console.log('Filters: ', filter);

	if(!pass){
		let z;
		let step = 100;
		for(z=0; z < (combinedData.length-1)/step; z += 1){
			await new Promise((rs,rj)=>{
				setTimeout(()=>{
					for(let x = 0; x < step; x++){
						let a = combinedData;
						let i = z*step + x;
						if(!(i < a.length))
							return rs();
						let e = combinedData[i];
						document.querySelector(`#info`).innerText = `Filtering ${i+1}/${combinedData.length}. Please wait calmly!`;
						e.element.style.display = "table-row";
					}
					rs();
				});
			});
		}
		document.querySelector('#info').innerHTML = "ERROR#03 Occured!";
		return;
	}

	if(!this.loaded)
		this.loadToTable();

	let pm = 0;

	let z;
	let step = 100;
	for(z=0; z < (combinedData.length-1)/step; z += 1){
		await new Promise((rs,rj)=>{
			setTimeout(()=>{
				for(let x = 0; x < step; x++){
					let a = combinedData;
					let i = z*step + x;
					if(!(i < a.length))
						return rs();
					let e = combinedData[i];
					document.querySelector(`#info`).innerText = `Filtering ${i+1}/${combinedData.length}. Found ${pm}. Please wait calmly!`;
					
					let el = e.element;
					let name = e.name;
					let state = e.state;
					let checked = e.inCol;

					let show = true;
					filter.forEach((f)=>{
						if(!f.check(eval(f.var)))
							show = false;
					});
					if(show){
						e.element.style.display = "table-row";
						pm++;
					}
					else
						e.element.style.display = "none";

				}
				rs();
			});
		});
	}
	document.querySelector('#info').innerHTML = `Successfully filtered. Found ${pm} match${pm===1?"":"es"}.`;
}

/**

OLD VERSION

*/

// // filter:
// // [{var: 'name', regx:/[^ ]+/i}, {var: 'state', equal: 1}]
// // show every with stage 1 and without any spaces
// combinedData.loadOnlyToTable = function(filter){
// 	console.log("Filtering by", filter);
// 	document.querySelector('#info').innerHTML = "Filtering";
// 	let table = document.querySelector('table #check');
// 	let sall = false;
// 	if(!filter)
// 		sall = true;
// 	if(!sall){
// 			if(!Array.isArray(filter))
// 				sall = true;
// 			if(filter.length === 0)
// 				sall = true;
// 	}

// 	if(sall){
// 		Array.from(table.getElementsByTagName('tr')).forEach((e)=>{
// 			e.style.display = "table-row";
// 		});
// 		document.querySelector('#info').innerHTML = "ERROR#01 Occured!";
// 		return;
// 	}

// 	let pass = true;
// 	filter.forEach((e)=>{
// 		if(!e.var)
// 			return pass = false;
// 		if(/!name/i.test(e.var)){
// 			e.var = 'name';
// 			if(e.regx)
// 				e.check = (v)=>{return !e.regx.test(v);};
// 			if(e.equal)
// 				e.check = (v)=>{return !(v === e.equal);};
// 		}else if(/name/i.test(e.var)){
// 			if(e.regx)
// 				e.check = (v)=>{return e.regx.test(v);};
// 			if(e.equal)
// 				e.check = (v)=>{return (v === e.equal);};
// 		}else if(/(?:check|checked)/i.test(e.var)){
// 			e.var = "checked";
// 			if(e.equal || e.equal === false)
// 				e.check = (v)=>{return (v===e.equal);};
// 		}else if(/state/i.test(e.var)){
// 			e.var = "state";
// 			if(e.regx)
// 				e.check = (v)=>{return e.regx.test(v);};
// 			if(e.equal)
// 				e.check = (v)=>{return (v===e.equal);};
// 		}else if(/link/i.test(e.var)){
// 			e.var = "link";
// 			if(e.regx)
// 				e.check = (v)=>{return e.regx.test(v);};
// 		}
// 		else if(/num(?:ber)?/i.test(e.var)){
// 			e.var = "i+2";
// 			if(e.start && e.end)
// 				e.check = (v)=>{return ((v > e.start)&&(v < e.end+2));}
// 		}
// 		if(!e.check){
// 			console.error(`One of filters has been wrongly set!`);
// 			return pass = false;
// 		}

// 	});

// 	if(!pass){
// 		Array.from(table.getElementsByTagName('tr')).forEach((e)=>{
// 			e.style.display = "table-row";
// 		});
// 		document.querySelector('#info').innerHTML = "ERROR#03 Occured!";
// 		return;
// 	}

// 	if(!this.loaded)
// 		this.loadToTable();

// 	let pm = 0;

// 	Array.from(table.getElementsByTagName('tr')).forEach((e,i)=>{
		
// 		let tds = Array.from(e.children);
// 		let name = tds[1].innerText;
// 		let checked = tds[2].children.item(0).checked;
// 		let state = parseInt(tds[2].children.item(1).value);
// 		let link = tds[3].children.item(0).value;
// 		let show = true;
// 		filter.forEach((f)=>{
// 			if(!f.check(eval(f.var)))
// 				show = false;
// 		});
// 		if(show){
// 			e.style.display = "table-row";
// 		}
// 		else
// 			e.style.display = "none";
// 	});

// 	document.querySelector('#info').innerHTML = `Successfully filtered. Found ${pm} match${pm===1?"":"es"}.`;

// }

Modals.getFromDoc(document);

((m)=>{
	m.items = {};
	m.items.main = m.childs.item(0);
	m.items.Inputs = m.items.main.getElementsByTagName('input');
	m.items.MainSwitch = m.items.Inputs.namedItem('modal-Filter');
	// NAME
	m.items.NameSwitch = m.items.Inputs.namedItem('modal-Filter-Name');
	m.items.NameMatchSwitch = m.items.Inputs.namedItem('modal-Filter-Name-RX-E');
	m.items.NameMatchInput = m.items.Inputs.namedItem('modal-Filter-Name-RX');
	m.items.NameEqualSwitch = m.items.Inputs.namedItem('modal-Filter-Name-EQ-E');
	m.items.NameEqualInput = m.items.Inputs.namedItem('modal-Filter-Name-EQ');
	m.items.NameInvert = m.items.Inputs.namedItem('modal-Filter-Name-Invert');
	// IN COLLECTION
	m.items.CollectionSwitch = m.items.Inputs.namedItem('modal-Filter-Incol');
	m.items.CollectionInput = m.items.Inputs.namedItem('modal-Filter-Incol-EQ');
	// STATE
	m.items.StateSwitch = m.items.Inputs.namedItem('modal-Filter-State');
	m.items.StateInput = m.items.Inputs.namedItem('modal-Filter-State-EQ');
	// NUMBER
	m.items.NumberSwitch = m.items.Inputs.namedItem('modal-Filter-Num');
	m.items.NumberStart = m.items.Inputs.namedItem('modal-Filter-Num-S');
	m.items.NumberEnd = m.items.Inputs.namedItem('modal-Filter-Num-E');
	// QUANTITY
	m.items.QuantitySwitch = m.items.Inputs.namedItem('modal-Filter-Quan');
	m.items.QuantityInput = m.items.Inputs.namedItem('modal-Filter-Quan-EQ');
	m.items.QuantitySwitch.disabled = true;
	m.items.QuantityInput.disabled = true;
	m.items.MainSwitch.onchange = (ev)=>{
		let newDis = !ev.target.checked;
		// NAME
		m.items.NameSwitch.disabled = newDis;
		m.items.NameMatchSwitch.disabled = (!newDis)?!m.items.NameSwitch.checked:true;
		m.items.NameMatchInput.disabled = (!newDis)?(m.items.NameSwitch.checked?(m.items.NameSwitch.checked?!m.items.NameMatchSwitch.checked:true):true):true;
		m.items.NameEqualSwitch.disabled = (!newDis)?!m.items.NameSwitch.checked:true;
		m.items.NameEqualInput.disabled = (!newDis)?(m.items.NameSwitch.checked?(m.items.NameSwitch.checked?!m.items.NameEqualSwitch.checked:true):true):true;
		m.items.NameInvert.disabled = (!newDis)?!m.items.NameSwitch.checked:true;
		// COLLECTION
		m.items.CollectionSwitch.disabled = newDis;
		m.items.CollectionInput.disabled = (!newDis)?!m.items.CollectionSwitch.checked:true;
		// STATE
		m.items.StateSwitch.disabled = newDis;
		m.items.StateInput.disabled = (!newDis)?!m.items.StateSwitch.checked:true;
		// NUMBERS
		m.items.NumberSwitch.disabled = newDis;
		m.items.NumberStart.disabled = (!newDis)?!m.items.NumberSwitch.checked:true;;
		m.items.NumberEnd.disabled = (!newDis)?!m.items.NumberSwitch.checked:true;;

	}
	m.items.MainSwitch.checked = false;
	m.items.MainSwitch.click();
	m.items.NameSwitch.onchange = (ev)=>{
		let newDis = !ev.target.checked;
		m.items.NameMatchSwitch.disabled = newDis;
		m.items.NameMatchInput.disabled = (!newDis)?!m.items.NameMatchSwitch.checked:true;
		m.items.NameEqualSwitch.disabled = newDis;
		m.items.NameEqualInput.disabled = (!newDis)?!m.items.NameEqualSwitch.checked:true;
		m.items.NameInvert.disabled = newDis;

	}
	m.items.NameSwitch.checked = false;
	m.items.NameSwitch.click();
	m.items.NameMatchSwitch.onchange = (ev)=>{
		m.items.NameMatchInput.disabled = !ev.target.checked;
		if(ev.target.checked && m.items.NameEqualSwitch.checked)
			m.items.NameEqualSwitch.click();
	}
	m.items.NameMatchSwitch.checked = false;
	m.items.NameMatchSwitch.click();
	m.items.NameEqualSwitch.onchange = (ev)=>{
		m.items.NameEqualInput.disabled = !ev.target.checked;
		if(ev.target.checked && m.items.NameMatchSwitch.checked)
			m.items.NameMatchSwitch.click();
	}
	m.items.NameEqualSwitch.checked = false;
	m.items.NameEqualSwitch.click();
	m.items.CollectionSwitch.onchange = (ev)=>{
		m.items.CollectionInput.disabled = !ev.target.checked;
	}
	m.items.StateSwitch.onchange = (ev)=>{
		m.items.StateInput.disabled = !ev.target.checked;
	}
	m.items.NumberSwitch.onchange = (ev)=>{
		m.items.NumberStart.disabled = !ev.target.checked;
		m.items.NumberEnd.disabled = !ev.target.checked;
	}

	m.items.main.querySelector('#filter2').onclick = (ev)=>{
		m.hide();
		setTimeout(()=>{
			let filters = [];
			if(!m.items.MainSwitch.checked){
				combinedData.loadOnlyToTable(filters);
				return;
			}
			if(m.items.NameSwitch.checked){
				let nF = {};
				nF.var = `${m.items.NameInvert.checked?"!":""}name`;
				if(m.items.NameMatchSwitch.checked){
					let rx = m.items.NameMatchInput.value || "/.*/";
					if(!/\/[^\n\r]*\//.test(rx))
						rx = `/${rx}/`;
					eval(`nF.regx = new RegExp(${rx})`);
				}
				else if(m.items.NameEqualSwitch.checked){
					console.log('NameEqualSwitch');
					nF.equal = m.items.NameEqualInput.value || "";
				}
				if(nF.regx || nF.equal)
					filters.push(nF);
			}
			if(m.items.CollectionSwitch.checked){
				let cF = {};
				cF.var = `check`;
				cF.equal = m.items.CollectionInput.checked;
				filters.push(cF);
			}
			if(m.items.StateSwitch.checked){
				let sF = {};
				sF.var = `state`;
				sF.equal = parseInt(m.items.StateInput.value);
				if(!isNaN(sF.equal))
					filters.push(sF);
			}
			if(m.items.NumberSwitch.checked){
				let nuF = {};
				nuF.var = `num`;
				nuF.start = parseInt(m.items.NumberStart.value);
				nuF.end = parseInt(m.items.NumberEnd.value);
				if(nuF.end < nuF.start)
					nuF.end = nuF.start+1;
				if(!isNaN(nuF.start)&&!isNaN(nuF.end))
					filters.push(nuF);
			}
			combinedData.loadOnlyToTable(filters);
		},50);
	}
})(Modals.items[0]);

document.querySelector('#filter').onclick = ()=>{
	let m = Modals.items[0];
	m.show();
	if(!m.items)
		return;
	let its = m.items;
	its.NumberStart.value = its.NumberStart.value || 1;
	its.NumberEnd.value = its.NumberEnd.value || combinedData.length;
	its.StateInput.value = its.StateInput.value || 5;
}

/**

OLD VERSION

*/

combinedData.toFile = function(){
	let r="";
	this.forEach(e=>{
		r += `${e.state}.${e.inCol}@${e.link}\n`;
	});
	return r;
}

let recount = ()=>{
	let checked = s1 = s2 = s3 = s4 = s5 = s6 = s7 = 0;
	let all  = combinedData.length;
	combinedData.forEach(e=>{
		if(e.inCol && e.state !== 2)
			checked++;
		eval(`s${e.state}++`);
	});
	document.querySelector('#count').innerText = 
	`In Collection: ${checked}/${all} (1:${s1}, 2:${s2}, 3:${s3}, 4:${s4}, 5:${s5}, 6:${s6}, 7:${s7})`;
}

document.querySelector('span#save').onclick = ()=>{
	recount();
	saveFile(combinedData);
}

let saveFile = function(cd){
	let json_object = {data: cd.toFile(), path:'saveData.txt'};
	let xhrS = new XMLHttpRequest();
	xhrS.open('POST', "save.php");
	xhrS.onreadystatechange = ()=>{
		console.log(xhrS.status, xhrS.readyState);
	}
	xhrS.setRequestHeader('Content-Type', 'application/json');
	xhrS.send(JSON.stringify(json_object));
	let json_object2 = {data: cd.toFile(), path:'saveData.txt'};
	let xhrS2 = new XMLHttpRequest();
	xhrS2.open('POST', "./../gameList/save.php");
	xhrS2.onreadystatechange = ()=>{
		console.log(xhrS2.status, xhrS2.readyState);
	}
	xhrS2.setRequestHeader('Content-Type', 'application/json');
	xhrS2.send(JSON.stringify(json_object2));
}
