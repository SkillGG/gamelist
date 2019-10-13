let findModals = (d, query)=>{
	return d.querySelectorAll(query?query:"modal");
}

let Modals = {
	items: [],
	getFromDoc: function(d){
		let fm = findModals(d);
		if(fm){
			Array.from(fm).forEach((e)=>{
				this.items.push(new Modal(e));
			})
		}
	},
	getByQuery: function(query){
		let r = null;
		this.items.forEach((e)=>{
			if(!r)
				if(e.matches(query))
					r = e;
		});
		return r;
	},
	getByQueryAll: function(query){
		let r = [];
		this.items.forEach((e)=>{
		if(e.matches(query))
			r.push(e);
		});
		return (!!r.length)?r:null;
	},
	getById: function(id){
		return this.getByQuery(`#${id}`);
	},
	getByIdAll: function(id){
		return this.getByQueryAll(`#${id}`);
	}
};

class Modal {
	constructor(el){
		this.element = el;
		this.childs = el.children;
	}
}

Modal.prototype.show = function() {
	this.element.style.display = "block";
};

Modal.prototype.hide = function(){
	this.element.style.display = "none";
}