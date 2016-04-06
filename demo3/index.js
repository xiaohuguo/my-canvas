var SECTER = {
	spend: 0,
	budget: 0,
	totalOver: 0
};
(function() {
	var greenColor = '#00b2af',
		redColor = '#e03339',
		grayColor = '#dfdfdf',
		pinkColor = '#e6b8b9',
		spend = new Number(SECTER.spend),
		budget = new Number(SECTER.budget),
		totalOver =  new Number(SECTER.totalOver),
		winWidth, winHeight, RADIUS, lineWidth, centerRadius, originX, originY, canvas, context;
	SECTER.update = function(canvas, s, b, t) {
		if (canvas)
			SECTER.canvas = canvas;
		if (s)
			spend =  new Number(s);
		if (b)
			budget =  new Number(b);
		if (t)
			totalOver =  new Number(t);
		if (!SECTER.canvas)
			return;
		winWidth = Math.max(window.innerWidth, 320) - 20;
		winHeight = 1.2 * winWidth;
		RADIUS = winWidth / 3.5;
		lineWidth = winWidth / 5;
		centerRadius = winWidth / 50;
		originX = winWidth / 2;
		originY = winHeight / 2;
		SECTER.canvas.width = winWidth;
		SECTER.canvas.height = winHeight;
		context = SECTER.canvas.getContext('2d');
		// 网格线
		//drawGrid('lightgray', 10, 10, context);
		var secter = new Sprite('secter', secterPainter);
		var pointer = new Sprite('pointer', pointerPainter);
		var liner = new Sprite('liner', linePainter);
		secter.startValue = budget;
		secter.endValue = totalOver;
		secter.color = pinkColor;
		secter.paint(context);

		secter.startValue = spend;
		secter.endValue = budget;
		secter.color = grayColor;
		secter.paint(context);

		secter.startValue = 0;
		secter.endValue = Math.min(spend, budget);
		secter.color = greenColor;
		secter.paint(context);

		secter.startValue = budget;
		secter.endValue = spend;
		secter.color = redColor;
		secter.paint(context);

		liner.startValue = 0;
		liner.endValue = 0;
		liner.color = greenColor;
		liner.paint(context);

		liner.startValue = totalOver;
		liner.endValue = totalOver;
		liner.color = redColor;
		liner.paint(context);

		liner.startValue = budget;
		liner.endValue = budget;
		liner.color = 'black';
		liner.paint(context);

		pointer.startValue = spend;
		pointer.endValue = spend;
		pointer.paint(context);

		context.font = "16px Verdana";
		context.textAlign = "left";
		context.fillText("budget:" + budget.toFixed(2), 10, 20, winWidth);
		context.fillText("spend:" + spend.toFixed(2), 10, 40, winWidth);
		context.fillText("total over:" + totalOver.toFixed(2), 10, 60, winWidth);
		context.textAlign = "center";
		if (spend > budget) {
			context.font = "20px Verdana";
			context.textBaseline = "bottom";
			context.fillText("Overspent by", originX, originY + RADIUS, winWidth / 3);
			context.textBaseline = "top";
			context.fillText((spend - budget).toFixed(2), originX, originY + RADIUS, winWidth);
		}
		context.font = "14px Verdana";
		context.textBaseline = "top";
		context.fillText((budget - spend).toFixed(2) + "Left to budget with " + daysleft() + " days to go", originX, originY + RADIUS + lineWidth / 2, winWidth);
	}
	// 重新渲染调用
	function init() {
		SECTER.update();
	}
	window.addEventListener('orientationchange', init, false);
	window.addEventListener('resize', init, false);

	// 精灵类
	var Sprite = function(name, painter, behaviors) {
		if (name !== undefined) this.name = name;
		if (painter !== undefined) this.painter = painter;

		this.left = originX;
		this.top = originY;
		this.width = 0;
		this.height = 0;
		this.startValue = 0;
		this.endValue = 0;
		this.color = "black";
		this.visible = true;
		this.animating = false;
		this.behaviors = behaviors || [];
		return this;
	}
	Sprite.prototype = {
		paint: function(context) {
			if (this.painter !== undefined && this.visible) {
				this.painter.paint(this, context);
			}
		},
		update: function(context, time) {
			for (var i = 0; this.behaviors.length; i++) {
				this.behaviors[i].execute(this, context, time);
			};
		}
	}

	// 圆弧绘制器
	var secterPainter = {
		paint: function(sprite, context) {
			if (sprite.startValue > sprite.endValue) return;
			context.beginPath();
			context.arc(originX, originY, RADIUS, valueToAngle(sprite.startValue), valueToAngle(sprite.endValue), false);
			context.lineWidth = lineWidth;
			context.strokeStyle = sprite.color;
			context.stroke();
		}
	}

	// 指针绘制器
	var pointerPainter = {
		paint: function(sprite, context) {
			var angle = valueToAngle(sprite.endValue);
			context.beginPath();
			context.lineWidth = 0.5;
			context.arc(originX, originY, centerRadius, 0, 2 * Math.PI, false);
			context.fill();
			context.beginPath();
			context.moveTo(originX + (RADIUS + lineWidth / 2) * Math.cos(angle), (originY + (RADIUS + lineWidth / 2) * Math.sin(angle)));
			var pAcos = Math.acos(centerRadius / RADIUS);
			context.lineTo(originX + centerRadius * Math.cos(angle - pAcos), originY + centerRadius * Math.sin(angle - pAcos));
			context.lineTo(originX + centerRadius * Math.cos(angle + pAcos), originY + centerRadius * Math.sin(angle + pAcos));
			context.fill();
		}
	}
	// 阀值线绘制器
	var linePainter = {
		paint: function(sprite, context) {
			var angle = valueToAngle(sprite.endValue);
			context.beginPath();
			context.lineWidth = 1;
			context.moveTo(originX + (RADIUS - lineWidth / 2) * Math.cos(angle), originY + (RADIUS - lineWidth / 2) * Math.sin(angle));
			context.lineTo(originX + (RADIUS + lineWidth / 2 + RADIUS / 10) * Math.cos(angle), originY + (RADIUS + lineWidth / 2 + RADIUS / 10) * Math.sin(angle));
			context.strokeStyle = sprite.color;
			context.stroke();
		}
	};

	function valueToAngle(value) {
		return (1.4 * value / totalOver + 0.8) * Math.PI % (2 * Math.PI);
	}
	function daysleft() {
		var today = new Date();
		var now = today.getDate();
		return (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - now);
	}
	// 辅助网格函数
	function drawGrid(color, stepx, stepy, context) {
		context.strokeStyle = color;
		context.lineWidth = 0.5;
		for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
			context.beginPath();
			context.moveTo(i, 0);
			context.lineTo(i, context.canvas.height);
			context.stroke();
		}
		for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
			context.beginPath();
			context.moveTo(0, i);
			context.lineTo(context.canvas.width, i);
			context.stroke();
		}
	}
})()
