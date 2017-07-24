window.onload = function(){
	var mycanvas = document.getElementById('mycanvas');
	var context = mycanvas.getContext('2d');
	var me = true;//落子设置，true为黑棋，false为白棋
	var over = false;//记录棋局是否结束
	
	
	//线的颜色
	context.strokeStyle = '#000';
	
	//画logo
	var logo = new Image();
	logo.src = 'img/logo.gif';
	logo.onload = function(){
		context.drawImage(logo,130,150,200,100);
		drawLine();
	}
	
	//画棋盘线
	var drawLine = function(){
		for(var i=0;i<15;i++){
			context.moveTo(15+i*30,15);
			context.lineTo(15+i*30,435);
			context.stroke();
			context.moveTo(15,15+i*30);
			context.lineTo(435,15+i*30);
			//只画出线，不填充
			context.stroke();
		}
	}
	
	//画棋子（画圆）
	var oneStep = function(i,j,me){
		context.beginPath();//开始路径
		//画圆，参数：前两个为圆心，然后使半径，最后是弧度从哪到哪
		context.arc(15+i*30,15+j*30,13,0,2*Math.PI);
		context.closePath();//结束路径
		//填充棋子的渐变色
		var gradient = context.createRadialGradient(15+i*30,15+j*30,13,15+i*30+2,15+j*30-2,1);
		//me为true时画黑子，为false时画白子
		if(me){
			gradient.addColorStop(0,"#0a0a0a");
			gradient.addColorStop(1,"#636766");
		}else{
			gradient.addColorStop(0,"#d1d1d1");
			gradient.addColorStop(1,"#f9f9f9");
		}
		context.fillStyle = gradient;
		//填充
		context.fill();
	}
	
	//二维数组，存储落子后该点的状态，阻止重复落子
	var chess = [];
	for(var i=0;i<15;i++){
		chess[i] = [];
		for(var j = 0;j<15;j++){
			chess[i][j] = 0;
		}
	}
	
	//赢法数组（三维），前两个为棋盘，第三个为赢的种类
	var wins = [];
	for(var i = 0;i<15;i++){
		wins[i] = [];
		for(var j = 0;j<15;j++){
			wins[i][j] = [];
		}
	}
	
	var count = 0;//赢法种类索引
	//所有横线的赢法
	for(var i = 0;i<15;i++){
		for(var j = 0;j<11;j++){
			//wins[0][0][0] = true
			//wins[0][1][0] = true
			//wins[0][2][0] = true
			//wins[0][3][0] = true
			//wins[0][4][0] = true
			
			//wins[0][1][1] = true
			//wins[0][2][1] = true
			//wins[0][3][1] = true
			//wins[0][4][1] = true
			//wins[0][5][1] = true
			for(var k = 0;k<5;k++){
				wins[i][j+k][count] = true;
			}
			count++;
		}
	}
	
	//所有竖线的赢法
	for(var i = 0;i<11;i++){
		for(var j = 0;j<15;j++){
			for(var k = 0;k<5;k++){
				wins[i+k][j][count] = true;
			}
			count++;
		}
	}
	
	//所有斜线的赢法
	for(var i = 0;i<11;i++){
		for(var j = 0;j<11;j++){
			for(var k = 0;k<5;k++){
				wins[i+k][j+k][count] = true;
			}
			count++;
		}
	}
//	console.log(count);//451,即15*15的棋盘，五子棋有451种赢法
	
	//所有反斜线的赢法
	for(var i = 14;i>3;i--){
		for(var j = 0;j<11;j++){
			for(var k = 0;k<5;k++){
				wins[i-k][j+k][count] = true;
			}
			count++;
		}
	}
	
	
	//初始化赢法的统计数组
	var myWin = [];
	var computerWin = [];
	for(var i = 0;i<count;i++){
		myWin[i] = 0;
		computerWin[i] = 0;
	}
	
	
	//点击棋盘完成落子
	mycanvas.onclick = function(e){
		if(over){
			return;
		}
		if(!me){
			return;
		}
		var e = e||event;
		var x = e.offsetX;
		var y = e.offsetY;
		//获取落子的原心
		var i = Math.floor(x/30);
		var j = Math.floor(y/30);
		//如果该坐标没有落子才可以落子
		if(chess[i][j] == 0){
			oneStep(i,j,me);
//			if(me){
//				chess[i][j] = 1;
//			}else{
//				chess[i][j] = 2;
//			}
			//如果落下的是黑子，坐标存1；
			chess[i][j] = 1;
			
			//赢法统计
			for(var k = 0;k<count;k++){
				if(wins[i][j][k]){
					myWin[k]++;
					//表示另一种子不能再赢了
					computerWin[k] = 6;
					if(myWin[k] == 5){
						alert('你赢了');
						over = true;
					}
				}
			}
			if(!over){
				me = !me;
				computerAI();
			}
		}
	}
	
	//计算机下棋
	var computerAI = function(){
		var myScore = [];
		var computerScore = [];
		var max = 0;//保存最高分
		var u = 0,v = 0;//保存最高分的点的坐标
		for(var i = 0;i<15;i++){
			myScore[i] = [];
			computerScore[i] = [];
			for(var j = 0;j<15;j++){
				myScore[i][j] = 0;
				computerScore[i][j] = 0;
			}
		}
		//遍历整个棋盘
		for(var i = 0;i<15;i++){
			for(var j = 0;j<15;j++){
				//该坐标可以落子
				if(chess[i][j]==0){
					//遍历所有赢法
					for(var k = 0;k<count;k++){
						//判断第K种赢法是否有价值
						if(wins[i][j][k]){
							//判断第K种赢法黑子是否落子
							//拦截价值判断
							if(myWin[k] == 1){
								//拦截
								myScore[i][j] += 200;
							}else if(myWin[k] == 2){
								//拦截
								myScore[i][j] += 400;
							}else if(myWin[k] == 3){
								//拦截
								myScore[i][j] += 2000;
							}else if(myWin[k] == 4){
								//拦截
								myScore[i][j] += 10000;
							}
							
							//计算机本身落子价值判断
							if(computerWin[k] == 1){
								//落子价值
								computerScore[i][j] += 220;
							}else if(computerWin[k] == 2){
								//落子价值
								computerScore[i][j] += 420;
							}else if(computerWin[k] == 3){
								//落子价值
								computerScore[i][j] += 2100;
							}else if(computerWin[k] == 4){
								//落子价值
								computerScore[i][j] += 20000;
							}
						}
					}
					
					//存储最高分数
					if(myScore[i][j] > max){
						max = myScore[i][j];
						u = i;
						v = j;
					}else if(myScore[i][j] == max){
						if(computerScore[i][j]>computerScore[u][v]){
							u = i;
							v = j;
						}
					}
					
					if(computerScore[i][j] > max){
						max = computerScore[i][j];
						u = i;
						v = j;
					}else if(computerScore[i][j] == max){
						if(myScore[i][j] > myScore[u][v]){
							u = i;
							v = j;
						}
					}
				}
			}
		}
		oneStep(u,v,false);
		chess[u][v] = 2;
		for(var k = 0;k<count;k++){
			if(wins[u][v][k]){
				//白字赢法更近一步
				computerWin[k]++;
				//表示另一种子不能再赢了
				myWin[k] = 6;
				if(computerWin[k] == 5){
					alert('计算机赢了');
					over = true;
				}
			}
		}
		if(!over){
			me = !me;
		}
	}
}

