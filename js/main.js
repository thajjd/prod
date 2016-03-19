Skip to content
Personal Open source Business Explore
Sign upSign inPricingBlogSupport
 Watch 1  Star 0  Fork 0 bellebo/skitspel
 Code  Issues 0  Pull requests 0  Pulse  Graphs
Branch: master Find file Copy pathskitspel/client/js/main.js
f6651bb  6 hours ago
@bellebo bellebo init
1 contributor
RawBlameHistory     284 lines (247 sloc)  7.76 KB
var socket = io();
var keyMap={left:false,up:false,right:false,down:false};

var clientplayers=[];
var particles=[];
var bullets=[];
var mapInfo;
var collisionRectangles=[];

var rectC;
var cameraOffset={x:0,y:0};

var plr;
var player;

var clientFps=1000/60;
var serverFps;
var newTime;
var accumilator=0;
var lastFrameTime;
var oldTime;

var crosshairImage=new Image();

var mousePos;
var id;
var signedIn=false;
var c;

//initilize
$(function(){
  
crosshairImage.src="/textures/crosshair.png";
c = document.getElementById("canvas");
resizeCanvas(window);
document.onkeydown = keydown;
document.onkeyup = keyup;
window.onresize = resizeCanvas;
c.onclick= mouseClickCanvas;

$('#canvas').hide();

$('#canvas').mousemove(function(e){
    mousePos={
        x: ((e.clientX - rectC.left)*(960/rectC.width)),
	y: ((e.clientY - rectC.top)*(540/rectC.height))
    };
});

$('#button').click(function() {
    joinGame($('#nameTxt').val(),$('#roomTxt').val(),$('#mapTxt').val());
});
});



function getPlayers (players){
   for (var i=0;i<players.length;i++){
     for(var i2=0;i2<clientplayers.length;i2++){
	if (clientplayers[i2].id==players[i].id){
	  clientplayers[i2].rect.x=players[i].x;clientplayers[i2].rect.y=players[i].y;
      }
    }
  }
  //render();
}

var start=setInterval(function (){
  newTime = new Date().getTime();
  lastFrameTime = newTime-oldTime;
  oldTime=newTime;
  var multiplicator=lastFrameTime/serverFps;
  
  collisionRectangles.splice(mapInfo.map.length,collisionRectangles.length-mapInfo.map.length);
  for (var i =0;i<clientplayers.length;i++){
    this.collisionRectangles[mapInfo.map.length+i]={id:clientplayers[i].id, x:clientplayers[i].rect.x,y:clientplayers[i].rect.y,width: clientplayers[i].rect.width,height: clientplayers[i].rect.height};
  }
  
  player.keyMap=keyMap;
  accumilator+=lastFrameTime;
  while(accumilator>clientFps){
    player.update(collisionRectangles,1);
    accumilator-=clientFps;
}
  
//   for (var i =0;i<clientplayers.length;i++){
//   if (clientplayers[i].id==player.id)
//   	player.lurp(clientplayers[i].rect);
//   }
  
  for(var i =0;i<bullets.length;i++){
    bullets[i].update(multiplicator);
  }
  for(var i =0;i<particles.length;i++){
    particles[i].update(multiplicator);
    if (particles[i].remove==true){
      particles.splice(i,1);
    }
  }
  render();
  
},clientFps);

function render (){
  calculateCameraOffset();
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#AFAFAF";
  ctx.fillRect(0,0,960,540);
  
//  ctx.fillStyle = "#000000";
//  ctx.fillRect(player.rect.x-cameraOffset.x,player.rect.y-cameraOffset.y,30,50);
  for (var i =0;i<clientplayers.length;i++){
    ctx.fillStyle = clientplayers[i].color;
    ctx.fillRect(clientplayers[i].rect.x-cameraOffset.x,clientplayers[i].rect.y-cameraOffset.y,30,50);
  }
  for (var i =0;i<bullets.length;i++){
    ctx.fillStyle = "#000000";
    ctx.fillRect(bullets[i].rect.x-cameraOffset.x,bullets[i].rect.y-cameraOffset.y,bullets[i].rect.width,bullets[i].rect.height);
  }
  for (var i =0;i<mapInfo.map.length;i++){
    ctx.fillStyle=mapInfo.color;
    ctx.fillRect(mapInfo.map[i].x-cameraOffset.x,mapInfo.map[i].y-cameraOffset.y,mapInfo.map[i].width,mapInfo.map[i].height);
  }
  for (var i =0;i<clientplayers.length;i++){
    ctx.fillStyle = "#000000";
    ctx.font="bold 20px Arial";
    ctx.fillText(clientplayers[i].name,(clientplayers[i].rect.x-cameraOffset.x+15)-(ctx.measureText(clientplayers[i].name).width/2),clientplayers[i].rect.y-10-cameraOffset.y);
  }
  for(var i=0;i<particles.length;i++){
    ctx.fillStyle = particles[i].color;
    ctx.fillRect(particles[i].rect.x-cameraOffset.x,particles[i].rect.y-cameraOffset.y,particles[i].rect.width,particles[i].rect.height);
  }
  var width=32;
  ctx.drawImage(crosshairImage,mousePos.x-width/2,mousePos.y-width/2,width,width);
}

