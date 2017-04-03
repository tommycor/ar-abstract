function Raf() {

	this.loop = this.loop.bind(this);
	this.start = this.start.bind(this);
	this.stop = this.stop.bind(this);
	this.control = this.control.bind(this);

	this.toRefresh = [];

	window.addEventListener('keydown', this.control);

}

Raf.prototype.register = function( callback ) {

	this.toRefresh.push(callback);

}

Raf.prototype.start = function() {

	this.loop();

}

Raf.prototype.stop = function() {

	cancelAnimationFrame(this.request);

}

Raf.prototype.loop = function() {

	var i;
	for( i = 0 ; i < this.toRefresh.length ; i++ ) {
		this.toRefresh[i]();
	}

	this.request = requestAnimationFrame(this.start);

}

Raf.prototype.control = function(event) {
	if (event.keyCode === 0 || event.keyCode === 32) {

		if (this.request != null)
			this.stop();
		else
			this.start();

	}
};

module.exports = new Raf();




	
