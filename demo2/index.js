var REPORT = REPORT || {};
(function() {
	REPORT.SpendSlider = function(data) {
		this.width = 310;
		this.height = this.lineHeight * data.length + this.headHeight + this.titleHeight + this.footHeight;
		this.createCanvas();
		this.drawOffCanvas(data);
		return this;
	};
	REPORT.SpendSlider.prototype = {
		headHeight: 40,
		titleHeight: 20,
		footHeight: 50,
		lineHeight: 40,
		pointWidth: 20,
		sliderHeight: 10,
		padding: 10,
		createCanvas: function() {
			this.canvas = document.createElement("canvas");
			this.context = this.canvas.getContext('2d');
			this.offCanvas = document.createElement("canvas");
			this.offContext = this.offCanvas.getContext('2d');
			this.canvas.width = this.offContext.canvas.width = this.width;
			this.canvas.height = this.offContext.canvas.height = this.height;
			return this.context;
		},
		appendTo: function(element) {
			element.appendChild(this.canvas);
		},
		update: function(data) {
			this.erase();
			this.height = this.lineHeight * data.length + this.headHeight + this.titleHeight + this.footHeight;
			this.canvas.width = this.offContext.canvas.width = this.width;
			this.canvas.height = this.offContext.canvas.height = this.height;
			this.drawOffCanvas(data);
			this.draw();
			this.addEventHandlers();
		},
		drawOffCanvas: function(data) {
			// this.drawGrid('lightgray', 10, 10, this.offContext);
			// 头部
			this.offContext.beginPath();
			this.offContext.strokeStyle = "black";
			this.offContext.strokeRect(this.padding + 0.5, 0.5, this.offContext.canvas.width - 2 * this.padding - 1, this.headHeight - 1);
			this.offContext.strokeRect(this.padding + 0.5, this.lineHeight * data.length + this.headHeight + this.titleHeight + 0.5, this.offContext.canvas.width - 2 * this.padding - 1, this.footHeight - 1);
			// 刻度
			var marks = this.getMarks(this.getMaxOver(data));
			this.offContext.beginPath();
			this.offContext.font = "12px verdana";
			this.offContext.textBaseline = "bottom";
			this.offContext.fillStyle = "black";
			var tw = this.width - 2 * this.padding;
			for (var i = 0; i < marks.length; i++) {
				// if (i == 0) {
				// 	this.offContext.textAlign = "start"
				// } 
				// else if (i == marks.length - 1) {
				// 	this.offContext.textAlign = "end";
				// } 
				// else {
				// 	this.offContext.textAlign = "center";
				// };
				this.offContext.textAlign = "center";
				this.offContext.fillText(marks[i], this.padding + i * tw / (marks.length - 1), this.headHeight + this.titleHeight, 2 * this.padding);
			};
			this.offContext.stroke();
			// 月度消费进度条
			for (var i = 0; i < data.length; i++) {
				var top = this.headHeight + this.titleHeight + this.lineHeight * i;
				// month
				this.offContext.beginPath();
				this.offContext.font = "12px Verdana";
				this.offContext.textBaseline = "middle";
				this.offContext.textAlign = "start";
				this.offContext.fillStyle = "black";
				this.offContext.fillText(this.getMonthWord(new Date(data[i].date)), this.padding, top + this.lineHeight / 4);

				// slider
				this.offContext.beginPath();
				this.offContext.strokeStyle = "black";
				this.offContext.strokeRect(this.padding + 0.5, top + 0.5 + this.lineHeight / 2, this.width - 2 * this.padding - 1, this.sliderHeight);
				this.offContext.fillStyle = "black";
				this.offContext.fillRect(this.padding + 0.5, top + 0.5 + this.lineHeight / 2,
					Math.round((this.width - 2 * this.padding) * data[i].spend / this.maxVal) - 1, this.sliderHeight);
			}
		},
		drawPointer: function(locX) {
			var top = this.height - this.footHeight;
			var spend = this.maxVal * (locX - this.padding) / (this.width - 2 * this.padding);
			var left = locX == 0 ? 0.5 : locX - 0.5;
			var pw = Math.round(this.pointWidth / 2);

			// 指针图
			this.context.beginPath();
			this.context.moveTo(left - pw, top);
			this.context.lineTo(left, top - 8 + 0.5);
			this.context.lineTo(left + pw, top);
			this.context.lineTo(left + pw, top + this.footHeight);
			this.context.lineTo(left - pw, top + this.footHeight);
			this.context.closePath();
			this.context.fillStyle = "black";
			this.context.fill();
			// 指针线
			this.context.beginPath();
			this.context.moveTo(left, top - 8);
			this.context.lineTo(left, this.headHeight + this.titleHeight);
			this.context.strokeStyle = "black";
			this.context.stroke();
			// 显示数值
			this.context.beginPath();
			this.context.font = "32px verdana";
			this.context.textBaseline = "bottom";
			this.context.textAlign = "start"
			this.context.fillStyle = "black";
			this.context.fillText(spend.toFixed(2), this.padding + 10, this.headHeight);
		},
		draw: function() {
			this.context.drawImage(this.offCanvas, 0, 0, this.offCanvas.width, this.offCanvas.height);
			this.drawPointer(0.6 * (this.width - 2 * this.padding));
			this.addEventHandlers();
		},
		addEventHandlers: function() {
			var slider = this;
			this.canvas.onmousedown = function(e) {
				e.preventDefault(e);
				slider.mouseDownOrTouchStart(slider.windowToCanvas(slider.canvas, e.clientX, e.clientY));
			}
			this.canvas.onmousemove = function(e) {
				e.preventDefault(e);
				slider.mouseMoveOrTouchMove(slider.windowToCanvas(slider.canvas, e.clientX, e.clientY));
			}
			this.canvas.onmouseup = function(e) {
				e.preventDefault(e);
				slider.mouseUpOrTouchEnd(slider.windowToCanvas(slider.canvas, e.clientX, e.clientY));
			}
			this.canvas.onmouseout = function(e) {
				slider.dragging = false;
			}
			this.canvas.ontouchstart = function(e) {
				e.preventDefault(e);
				slider.mouseDownOrTouchStart(slider.windowToCanvas(slider.canvas, e.touches[0].pageX, e.touches[0].pageY));
			}
			this.canvas.ontouchmove = function(e) {
				e.preventDefault(e);
				slider.mouseMoveOrTouchMove(slider.windowToCanvas(slider.canvas, e.touches[0].pageX, e.touches[0].pageY));
			}
			this.canvas.ontouchend = function(e) {
				e.preventDefault(e);
				slider.mouseUpOrTouchEnd(slider.windowToCanvas(slider.canvas, e.touches[0].pageX, e.touches[0].pageY));
			}
			this.canvas.ontouchcancel = function(e) {
				slider.dragging = false;
			}
		},
		erase: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		mouseDownOrTouchStart: function(loc) {
			if (!this.downInFooter(loc)) {
				this.dragging = false;
				return;
			}
			this.dragging = true;
			this.erase();
			this.context.drawImage(this.offCanvas, 0, 0, this.offCanvas.width, this.offCanvas.height);
			this.drawPointer(loc.x);
		},
		mouseMoveOrTouchMove: function(loc) {
			if (!this.dragging) {
				return;
			}
			if (loc.x < this.padding) {
				loc.x = this.padding;
			}
			if (loc.x > this.canvas.width - this.padding) {
				loc.x = this.canvas.width - this.padding;
			}
			this.erase();
			this.context.drawImage(this.offCanvas, 0, 0, this.offCanvas.width, this.offCanvas.height);
			this.drawPointer(loc.x);
		},
		mouseUpOrTouchEnd: function(loc) {
			this.dragging = false;
		},
		windowToCanvas: function(canvas, x, y) {
			var bbox = this.canvas.getBoundingClientRect();
			return {
				x: x - bbox.left * (this.canvas.width / bbox.width),
				y: y - bbox.top * (this.canvas.height / bbox.height)
			};
		},
		getMaxOver: function(d) {
			var maxVal = 0;
			for (var i = 0; i < d.length; i++) {
				maxVal = Math.max(maxVal, Math.abs(d[i].spend));
			};
			maxVal = 1.1 * maxVal;
			return Math.ceil(maxVal);
		},
		downInFooter: function(loc) {
			this.context.beginPath();
			this.context.rect(this.padding + 0.5, this.height - this.footHeight + 0.5, this.width - 2 * this.padding - 1, this.footHeight - 1);
			return this.context.isPointInPath(loc.x, loc.y);
		},
		// 计算刻度值
		getMarks: function(num) {
			var startMark, endMark;
			endMark = formatNumber(num, Math.ceil);
			for (var i = 5; i >= 2; i--) {
				startMark = formatNumber(endMark.value * Math.pow(10, endMark.pow) / i, Math.ceil);
				if (parseInt(startMark.value) == startMark.value) {
					var arr = new Array(i);
					for (var j = 0; j <= i; j++) {
						arr[j] = startMark.value * Math.pow(10, startMark.pow) * (j);
					}
					// console.log(arr);
					this.maxVal = arr[i];
					return arr;
				}
			}
			if (parseInt(endMark.value) == endMark.value) {
				return getMarks((1 + parseInt(endMark.value)) * Math.pow(10, endMark.pow));
			} else {
				return getMarks((endMark.value) * Math.pow(10, endMark.pow) + Math.pow(10, endMark.pow - 1));
			}

			function formatNumber(value, roundingFunction) {
				var abs = Math.abs(value),
					abbr, pow;
				if (abs >= Math.pow(10, 12)) {
					// trillion
					abbr = "t";
					pow = 12;
					value = value / Math.pow(10, 12);
				} else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
					// billion
					abbr = "b";
					pow = 9;
					value = value / Math.pow(10, 9);
				} else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
					// million
					abbr = "m";
					pow = 6;
					value = value / Math.pow(10, 6);
				} else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
					// thousand
					abbr = "k";
					pow = 3;
					value = value / Math.pow(10, 3);
				} else {
					abbr = "";
					pow = 0;
				}
				return {
					"value": toFixed(value, 1, roundingFunction),
					"abbr": abbr,
					"pow": pow
				};
			}

			function toFixed(value, precision, roundingFunction) {
				var power = Math.pow(10, precision),
					optionalsRegExp,
					output;

				output = (roundingFunction(value * power) / power).toFixed(precision);
				optionalsRegExp = new RegExp('.0$');
				output = output.replace(optionalsRegExp, '');
				return output;
			}
		},
		getMonthWord: function(date) {
			var mouth = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			return mouth[date.getMonth()];
		},
		drawGrid: function(color, stepx, stepy, context) {
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
	}
})()