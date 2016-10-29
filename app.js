"use strict";
const ovApi = require('./libs/9292api.js');
const flowProcessor = require('./libs/flowProcessor.js');

class App{

	constructor(){
		this.init = this._onExportsInit.bind(this);
		var flow = new flowProcessor();
	}

	_onExportsInit(){
		Homey.log('Initialize ap');
	}
		
}


module.exports = new App(); 