$(socket.on('servers',function(servers){
  var serverTable = document.getElementById('serverTable');
  serverTable.innerHTML+=
"<tr> \
 <td> Server </td> \
 <td> Antal spelare </td> \
 <td> Bana </td> \
</tr>"

  for(var i =0;i<servers.length;i++){
    serverTable.innerHTML += 
"<tr> \
 <td>"+servers[i].room+"</td> \
 <td>"+servers[i].playerCount+"</td> \
 <td>"+servers[i].map+"</td> \
</tr>";
  }
  console.log(serverTable);
}));

socket.on('players',function(plrs){
  getPlayers(plrs);
});

socket.on('map',function (mp){
  mapInfo=mp;
  collisionRectangles=mapInfo.map.concat();
});

socket.on('addParticle',function (particleData){
  spawnParticles(particleData.pos,particleData.color,2,particleData.amount,800);
});

socket.on('addBullet',function (blt){
  bullets[bullets.length]=new bullet(blt.id,blt.playerid,{x:blt.rect.x,y:blt.rect.y},blt.direction);
});
socket.on('rmBullet',function (blt){
  for (var i =0;i<bullets.length;i++){
    if(bullets[i].id===blt.id){
      bullets.splice(i,1);
      i--;
    }
  }
});
socket.on('addPlayer',function (plr){
  clientplayers[clientplayers.length]={id:plr.id,rect:{x:plr.rect.x,y:plr.rect.y,width:plr.rect.width,height:plr.rect.height},color:plr.color,name:plr.name};
});
socket.on('rmPlayer',function (plr){
for(var i=0;i<clientplayers.length;i++){
  if (clientplayers[i].id==plr.id)
    clientplayers.splice(i,1);
}
});
socket.on('onConnect',function (data){
  serverFps=data.fps;
  id=data.id;
  for (var i = 0;i<data.players.length;i++){
    clientplayers[clientplayers.length]={id:data.players[i].id,rect:{x:data.players[i].rect.x,y:data.players[i].rect.y,width:data.players[i].rect.width,height:data.players[i].rect.height},color:data.players[i].color,name:data.players[i].name};
    if (clientplayers[i].id===id){
      plr=clientplayers[i];
      player=new player(id,data.players[i].name,data.players[i].rect);
    }
  }
});

function joinGame(name,room,map)
{
    socket.emit('joinGame',{name:name,room:room,mapPath:map});
//     $('#button').hide();
//     $('#nameTxt').hide();
//     $('#roomTxt').hide();
//     $('#serverTable').hide();
    $('#serverDiv').hide();
    $('#canvas').show();
}

function calculateCameraOffset(){
//  cameraOffset.x=player.rect.x-(960/2)-(player.rect.width/2);
//  cameraOffset.y=player.rect.y-(540/2)-(player.rect.height/2);
     cameraOffset.x=plr.rect.x-(960/2)-(plr.rect.width/2);
     cameraOffset.y=plr.rect.y-(540/2)-(plr.rect.height/2);
}

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

function spawnParticles(pos,color,speed,amount,timeout){
for(var i=0;i<amount;i++){
  particles.push(new particle(pos,color,speed,timeout));
}
}
var particle=function(pos,color,speed,timeout){
  this.color=color;
  this.speed=speed*Math.random();
  this.timeOut=timeout+((Math.random()-0.5)*(0.5*timeout));
  this.time=0;
  this.remove=false;
  this.rect={x:pos.x,y:pos.y,width:3,height:3};
  this.vel={x:(Math.random()*2)-1,y:(Math.random()*2)-1};
  var length=Math.sqrt(Math.pow(Math.abs(this.vel.x),2)+Math.pow(Math.abs(this.vel.y),2));
  this.vel={x:this.vel.x/length,y:this.vel.y/length};
  this.update=function(mul){
    this.time+=mul*(1000/60);
    this.rect.x+=this.vel.x*this.speed;
    this.rect.y+=this.vel.y*this.speed;
    if(this.time>this.timeOut)
      this.remove=true;
  }
}

function resizeCanvas(e){
  c.style.height=window.innerHeight;
  c.style.width=window.innerWidth;
  rectC=c.getBoundingClientRect();
}

function mouseClickCanvas(e){
  socket.emit('push test',{x:mousePos.x+cameraOffset.x,y:mousePos.y+cameraOffset.y});
}

function keydown(e){
if (e.keyCode==37)
  keyMap.left=true;
else if (e.keyCode==38)
  keyMap.up=true;
else if (e.keyCode==39)
  keyMap.right=true;
else if (e.keyCode==40)
  keyMap.down=true;
socket.emit('input',keyMap);
}

function keyup(e){
if (e.keyCode==37)
  keyMap.left=false;
else if (e.keyCode==38)
  keyMap.up=false;
else if (e.keyCode==39)
  keyMap.right=false;
else if (e.keyCode==40)
  keyMap.down=false;
socket.emit('input',keyMap);
}
Status API Training Shop Blog About
© 2016 GitHub, Inc. Terms Privacy Security Contact Help