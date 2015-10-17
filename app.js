function Player(x, y, angle) {
	this.x = x;
	this.y = y;
	this.angle = angle;
}

function Map(size) {
	this.wallSize = 32;
	this.size = size;
	this.grid = new Array(size * size);
	this.randomize();
}
Map.prototype.randomize = function() {
	for (var i = this.grid.length - 1; i >= 0; i--) {
		this.grid[i] = parseInt(Math.random()*2);
	}
	this.set(6,6,0);
	this.set(5,6,0);
	this.set(6,5,0);
	this.set(5,5,0);
	this.set(6,7,0);
	this.set(7,6,1);

	this.set(6,7,0);
	this.set(6,8,0);
	this.set(6,9,1);
};
Map.prototype.get = function(x,y) {
	return this.grid[x + y*this.size];
};
Map.prototype.set = function(x,y, val) {
	this.grid[x + y*this.size] = val;
};

Map.prototype.raycast = function(x,y,rayAngle) {
	
	//Position in grid map
	var mapX = parseInt(x / this.wallSize);
	var mapY = parseInt(y / this.wallSize);

	//Calculate the startDistance
	var stepX;
	var stepY;
	var angle;
	var startDistVertical;
	var startDistHorizontal;
	if(rayAngle > Math.PI + Math.PI/2) {
		angle = 2*Math.PI - rayAngle ;

		startDistVertical =  (this.wallSize - (x % this.wallSize) ) / Math.cos(angle);
		startDistHorizontal = (y % this.wallSize) / Math.sin(angle);
		
		stepX = 1;
		stepY = -1;
	}
	else if(rayAngle > Math.PI) {
		angle = rayAngle - Math.PI;
		startDistVertical =  (x % this.wallSize)  / Math.cos(angle);
		startDistHorizontal = (y % this.wallSize) / Math.sin(angle);

		stepX = -1;
		stepY = -1;
		
	}
	else if(rayAngle > Math.PI/2) {
		angle = Math.PI - rayAngle;

		startDistVertical =  (x % this.wallSize)  / Math.cos(angle);
		startDistHorizontal = (this.wallSize - (y % this.wallSize) ) / Math.sin(angle);

		stepX = -1;
		stepY = 1;
	}
	else {
		angle = rayAngle;
		startDistVertical =  (this.wallSize - (x % this.wallSize) ) / Math.cos(angle);
		startDistHorizontal = (this.wallSize - (y % this.wallSize) ) / Math.sin(angle);

		stepX = 1;
		stepY = 1;
	}
	
	//console.log("startDistVertical=" + startDistVertical + "| startDistHorizontal=" + startDistHorizontal + "x=" + x + "| y=" + y + "|angle=" + angle);


	// First check with startDist and deltaDist
	var distVertical = 0;
	var distHorizontal = 0;

	var deltaVertical = this.wallSize / Math.cos(angle);
	var deltaHorizontal = this.wallSize / Math.sin(angle);

	if(startDistVertical < startDistHorizontal) {
		distVertical = startDistVertical;
		mapX += stepX;
		if(this.get(mapX, mapY))
			return {dist:startDistVertical, wallX:(startDistVertical*Math.sin(angle)*stepY + y) - mapY * this.wallSize};

		while(mapX < this.size && mapY < this.size && mapX >= 0 && mapY >= 0 && 
			distVertical + deltaVertical < startDistHorizontal) 
		{
				distVertical += deltaVertical;
				mapX += stepX;
				if(this.get(mapX, mapY))
					return {dist:distVertical, wallX:(distVertical*Math.sin(angle)*stepY + y) - mapY * this.wallSize};
		}

		distHorizontal = startDistHorizontal;
		mapY += stepY;
		if(this.get(mapX, mapY))
			return {dist:distHorizontal, wallX:(distHorizontal*Math.cos(angle)*stepX + x) - mapX * this.wallSize};
	}
	else {
		distHorizontal = startDistHorizontal;
		mapY += stepY;
		if(this.get(mapX, mapY))
			return {dist:startDistHorizontal, wallX:(distHorizontal*Math.cos(angle)*stepX + x) - mapX * this.wallSize};

		while(mapX < this.size && mapY < this.size && mapX >= 0 && mapY >= 0 && 
			distHorizontal + deltaHorizontal < startDistVertical) 
		{
				distHorizontal += deltaHorizontal;
				mapY += stepY;
				if(this.get(mapX, mapY))
					return {dist:distHorizontal, wallX:(distHorizontal*Math.cos(angle)*stepX + x) - mapX * this.wallSize};
		}

		distVertical = startDistVertical;
		mapX += stepX;
		if(this.get(mapX, mapY))
			return {dist:distVertical, wallX:(distVertical*Math.sin(angle)*stepY + y) - mapY * this.wallSize};
	}

	// Second check if ray dist > startDist
	while(mapX < this.size && mapY < this.size && mapX >= 0 && mapY >= 0) {
		if(distVertical + deltaVertical < distHorizontal + deltaHorizontal) {
			distVertical += deltaVertical;
			mapX += stepX;
			if(this.get(mapX, mapY)) {
				return {dist:distVertical, wallX:(distVertical*Math.sin(angle)*stepY + y) - mapY * this.wallSize};
			}
		}
		else {
			distHorizontal += deltaHorizontal;
			mapY += stepY;
			if(this.get(mapX, mapY)) {
				return {dist:distHorizontal, wallX:(distHorizontal*Math.cos(angle)*stepX + x) - mapX * this.wallSize};
			}
		}
	}


	//no obstacle found
	return {dist:1000, wallX:null};

};


