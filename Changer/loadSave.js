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
						return;
					let e = combinedData[i];
					document.querySelector(`#info`).innerText = `Showing ${i+1}/${combinedData.length}. Please wait calmly!`
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
							stateInput.value = 5;
						a[i].state = parseInt(stateInput.value);
						recount();
					};
					stateInput.onkeyup = (ev)=>{
						ev.target.value = (parseInt(ev.target.value) || checkBox.checked?5:1);
						if(!checkBox.checked)
							ev.target.value = 1;
						else if(ev.target.value > 5)
							ev.target.value = 5;
						else if(ev.target.value < 1)
							ev.target.value = 1;
						a[i].state = parseInt(ev.target.value);
						recount();
					}
					stateInput.onchange = (ev)=>{
						if(!checkBox.checked)
							ev.target.value = 1;
						else if(ev.target.value > 5)
							ev.target.value = 5;
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
					document.querySelector('table #check').append(tr);
				
				}
				rs();
			});
		});
		console.log(`Showed ${z}`);
	}
	console.log('und');
}