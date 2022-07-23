function toggleDiv(id)
	{
		var div = document.getElementById(id);
		if(div.style.display == 'none')
		{
			div.style.display = 'block';
			div.parentNode.getElementsByClassName('toggleButton')[0].innerHTML = div.parentNode.getElementsByClassName('toggleButton')[0].innerHTML.replace(/\[\+\]/, '[-]');
		}
		else
		{
			div.style.display = 'none';
			div.parentNode.getElementsByClassName('toggleButton')[0].innerHTML = div.parentNode.getElementsByClassName('toggleButton')[0].innerHTML.replace(/\[-\]/, '[+]');
		}
		
	}
	 /////////////   CANVAS STUFF     //////////////

	var canvas, canvas2, ctx;
	var resizeCanvas=false;
	
	var invertedAxes = false;
	
	var pixelsPerUnit = 8;
	
	if(pixelsPerUnit<3)
	{
		resizeCanvas = true;
		alert('1 unit should be at least 3 pixels wide (2 pixels used for grid).\Increasing value to 3 pixels.');
	}
	else if(pixelsPerUnit>8)
	{
		resizeCanvas = true;
		alert('Resizing canvas (originally designed for 8 pixel per unit)');	
	}
	var xa = 8*pixelsPerUnit;
	var ya = 11*pixelsPerUnit;
	var xb = xa + pixelsPerUnit*106;
	var yb = ya + 17*pixelsPerUnit;
	var axl = 6*pixelsPerUnit;
	var penDown = false;
	var evCntr = 0;
	var color1 = 'black';
	var color2 = 'white';

	var i, j;
	var pixArr = new Array(17);
	for (i=0; i<17; ++i)
	{
		pixArr[i] = new Array(106);
		for(j=0; j<106; ++j)
			pixArr[i][j] = 0;
	}
	
	var isPixArrUpToDate = true;
	
	window.addEventListener('load', canvasApp, false);	

 //   Init canvas                                             //
	function canvasApp()
	{
		canvas=document.getElementById("canvas");
		if(resizeCanvas)
		{
			if(pixelsPerUnit<3)
				pixelsPerUnit = 3;
			else
			{
				canvas.width = Math.ceil(canvas.width*pixelsPerUnit/8);
				canvas.height = Math.ceil(canvas.height*pixelsPerUnit/8);
			}
		}
		canvas2 = document.getElementById("canvas2");
		ctx=canvas.getContext("2d");
		
		canvas.addEventListener('keydown',  function (e) {keyboardHndlr(e);}, true);

		
		canvas.addEventListener("mousemove", function (e) {
			mouseHndlr('move', e)
		}, false);
		canvas.addEventListener("mousedown", function (e) {
			mouseHndlr('down', e)
		}, false);
		canvas.addEventListener("mouseup", function (e) {
			mouseHndlr('up', e)
		}, false);
		canvas.addEventListener("mouseout", function (e) {
			mouseHndlr('out', e)
		}, false);
		
		canvas.oncontextmenu = function (e) {
			e.preventDefault();
		};
		
		var goIA = document.getElementById('go_invertAxes');
		if(goIA && goIA.checked==true)
			goIA.checked = false;
		drawAxes(invertedAxes);
		drawGrid();
		clearGrid();
		
		var urlNum;
		var hash = window.location.hash;
		if(hash.length>1)
		{
			urlNum = hash.replace(/[^0-9]/g, '');
			document.getElementById('numTA').value = urlNum;
			num2Graph(urlNum);
		}
	
	}
	
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Select brush color for first mouse button (other buttons use second color)  //
	///////////////////////////////////////////////////////////////////////////////////
	function chooseColor(c)
	{
		if(c==0)
		{
			color1 = 'white';
			color2 = 'black';
			document.getElementById('go_black').style.borderColor = '#00F';
			document.getElementById('go_white').style.borderColor = '#F00';
		}
		else
		{
			color1 = 'black';
			color2 = 'white';	
			document.getElementById('go_black').style.borderColor = '#F00';
			document.getElementById('go_white').style.borderColor = '#00F';
		}
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Handler for keyboard events                                                 //
	///////////////////////////////////////////////////////////////////////////////////
	function keyboardHndlr(e)
	{
		if(e.keyCode==38)
		{
			moveUp();
			if(evCntr<2)
				++evCntr;
			else if(evCntr==2)
				;
			else
				evCntr = 0;
			e.preventDefault();
		}
		else if(e.keyCode==40)
		{
			moveDown();
			if(evCntr>=2 && evCntr<4)
				++evCntr;
			else
				evCntr = 0;
			e.preventDefault();
		}
		else if(e.keyCode==37)
		{
			moveLeft();
			if(evCntr==4 || evCntr==6)
				++evCntr;
			else
				evCntr = 0;
			e.preventDefault();
		}
		else if(e.keyCode==39)
		{
			moveRight();
			if(evCntr==5 || evCntr==7)
				++evCntr;
			else
				evCntr = 0;
			e.preventDefault();
		}
		else if(e.keyCode==66 && evCntr==8)
			++evCntr;
		else if(e.keyCode==65 && evCntr==9)
			++evCntr;
		else
			evCntr = 0;
	
		if(e.keyCode==82)
		{
			resetGraph();
		}
		if(evCntr==10)
		{

//alert(':-)');
			runTests();
			evCntr = 0;
		}
		
//		e.preventDefault();
	}

	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Handler for mouse events                                                    //
	///////////////////////////////////////////////////////////////////////////////////	
	function mouseHndlr(res, e)
	{
		var currX = e.pageX - canvas.offsetLeft;
		var currY = e.pageY - canvas.offsetTop;
		
		if(currX >= xa && currX < xb && currY >= ya && currY < yb)
		{
			isPixArrUpToDate = false;
			
			if (res == 'down')
			{
				penDown = true;
				// draw 1 pixel
				if(e.which == 1)
				{
					ctx.fillStyle = color1;
				}
				
/////////////////////
/* // middle mouse button - pixel info
				else if(e.which == 2)
				{
					var imgData = ctx.getImageData(currX, currY, 1, 1);
					alert('x='+currX+' y='+currY+'\nR:'+imgData.data[0] + ' G:'+imgData.data[1] + ' B:'+imgData.data[2] + ' A:'+imgData.data[3]);
					e.preventDefault();			
				}
*/
/////////////////////
				
				else
				{
					ctx.fillStyle = color2;
				}
				ctx.fillRect(Math.floor(currX/pixelsPerUnit)*pixelsPerUnit+1, Math.floor(currY/pixelsPerUnit)*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
				
			}
			if (res == 'up' || res == "out") 
			{
				penDown = false;
			}
			if (res == 'move') 
			{
				if (penDown)
				{
					// draw under mouse
					ctx.fillRect(Math.floor(currX/pixelsPerUnit)*pixelsPerUnit+1, Math.floor(currY/pixelsPerUnit)*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
				}
			}
		}
		else
		{
			penDown = false;
		}
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Store canvas in array pixArr[]                                              //
	///////////////////////////////////////////////////////////////////////////////////
	function canvas2arr()
	{
		var binStr = '';
//		var str = '';
		var imgData = ctx.getImageData(xa, ya, xb-xa, yb-ya);
		var i, j; 
		
		for (i=0; i<17; ++i)
		{
			for(j=0; j<106; ++j)
			{
				if(imgData.data[((i*pixelsPerUnit+pixelsPerUnit/2)*106*pixelsPerUnit+j*pixelsPerUnit+pixelsPerUnit/2)*4] == 255)
				{
					pixArr[i][j] = 0; // probably white pixel in center of "big" pixel; [R,G,B,A]==[255,?,?,?]
					binStr += '0';
				}
				else
				{
					pixArr[i][j] = 1; // otherwise should be black...
					binStr += '1';
				}
//				str += imgData.data[((i*pixelsPerUnit+pixelsPerUnit/2)*106*pixelsPerUnit+j*pixelsPerUnit+pixelsPerUnit/2)*4] +',';
			}
//			str += '\n';
			binStr += '\n';
		}
		isPixArrUpToDate = true;
		return binStr;
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Draw on canvas using values from pixArr[]                                 //
	///////////////////////////////////////////////////////////////////////////////////
	function arr2canvas()
	{
		var i, j; 
		
		for (j=0; j<17; ++j)
		{
			for(i=0; i<106; ++i)
			{
				if(pixArr[j][i] == 0)
				{
					ctx.fillStyle = 'white';
					ctx.fillRect(xa+i*pixelsPerUnit+1, ya+j*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
				}
				else
				{
					ctx.fillStyle = 'black';
					ctx.fillRect(xa+i*pixelsPerUnit+1, ya+j*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
				}
			}
		}	
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   DEBUG: Dump pixArr[]                                                       //
	///////////////////////////////////////////////////////////////////////////////////
	function printArr()
	{
		var i, j, str = '';
		for (i=0; i<17; ++i)
		{
			for(j=0; j<106; ++j)
			{
				str += pixArr[i][j] + ',';
			}
			str += '\n';
		}
		console.log(str);
		return(str);
	}
	
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   (re)draw 106 x 17 grid                                                      //
	///////////////////////////////////////////////////////////////////////////////////
	function drawGrid()
	{
		var i;
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'gray';
		ctx.beginPath();
		for(i=xa; i<xb; i+=pixelsPerUnit)
		{
			ctx.moveTo(i, ya);
			ctx.lineTo(i, yb);
		}
		for(i=ya; i<yb; i+=pixelsPerUnit)
		{
			ctx.moveTo(xa, i);
			ctx.lineTo(xb, i);
		}
		ctx.stroke();

	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   draw XY axes on canvas                                                      //
	///////////////////////////////////////////////////////////////////////////////////	
	function drawAxes(inverted)
	{		

		var i, j;
		
		ctx.clearRect(0, 0, canvas.width, ya);
		ctx.clearRect(0, yb, canvas.width, canvas.height-yb);
		ctx.clearRect(0, 0, xa, canvas.height);
		ctx.clearRect(xb, 0, canvas.width-xb, canvas.height);
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		ctx.strokeStyle = 'gray';
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'black';

		ctx.beginPath();
		for(i=xa; i<xb; i+=16)
		{
			ctx.moveTo(i, ya);
			ctx.lineTo(i+16, ya-axl);
			ctx.moveTo(i, yb+axl);
			ctx.lineTo(i+16, yb);
		}


		if(inverted)
		{
			ctx.lineWidth = 2;

			ctx.moveTo(xb, yb+axl);
			ctx.lineTo(xb, ya-axl);
			ctx.lineTo(xa-axl, ya-axl);
			
			// arrows
			ctx.moveTo(xa-axl+5, ya-axl+5);
			ctx.lineTo(xa-axl, ya-axl);
			ctx.lineTo(xa-axl+5, ya-axl-5);
			ctx.moveTo(xb-5, yb+axl-5);
			ctx.lineTo(xb, yb+axl);
			ctx.lineTo(xb+5, yb+axl-5);
			
			// graduation?
			ctx.moveTo(xb, ya-axl-pixelsPerUnit);
			ctx.lineTo(xb, ya-axl);
			ctx.moveTo(xa, ya-axl);
			ctx.lineTo(xa, ya-axl-pixelsPerUnit);
			
			ctx.moveTo(xb, ya);
			ctx.lineTo(xb+pixelsPerUnit, ya);
			ctx.moveTo(xb, yb);
			ctx.lineTo(xb+pixelsPerUnit, yb);
			
			ctx.stroke();
			
			// txt
			ctx.font = "bold 18px sans-serif";
			ctx.fillText("x", xa-axl-pixelsPerUnit, ya-axl-pixelsPerUnit);
			ctx.fillText("y", xb+pixelsPerUnit, yb+axl+pixelsPerUnit);
			ctx.fillText("k+17", xb+2*pixelsPerUnit, yb+pixelsPerUnit/2);
			ctx.fillText("k", xb+2*pixelsPerUnit, ya+pixelsPerUnit/2);
			ctx.fillText("0", xb, ya-axl-2*pixelsPerUnit);
			ctx.fillText("106", xa-2*pixelsPerUnit, ya-axl-2*pixelsPerUnit);
	
		}
		else
		{
		
			ctx.lineWidth = 2;
			//ctx.beginPath();
			ctx.moveTo(xa, ya-axl);
			ctx.lineTo(xa, yb+axl);
			ctx.lineTo(xb+axl, yb+axl);
			
			// arrows
			ctx.moveTo(xa-5, ya-axl+5);
			ctx.lineTo(xa, ya-axl);
			ctx.lineTo(xa+5, ya-axl+5);
			ctx.moveTo(xb+axl-5, yb+axl-5);
			ctx.lineTo(xb+axl, yb+axl);
			ctx.lineTo(xb+axl-5, yb+axl+5);	
			
			// graduation?
			ctx.moveTo(xa, yb+axl+pixelsPerUnit);
			ctx.lineTo(xa, yb+axl);
			ctx.moveTo(xb, yb+axl);
			ctx.lineTo(xb, yb+axl+pixelsPerUnit);
			
			ctx.moveTo(xa, ya);
			ctx.lineTo(xa-pixelsPerUnit, ya);
			ctx.moveTo(xa, yb);
			ctx.lineTo(xa-pixelsPerUnit, yb);
			
			ctx.stroke();
			
			// txt
			ctx.font = "bold 18px sans-serif";
			ctx.fillText("x", xb+axl+pixelsPerUnit/2, yb+axl-2*pixelsPerUnit);
			ctx.fillText("y", xa-2*pixelsPerUnit, ya-axl-pixelsPerUnit);
			ctx.fillText("k+17", xa-7*pixelsPerUnit, ya+pixelsPerUnit/2);
			ctx.fillText("k", xa-3*pixelsPerUnit, yb+pixelsPerUnit/2);
			ctx.fillText("0", xa-pixelsPerUnit, yb+axl+4*pixelsPerUnit);
			ctx.fillText("106", xb-2*pixelsPerUnit, yb+axl+4*pixelsPerUnit);
				
		}
		
		// white zig-zag
		ctx.lineWidth = 10;
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		
		ctx.moveTo(xa+2, ya-10);
		ctx.lineTo((xa+xb)/2+50, ya-axl+10);
		ctx.lineTo((xa+xb)/2-50, ya-10);
		ctx.lineTo(xb-2, ya-axl+10);
		
		ctx.moveTo(xa+2, yb+axl-10);
		ctx.lineTo((xa+xb)/2+50, yb+10);
		ctx.lineTo((xa+xb)/2-50, yb+axl-10);
		ctx.lineTo(xb-2, yb+10);
		
		ctx.stroke();
		
		// to lazy to clear rect border over axes
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
		
		ctx.strokeStyle = 'gray';
		ctx.strokeRect(xa, ya, 106*pixelsPerUnit, 17*pixelsPerUnit);
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Clear 106 x 17 grid content                                                 //
	///////////////////////////////////////////////////////////////////////////////////
	function clearGrid()
	{
		var i,j;
	
		ctx.fillStyle = 'white';
		for(j=0; j<17; ++j)
			for(i=0; i<106; ++i)
			{
				ctx.fillRect(xa+i*pixelsPerUnit+1, ya+j*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
				pixArr[j][i] = '0';
			}
		isPixArrUpToDate = true;

	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Reset whole canvas content                                                  //
	///////////////////////////////////////////////////////////////////////////////////
	function resetGraph()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawAxes(invertedAxes);
		drawGrid();
		clearGrid();
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Invert X & Y axes                                                           //
	///////////////////////////////////////////////////////////////////////////////////
	function invertAxes()
	{
		var goIA = document.getElementById('go_invertAxes');
		if(goIA && goIA.checked==true)
		{
			invertedAxes = true;
		}
		else
		{
			invertedAxes = false;
		}
		
		drawAxes(invertedAxes);

	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Move graph one unit left                                                    //
	///////////////////////////////////////////////////////////////////////////////////	
	function moveLeft()
	{
		var imgData=ctx.getImageData(xa+pixelsPerUnit,ya,105*pixelsPerUnit,17*pixelsPerUnit);
		ctx.putImageData(imgData,xa,ya);
		ctx.fillStyle = 'white';
		for(var j=0; j<17; ++j)
			ctx.fillRect(xa+105*pixelsPerUnit+1, ya+j*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
		isPixArrUpToDate = false;
		
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Move graph one unit right                                                   //
	///////////////////////////////////////////////////////////////////////////////////	
	function moveRight()
	{
		var imgData=ctx.getImageData(xa,ya,105*pixelsPerUnit,17*pixelsPerUnit);
		ctx.putImageData(imgData,xa+pixelsPerUnit,ya);
		ctx.fillStyle = 'white';
		for(var j=0; j<17; ++j)
			ctx.fillRect(xa+1, ya+j*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);		
		isPixArrUpToDate = false;
	}

	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Move graph one unit up                                                      //
	///////////////////////////////////////////////////////////////////////////////////		
	function moveUp()
	{
		var imgData=ctx.getImageData(xa,ya+pixelsPerUnit,106*pixelsPerUnit,16*pixelsPerUnit);
		ctx.putImageData(imgData,xa,ya);
		ctx.fillStyle = 'white';
		for(var j=0; j<106; ++j)
			ctx.fillRect(xa+j*pixelsPerUnit+1, ya+16*pixelsPerUnit+1, pixelsPerUnit-2, pixelsPerUnit-2);
		isPixArrUpToDate = false;
	}

	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Move graph one unit down                                                    //
	///////////////////////////////////////////////////////////////////////////////////	
	function moveDown()
	{
		var imgData=ctx.getImageData(xa,ya,106*pixelsPerUnit,16*pixelsPerUnit);
		ctx.putImageData(imgData,xa,ya+pixelsPerUnit);
		ctx.fillStyle = 'white';
		for(var j=0; j<106; ++j)
			ctx.fillRect(xa+j*pixelsPerUnit+1, ya+1, pixelsPerUnit-2, pixelsPerUnit-2);
		isPixArrUpToDate = false;
	}
	

	   /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	  //   If possible, move graph maximally to left without loosing any black pixels                            //
	 //   Produces smaller Tupper's number, when axes are set as in Cartesian coordinate system - NOT inverted  //
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function moveMaxLeft()
	{
		var i,j, foundSth = false;
		
		canvas2arr();
		
		for(j=0; j<106; ++j)
		{
			for(i=0; i<17; ++i)
			{
				if(pixArr[i][j]==1)
				{
					foundSth = true;
					break;
				}
				
			}
			if(foundSth)
				break;
		}
		if(foundSth)
		{
			for(i=j; i>0; --i)
				moveLeft();
		}	
	}
	
	   /////////////////////////////////////////////////////////////////////////////////////
	  //   If possible, move graph maximally to right without loosing any black pixels   //
	 //   Produces smaller Tupper's number, when axes are inverted                      //
	/////////////////////////////////////////////////////////////////////////////////////
	function moveMaxRight()
	{
		var i,j, foundSth = false;
		
		canvas2arr();
		
		for(j=105; j>=0; --j)
		{
			for(i=0; i<17; ++i)
			{
				if(pixArr[i][j]==1)
				{
					foundSth = true;
					break;
				}
				
			}
			if(foundSth)
				break;
		}
		if(foundSth)
		{
			for(i=j; i<105; ++i)
				moveRight();
		}
	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Flip graph around (local) Y axis (reflect horizontally)                     //
	///////////////////////////////////////////////////////////////////////////////////
	function flipImageY()
	{
		var str = canvas2arr();

		var i, j, k;
		
		for(i=0,j=105,k=0; k<str.length && i<17; ++k)
		{
			if(str.charAt(k) == '0')
			{
				pixArr[i][j] = 0;
			}
			else if(str.charAt(k) == '1')
			{
				pixArr[i][j] = 1;
			}
			else
				continue;
				
			--j;
			if(j<0)
			{
				j = 105;
				++i;
			}
		}
		arr2canvas();
		isPixArrUpToDate = true;

	}
	
	  ///////////////////////////////////////////////////////////////////////////////////
	 //   Flip graph around (local) X axis (reflect vertically)                       //
	///////////////////////////////////////////////////////////////////////////////////	
	function flipImageX()
	{
		var str = canvas2arr();

		var i, j, k;
		
		for(i=16,j=0,k=0; k<str.length && i>=0; ++k)
		{
			if(str.charAt(k) == '0')
			{
				pixArr[i][j] = 0;
			}
			else if(str.charAt(k) == '1')
			{
				pixArr[i][j] = 1;
			}
			else
				continue;
				
			++j;
			if(j>105)
			{
				j = 0;
				--i;
			}
		}
		arr2canvas();
		isPixArrUpToDate = true;
	}
	
	  ////////////////////////////////////////////////////////////////////////////////////
	 //   Invert colors of graph (black/white -> white/black)                          //
	////////////////////////////////////////////////////////////////////////////////////	
	function negative()
	{
		var str = canvas2arr();

		var i, j, k;
		
		for(i=0,j=0,k=0; k<str.length && i<17; ++k)
		{
			if(str.charAt(k) == '0')
			{
				pixArr[i][j] = 1;
			}
			else if(str.charAt(k) == '1')
			{
				pixArr[i][j] = 0;
			}
			else
				continue;
				
			++j;
			if(j>105)
			{
				j = 0;
				++i;
			}
		}
		arr2canvas();
		isPixArrUpToDate = true;
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Invert graph                                            //
	///////////////////////////////////////////////////////////////		
	function invertGraph()
	{
		flipImageX();
		flipImageY();
	}
	
	function runTests()
	{
		var assertVal1 = '35118444841267448013404150941800145728048599656l629146324687335986901379736401217S15281055462558552887192ll0082640641937'
					   + '666275171405531633925231708061577861898153631213760S7546l025926490075228967388020531261756457025676745373714088346879474'
					   + '04257165656075478779404916361425754630174709045643390135091223022770088185286183772054369904494S847l75371355113714S28354'
					   + '764293812670633359819683164579828025466805293703544125647114660864S9482134S393661222874325138515541436374l45430179273572'
					   + '82449632238144532921813602283194458348773893648913616S7068835604480';
		if(document.getElementById('numTA'))
			document.getElementById('numTA').value = ('30lO'+assertVal1).replace(/s/gi, 4+1).replace(/[^0-9]/g, '');
		else
		{
			alert("Missing textarea with id 'numTA'");
			return -1;
		}
		if(invertedAxes)
		{
			document.getElementById('go_invertAxes').checked = false;
			invertAxes();
		}
		num2Graph(('30lO'+assertVal1).replace(/s/gi, 4+1).replace(/[^0-9]/g, ''));
//		if(pixArr[0][0] != '0')
//			alert('Wrong pixel color');
		var cnt = 6;
		var iv = setInterval(function(){if(cnt-- > 0) negative(); else clearInterval(iv);}, 800);	
//		if(pixArr[0][0] != '0')
//			alert('Wrong pixel color');
		
	}
	  ///////////////////////////////////////////////////////////////
	 //   Graph to binary number                                  //
	///////////////////////////////////////////////////////////////		
	function graph2Bin()
	{
		var i,j, out='';
		
		if(!isPixArrUpToDate)
			canvas2arr();
		if(invertedAxes)
		{
			for(j=0; j<106; ++j)
			{
				for(i=16; i>=0; --i)
				{
					out += pixArr[i][j];					
				}
			}
			
		}
		else
		{
			for(j=105; j>=0; --j)
			{
				for(i=0; i<17; ++i)
				{
					out += pixArr[i][j];					
				}
			}
		}
		return out;
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Binary number to graph                                  //
	///////////////////////////////////////////////////////////////		
	function bin2Graph(bin)
	{
		var i,j, out='';
		bl = bin.length;
		if(bl<1802)
			bin = pad1802(bin);

		if(invertedAxes)
		{
			for(j=0; j<106; ++j)
			{
				for(i=16; i>=0; --i)
				{
					pixArr[i][j] = bin[j*17+16-i];					
				}
			}
			
		}
		else
		{
			for(j=105; j>=0; --j)
			{
				for(i=0; i<17; ++i)
				{
					pixArr[i][j] = bin[(105-j)*17+i];					
				}
			}
		}
		arr2canvas();
		isPixArrUpToDate = true;
	}
		
	  ///////////////////////////////////////////////////////////////
	 //   Tupper's number ('k' offset) to graph                   //
	///////////////////////////////////////////////////////////////		
	function num2Graph(num)
	{
		
		if(num.length < 1)
		{
			alert('No number to convert');
			return -1;
		}
		
		var num2 = divideBy17BN(num);
///////////////////////////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var num2r = num2.substring(num2.indexOf('|')+1);
		if(num2r != '0')
		{			
			alert('Number is not divisible by 17 (remainder = ' + (num2r) + ').\nChange number or use other plotting method.');
			return -1;
		}
		else
			num2 = num2.replace(/\|0$/, '');
		bin2Graph(pad1802(dec2binBN(num2)));
		return 0;
	}
		
	  ///////////////////////////////////////////////////////////////
	 //   Tuppers number ('k' offset) for graph                   //
	///////////////////////////////////////////////////////////////		
	function graph2Num()
	{
		return bin2decBN(multBin17(graph2Bin()))
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Draw Tuppers self-referential formula                   //
	///////////////////////////////////////////////////////////////	
	function drawTSRF(rev)
	{
		var numTSRF;
		var goIA = document.getElementById('go_invertAxes');

		if(rev)
		{
			numTSRF = '96093937991895888497167296212785275471500433966012930665150551927170280239526642468' +
			 '96428421743507181212671537827706233559932372808741443078913259639413377234878577357498239266' +
			 '29715517173716995165232890538221612403238855866184013235585136048828693337902491454229288667' +
			 '08109618449609170518345406782773155170540538162738096760256562501698148208341878316384911559' +
			 '02256100036523513703438744618483787372381982248498634650331594100549747005931383392264972494' +
			 '61751545728366702369745461014655997933798537483143786841806593422227898388722980000748404719';
			goIA.checked = true;
			invertedAxes = true;
			drawAxes(invertedAxes);
		}
		else
		{
			numTSRF = '48584506361897134235820959624942020445814005879832445494830930850619347047088099284' +
			 '50644769865524364849997247024915119110411605739177407856919754326571855442057210445735883681' +
			 '82982375413963433822519945219165128434833290513119319995350241375876523926487461339490687013' +
			 '05622958132194811136853395355652908500238750928568926945559742815463865107300491067230589335' +
			 '86052544096664351265349363643957125565695936815184334857605266940161251266951421550539554519' +
			 '153785457525756590740540157929001765967965480064427829131488548259914721248506352686630476300';
			goIA.checked = false;
			invertedAxes = false;
			drawAxes(invertedAxes);
		}
		document.getElementById('numTA').value = numTSRF;
		num2Graph(numTSRF);
	}
	
	  //////////////////////////////////////////////////////////////////////////////////////////
	 //   Place binary number (read from left-to-right, top-to-bottom) in pixel array        //
	 //   and draw it. Useful to import binary "image" from Excel, Calc, *.txt file, etc.   //
	/////////////////////////////////////////////////////////////////////////////////////////
	function bin2arr()
	{
		var bs = document.getElementById('numTA').value;
		
		if(bs.match(/[2-9a-zA-Z]/))
		{
			alert('Error: Non-binary digits in number field.');
			return;
		}
		bs = bs.replace(/[^01]/g, '');

		if(bs.length != 1802)
		{
			alert('Warning: There should be exactly 1802 binary digits (instead of '+bs.length+'). Padding with zeros, but it might damage image.');
			bs = pad1802(bs);
		}
		
		var i, j; 
		
		for (i=0; i<17; ++i)
		{
			for(j=0; j<106; ++j)
			{
				if(bs[i*106+j] == 0)
				{
					pixArr[i][j] = 0; // white pixel
				}
				else
				{
					pixArr[i][j] = 1; // black
				}

			}
		}
		arr2canvas();
	}
	
	  /////////////////////////////////////////////////////////////////////////////////
	 //   Plot graph calculating values of Tupper's formula for each square unit    //
	/////////////////////////////////////////////////////////////////////////////////
	function calcGraph_Unit(num)
	{	
		var x,y, yy, t1, t1r, t2, t3, t4, b1, b2;
		
		for(y=0; y<17; ++y)
		{
			for(x=0; x<106; ++x)
			{
				yy = addBN(num, y.toString());
				t1 = divideBy17BN(yy).toString();

				t1r = parseInt(t1.substring(t1.indexOf('|')+1));
				t1 = t1.substring(0, t1.indexOf('|'));
				
				t3 = 17 * x + t1r;
				b1 = dec2binBN(t1).toString();
			
				if(t3 >= b1.length)
					b2 = '0';
				else
					b2 = b1.slice(0, b1.length-t3)
				t4 = bin2decBN(b2);
				if('02468'.indexOf(t4.slice(-1)) >= 0) // ..... % 2 == 0
					pixArr[16-y][x] = 0;
				else
					pixArr[16-y][x] = 1;
			}
		}
		arr2canvas();
		
		if(invertedAxes)
			invertGraph();
	}
	
	  /////////////////////////////////////////////////////////////////////////////////
	 //   Plot graph using selected method    			                //
	/////////////////////////////////////////////////////////////////////////////////
	function plotGraph()
	{	
		document.getElementById('numTA').value = document.getElementById('numTA').value.replace(/[-.,]/g, '');
		if(document.getElementById('go_smartPlot').checked)
			num2Graph(document.getElementById('numTA').value.replace(/[^0-9]/g, ''));
		else
			calcGraph_Unit(document.getElementById('numTA').value.replace(/[^0-9]/g, ''));
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Generate PNG image with a graph and number              //
	///////////////////////////////////////////////////////////////
	function generatePNG()
	{
		var i, offset;
		var incForm = document.getElementById('includeFormula').checked;
//		var canvas2 = document.getElementById("canvas2");
		var tupFormImg = document.getElementById("tuppersFormula");
		canvas2.width = 990;
		if(incForm)
		{
			canvas2.height = 680;
			offset = 90;
		}
		else
		{
			canvas2.height = 600;
			offset = 10;
		}
		
		var ctx2=canvas2.getContext("2d");
		ctx2.fillStyle = 'white';
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
		ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
		
		if(incForm)
		{
			ctx2.drawImage(tupFormImg, 360, 32);
			ctx2.fillRect(350+tupFormImg.width, 32, 10, 32);
		}
		
		ctx2.drawImage(canvas, 0, offset);
		
		var num = document.getElementById('numTA').value.trim();
		var numO = '';
		
		for(i=0; i<num.length; ++i)
		{
			if(i%76==0 && i>0)
			{
				numO += '\n';
			}
			numO += num.charAt(i);
		}
		ctx2.fillStyle = 'black';
		ctx2.font = "bold 20px sans-serif";
		var y = 360+offset;
		ctx2.fillText("k = ", 50, y);
	    var lineHeight = ctx2.measureText("M").width * 1.2;
		var lines = numO.split("\n");
		for(i=0; i<lines.length; ++i)
		{
			ctx2.fillText(lines[i].trim(), 90, y);
			y += lineHeight;
		
		}
		
		document.getElementById('link2img').href = canvas2.toDataURL();
		document.getElementById('link2img').style.display = 'block';
		document.getElementById('link2img2').style.display = 'block';
		document.getElementById('linkWithNum').style.display = 'block';
		document.getElementById('linkWithNum').href = '#' + document.getElementById('numTA').value.replace(/[^0-9]/g, '');
		
	}
	
	
	  ///////////////////////////////////////////////////////////////
	 //   Workaround for IE's restrictions for data URI           //
	///////////////////////////////////////////////////////////////
	function openImgInNewWin()
	{
			var docString = '<html><body><img src="'+canvas2.toDataURL("image/png")+'"/></body></html>';
			var win = window.open();
			win.document.write(docString);
			win.document.close();
	}
	
	
	   /////////////                               BIG NUMBERS STUFF                                         //////////////
	 /////////////              !!!!   does not work with negative numbers !!!!                             ////////////// 
	 //   Multiply big (decimal) number stored as string by 2     //
	function mult2BN(fact)
	{
	  var out = '';
	  var bp, cr = 0;
	  for(var i=fact.length-1; i>=0; --i)
	  {
		bp = (fact[i] * 2 + cr);
		cr = parseInt(bp/10); // substring?
		out = bp%10 + '' + out;
	  }
	  out = (cr>0?cr:'') + '' + out;
	  return out;
	}


	 //   Add two big (decimal) numbers stored as strings         //
	function addBN(op1, op2)
	{
	  var out = '';
	  var i, j, st, cr = 0;
	  var op1l=op1.length;
	  var op2l=op2.length;
	/*  
	  for(i=op1l-1,j=op2l-1; i>=0 || j>=0; --i, --j)
	  {
		st = (i>=0 ? op1[i] : 0) + (j>=0 ? op2[j] : 0);
		cr = parseInt(st/10); // substring?
		out = st%10 + '' + out;
	  }
	*/
	  if(op1l>op2l)
	  {
		for(i=op1l-1,j=op2l-1; j>=0; --i,--j)
		{
		  st = parseInt(op1[i]) + parseInt(op2[j]) + cr;
		  cr = parseInt(st/10); // substring?
		  out = st%10 + '' + out;
		}
		for(; i>=0; --i)
		{
		  st = parseInt(op1[i]) + cr;
		  cr = parseInt(st/10); // substring?
		  out = st%10 + '' + out;     
		}
		out = (cr>0?cr:'') + '' + out;
	  }
	  else
	  {
		for(i=op1l-1,j=op2l-1; i>=0; --i,--j)
		{
		  st = parseInt(op1[i]) + parseInt(op2[j]) + cr;
		  cr = parseInt(st/10); // substring?
		  out = st%10 + '' + out;
	 //     alert('['+i+','+j+ '] st='+st+', cr='+cr+', out='+out);
		}
		for(; j>=0; --j)
		{
		  st = parseInt(op2[j]) + cr;
		  cr = parseInt(st/10); // substring?
		  out = st%10 + '' + out;     
		}
		out = (cr>0?cr:'') + '' + out;
	  }
	  
	  return out;
	  
	}

	  //   Compare two big (decimal) numbers stored as strings     //
	 //        op1>op2 -> 1, op1==op2 -> 0, op1<op2 -> -1         //
	function compareBN(op1, op2)
	{
	  var op1l=op1.length;
	  var op2l=op2.length;
	  if(op1l>op2l)
		return 1;
	  else if(op1l<op2l)
		return -1;
	  // same length:
	  for(var i=0; i<op1l; ++i)
	  {
		if(op1[i] > op2[i])
		  return 1;
		else if(op1[i] < op2[i])
		  return -1;
	  }
	  return 0;
	}

	 //   Substract two big (decimal) numbers stored as strings   //
	function subtractBN(op1, op2) // op1 must be >= op2 !!!!!!!!!
	{
	  var out = '';
	  var i, j, cr=0, tmp;
	  var op1l=op1.length;
	  var op2l=op2.length;
	  
	  
	  for(i=op1l-1,j=op2l-1; j>=0; --i,--j)
	  {
		tmp = parseInt(op1[i]) - parseInt(op2[j]) - cr;
		if(tmp<0)
		{
		   cr = 1;
		   tmp += 10; 
		}
		else
		  cr = 0;
		out = tmp + '' + out;
	  }
	  for(; i>=0; --i)
	  {
		tmp = parseInt(op1[i]) - cr;
		if(tmp<0)
		{
		   cr = 1;
		   tmp += 10; 
		}
		else
		  cr = 0;
		out = tmp + '' + out;   
	  }
	  // cr should be 0 (if only op1 was >= op2)
	  // trim leading zeroes
	  out = out.replace(/^0+/, '');
	  if(out.length == 0)
		out = '0';
	  return out;  
	}

	  ///////////////////////////////////////////////////////////////
	 //   Divide big (decimal) number stored as strings by 17     //
	///////////////////////////////////////////////////////////////  
	function divideBy17BN(n) // return format: quotient|remainder (for example: 123456787654|16)
	{
	 var tmp, nl = (''+n).length;
	 var out = '';
	  
	 if(nl<11)
	 {
		var ni= parseInt(n);
//		if(ni%17 != 0)
//			return -1 * (ni%17);
	   return parseInt(ni/17) + '|' + (ni%17);  
	 }
	   
	 
	 tmp = n[0];
	 for(i=1; i<nl; ++i)
	 {
	   tmp += '' + n[i];
	   tmp2 = parseInt(tmp);
	   tmp3 = parseInt(tmp2/17);
	   
	   if(tmp3 < 1)
	   {
		 out += '0';
		 continue;
	   }
	   out +=  '' + tmp3;
	   tmp = tmp2 - 17*tmp3; 
	  }

	  out = out.replace(/^0+/, '');
	  if(out.length == 0)
		out = '0';

	  out +=  '|' + parseInt(tmp);	// appending remainder
//	  if(tmp != 0 && returnReminder)
//		return -1 * tmp;
	  return out;  
	  
	}

	  //////////////////////////////////////////////////////////////////////////////////////////
	 //   Convert big binary number (passed as string) to decimal (also stored as string)    //
	//////////////////////////////////////////////////////////////////////////////////////////
	function bin2decBN(b)
	{
	  var bl = b.length;
	  var i, k;
	  if(bl<33)
	  {
		return '' + parseInt(b,2);
	  }
	  var out = 0;
	  
	  for(i=bl-1, k=0; i>=0&&k<32; --i, k++)
	  {
		if(b[i]=='1')
		{
		  out += Math.pow(2,k);
		}
	  }
	  var curPowOf2 = Math.pow(2,k-1);
	//  alert(i+','+k+')) '+ curPowOf2+'\n'+out);
	  for(; i>=0; --i, k++)
	  {
		curPowOf2 = mult2BN(''+curPowOf2);
		if(b[i]=='1')
		{
		  out = addBN(''+out, ''+curPowOf2);
		}
	//    alert(i+','+k+') '+ curPowOf2+'\n'+out);
	  }
	  return out;
	  
	}

	  //////////////////////////////////////////////////////////////////////////////////////
	 //   Convert big (decimal) number (passed as string) to binary (string, too)        //
	//////////////////////////////////////////////////////////////////////////////////////
	function dec2binBN(d)
	{
	  var dl = d.length;
	  var i, diff, out='';
	  
	  if(dl<33)
	  {
		return parseInt(d,10).toString(2);
	  }
	  var pows = [];
	  for(i=0; i<32; ++i)
	  {
		tmp = Math.pow(2, i);
		pows[i] = '' + tmp;
	  }
	  tmp +='';
	  for(; dl>tmp.length; ++i)
	  {
		tmp = mult2BN(tmp);
		pows[i] = tmp;
	  }
	  for(; compareBN(''+d, tmp)>=0; ++i)
	  {
		tmp = mult2BN(tmp);
		pows[i] = tmp;
	  }
	  --i;
	  diff = ''+d;
	//  alert(diff);
	  for(;i>=0;--i)
	  {
		if(compareBN(diff, pows[i])>=0)
		{
		  out += '1';
		  diff = subtractBN(diff, pows[i]);
	//      alert(i+') pows[i]='+pows[i]+'\ndiff='+diff+'\nout='+out);
		}
		else
		  out += '0';
	  }
	  out = out.replace(/^0+/, '');
	  if(out.length == 0)
		out = '0'; 
	  
	  return out;  
	}

	  ///////////////////////////////////////////////////////////////////////////////////////
	 //   Pad binary number (passed as string) with leading zeros (to 1802 digits)        //
	///////////////////////////////////////////////////////////////////////////////////////
	function pad1802(num)
	{
	  var s = num+"";
	  while (s.length < 1802)
		s = "0" + s;
	  return s;
	  
	}

	  ///////////////////////////////////////////////////////////////
	 //   Simple binary string formatter (Tuppers Formula)        //
	///////////////////////////////////////////////////////////////
	function quickFormat(str)
	{
	  var out = '';
	  for(i=0; i<str.length; ++i)
	  {
		if(i%17==0)
		  out += '\n' + str[i];
		else
		  out += '\t' + str[i];
	  }
	  return out;
	}

	  ///////////////////////////////////////////////////////////////
	 //   Add two big (binary) numbers stored as strings          //
	///////////////////////////////////////////////////////////////
	function addBin(op1, op2)
	{
	  var out = '';
	  var i, j, st, cr = 0;
	  var op1l=op1.length;
	  var op2l=op2.length;

	  if(op1l>op2l)
	  {
		for(i=op1l-1,j=op2l-1; j>=0; --i,--j)
		{
		  st = parseInt(op1[i]) + parseInt(op2[j]) + cr;
		  cr = parseInt(st/2); // use substring instead?
		  out = st%2 + '' + out;
		}
		for(; i>=0; --i)
		{
		  st = parseInt(op1[i]) + cr;
		  cr = parseInt(st/2); // substring?
		  out = st%2 + '' + out;     
		}
		out = (cr>0?cr:'') + '' + out;
	  }
	  else
	  {
		for(i=op1l-1,j=op2l-1; i>=0; --i,--j)
		{
		  st = parseInt(op1[i]) + parseInt(op2[j]) + cr;
		  cr = parseInt(st/2); // substring?
		  out = st%2 + '' + out;
	 //     alert('['+i+','+j+ '] st='+st+', cr='+cr+', out='+out);
		}
		for(; j>=0; --j)
		{
		  st = parseInt(op2[j]) + cr;
		  cr = parseInt(st/2); // substring?
		  out = st%2 + '' + out;     
		}
		out = (cr>0?cr:'') + '' + out;
	  }
	  
	  return out;
	}

	  ///////////////////////////////////////////////////////////////
	 //   Multiply big (binary) number stored as strings by 17    //
	///////////////////////////////////////////////////////////////
	function multBin17(bin)
	{
		var out;
		
		out = bin + '0000';
		out = addBin(out, bin);
		return out;
	}

	  ///////////////////////////////////////////////////////////////
	 //   Generate random "Big Number" divisible by 17            //
	///////////////////////////////////////////////////////////////
	function randomBN17(allBits)
	{
		var i, j=1802, b='0';
		if(!allBits)
			j = Math.round(Math.random()*1802);
		for(i=0; i<j; ++i)
			b += new String((Math.round(Math.random() * 1234567)+ new Date().getTime()*1357)%2);
		b17 = multBin17(b);
		return(bin2decBN(b17));
	}
	
	   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	  /////////////                               NUMBER FIELD STUFF                                         //////////////
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	  ///////////////////////////////////////////////////////////////
	 //   Separate thousands (using white space character)        //
	///////////////////////////////////////////////////////////////
	function separateThousands()
	{
		var out = '';
		var num = document.getElementById('numTA').value.replace(/[^0-9]/g, '');
		if(num.length>3)
		{
			for(var i=num.length-1,j=0; i>=0; --i,++j)
			{
				if(j%3==0 && j>0)
				{
					out = ' ' + out;
				}
				out = num.charAt(i) + out;
			}
			document.getElementById('numTA').value = out;
		}
		else
		{
			document.getElementById('numTA').value = num;
		}
		
	}

	  ///////////////////////////////////////////////////////////////
	 //   Remove all non numeric characters                       //
	///////////////////////////////////////////////////////////////
	function removeNonNumeric()
	{
		document.getElementById('numTA').value = document.getElementById('numTA').value.replace(/[^0-9]/g, '');
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Clear number field                                      //
	///////////////////////////////////////////////////////////////
	function clearNum()
	{
		document.getElementById('numTA').value = '';
	}
	
	  ///////////////////////////////////////////////////////////////
	 //   Show intermediate values                                //
	///////////////////////////////////////////////////////////////
	function showSteps()
	{
		var num1 = document.getElementById('numTA').value.replace(/[^0-9]/g, '');
		var num2 = divideBy17BN(num1);
		num2 = num2.substring(0, num2.indexOf('|'));
		var num2o = '';
		var binO = '';
		var bin2o = '';		
		var bin3a, bin3o;
		
		var i, j, k;
		
		for(i=0; i<num2.length; ++i)
		{
			if(i%106==0 && i>0)
			{
				num2o += '\n';
			}
			num2o += num2.charAt(i);
		}
		var bin = pad1802(dec2binBN(num2));

		
		for(i=0; i<bin.length; ++i)
		{
			if(i%106==0 && i>0)
			{
				binO += '\n';
			}
			binO += bin.charAt(i);
		}
		
		for(j=0; j<17; ++j)
		{
			for(i=105; i>=0; --i)
				bin2o += bin.charAt(i*17+j);
			bin2o += '\n';
		}
		
		bin3a = bin2o.split('\n');
		bin3a = bin3a.reverse();
		for(k=0;k<bin3a.length; ++k)
			bin3a[k] =  bin3a[k].split('').reverse().join('');
		bin3o = bin3a.join('\n');
		
		var stepsHTML = '\n<br />\n<strong>Divided by 17:</strong><br />\n<pre>\n' + num2o + '\n</pre><br /><br />\n<strong>Binary:</strong><br />\n<pre>\n' + binO 
					+ '\n</pre>\n<br /><br />\n<strong>Binary (as 106 columns of 17-bit numbers):</strong><br />\n<pre>\n' + bin2o + '\n</pre>\n\n<br /><br />\n<strong>Binary (as 106 columns of 17-bit numbers - all reversed):</strong><br />\n<pre>\n' + bin3o + '\n</pre>\n';
		document.getElementById('no_steps').innerHTML = stepsHTML;
		if(document.getElementById('no_steps').style.display == 'none')
			toggleDiv('no_steps');
	}