function Screen(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");

	this.id = this.ctx.getImageData(0, 0, 1, 1);
	this.id.data[3] = 255;

	this.image = new Image();
	this.image.src = "wallTexture.jpg";
}

Screen.prototype.setPixel = function(x,y,r,g,b) {
    this.id.data[0] = r;
    this.id.data[1] = g;
    this.id.data[2] = b;
    this.ctx.putImageData(this.id, x, y);
};

Screen.prototype.setPixelRandomColor = function(x,y) {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);

    this.setPixel(x,y,r,g,b);
};

//Green circle
Screen.prototype.setCircle = function(x,y,radius) {
	this.ctx.beginPath();
	this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	this.ctx.fillStyle = 'green';
	this.ctx.fill();
	this.ctx.lineWidth = 5;
	this.ctx.strokeStyle = '#003300';
	this.ctx.stroke();
};
Screen.prototype.drawLine = function(x1, y1, x2, y2, lineWidth) {
	this.ctx.lineWidth = lineWidth;
	this.ctx.beginPath();
	this.ctx.moveTo(x1, y1);
	this.ctx.lineTo(x2,y2);
	this.ctx.stroke();
};

Screen.prototype.render = function(map, player) {

	this.ctx.clearRect(0, 0, canvas.width, canvas.height);


	this.drawMinimapAndScene();
	
	requestAnimationFrame(this.render.bind(this));
};

Screen.prototype.drawMinimapAndScene = function() {
	var sizeBlock = 32;

	var ratioMapToMinimap = sizeBlock/map.wallSize;
	
	var pxMinimap = player.x * ratioMapToMinimap;
	var pyMinimap = player.y * ratioMapToMinimap;
	
	//draw raycast lines
	for (var i = -1; i <= 1; i+=0.002) {
		var tempAngle = (player.angle +i)%(2*Math.PI);
		if(tempAngle < 0)
			tempAngle = tempAngle + 2*Math.PI;

		
		//Draw the 3dLike wall
		
		var ray = map.raycast(player.x,player.y,tempAngle);
		//this.ctx.strokeStyle = "rgb(255,"+parseInt(ray.wallX)*5 +",0)";
		//this.drawLine((i+1)*500, 1000/ray.dist, (i+1)*500, 10000/ray.dist, 10);
		this.ctx.drawImage(this.image, ray.wallX%this.image.width, 0, 1, this.image.height, (i+1)*500, 1000/ray.dist, 1, 10000/ray.dist);
		
		this.ctx.strokeStyle = 'black';
		this.drawLine(pxMinimap, pyMinimap,pxMinimap + Math.cos(tempAngle)*ray.dist* ratioMapToMinimap, pyMinimap + Math.sin(tempAngle)*ray.dist* ratioMapToMinimap, 1);
	};


	//Draw wall
	for (var x = 0; x < map.size; x++) {
		for (var y = 0; y < map.size; y++) {
			if(map.get(x,y)) {
				this.ctx.fillStyle = 'gray';
				this.ctx.fillRect(x*sizeBlock,y*sizeBlock,sizeBlock,sizeBlock); 
			}
		}	
	}

	//Draw Player
	this.setCircle(pxMinimap, pyMinimap, sizeBlock/10);

	//draw direction line
	this.ctx.strokeStyle = 'red';
	this.drawLine(pxMinimap, pyMinimap,pxMinimap + Math.cos(player.angle)*map.raycast(player.x,player.y,player.angle)* ratioMapToMinimap, pyMinimap + Math.sin(player.angle)*map.raycast(player.x,player.y,player.angle)* ratioMapToMinimap, 2);



};



// Key listener
window.addEventListener('keydown',doKeyDown,true);
function doKeyDown(evt){
	var dy = 3;
	var dx = 3;
	switch (evt.keyCode) {
		case 38:  /* Up arrow was pressed */
			player.x += Math.cos(player.angle)*2;
			player.y += Math.sin(player.angle)*2
			break;
		case 40:  /* Down arrow was pressed */
			player.x -= Math.cos(player.angle)*2;
			player.y -= Math.sin(player.angle)*2
			break;
		case 37:  /* Left arrow was pressed */

			player.angle -= 0.1;
			if(player.angle < 0)
				player.angle = 2*Math.PI;
			break;
		case 39:  /* Right arrow was pressed */
			player.angle += 0.1;
			if(player.angle > 2*Math.PI)
				player.angle = 0;
			break;
	}
}

var canvas = document.getElementById("canvas");
var w = new Screen(canvas);
var map = new Map(10);
var player = new Player(150,150,Math.PI/2 + Math.PI/4);
w.render(map,player);



