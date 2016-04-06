var REPORT = REPORT || {};
(function() {
	REPORT.YearBook = function(data) {
		this.data = data;
		this.width = 320;
		this.height = this.lineHeight * data.length + this.headHeight;
		this.createCanvas();
	};
	REPORT.YearBook.prototype = {
		lineHeight: 50,
		wordWidth: 36,
		headHeight: 20.5,
		createCanvas: function() {
			this.canvas = document.createElement("canvas");
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.context = this.canvas.getContext('2d');
			return this.context;
		},
		appendTo: function(element) {
			element.appendChild(this.canvas);
		},
		update: function(data) {
			this.erase();
			this.data = data;
			this.height = this.lineHeight * data.length + this.headHeight;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.draw();
		},
		draw: function() {

			this.drawTitle();
			// 中轴
			this.context.beginPath();
			this.context.moveTo(this.width / 2 + 0.5, this.headHeight);
			this.context.lineTo(this.width / 2 + 0.5, this.canvas.height);
			this.context.stroke();
			this.drawGrid('lightgray', 10, 10, this.context);
			for (var i = data.length - 1; i >= 0; i--) {
				// 下一月
				if (data[i].predict.income != -1) {
					data[i].overX = this.width / 2 + (this.width / 2 - this.wordWidth) * (data[i].predict.income - data[i].predict.spend) / this.maxVal;
					data[i].overY = this.lineHeight * (data.length - 1 - i) + this.headHeight + this.lineHeight / 2;
				} else {
					data[i].overX = this.width / 2 + (this.width / 2 - this.wordWidth) * (data[i].income - data[i].spend) / this.maxVal;
					data[i].overY = this.lineHeight * (data.length - 1 - i) + this.headHeight + this.lineHeight / 2;
				}
			};
			// 画连线
			this.drawLine(data);
			for (var i = data.length - 1; i >= 0; i--) {
				var top = this.lineHeight * (data.length - 1 - i);
				this.context.beginPath();
				this.context.font = "12px Verdana";
				this.context.textBaseline = "middle";
				this.context.textAlign = "start";
				this.context.fillStyle = "black";
				this.context.fillText(this.getMonthWord(new Date(data[i].date)), 0, top + this.lineHeight / 2 + this.headHeight);
				// 月度虚线
				this.context.beginPath();
				this.context.moveTo(0, top + this.lineHeight / 2 + this.headHeight);
				this.context.dashedLineTo(0 + this.canvas.width, top + this.lineHeight / 2 + this.headHeight);
				this.context.lineWidth = 1;
				this.context.strokeStyle = "black";
				this.context.stroke();

				this.context.beginPath();
				this.context.arc(data[i].overX, data[i].overY, 4, 0, 2 * Math.PI, false);
				this.context.lineWidth = 1;
				if ((data[i].income - data[i].spend) >= 0) {
					this.context.fillStyle = "green";
				} else {
					this.context.fillStyle = "red";
				}
				this.context.closePath();
				this.context.fill();
				this.context.strokeStyle = "black";
				this.context.stroke();

			};
		},
		erase: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		getMarks: function(num) {
			var startMark, endMark;
			endMark = formatNumber(num, Math.ceil);
			for (var i = 3; i >= 2; i--) {
				startMark = formatNumber(endMark.value * Math.pow(10, endMark.pow) / i, Math.ceil);
				if (parseInt(startMark.value) == startMark.value) {
					var arr = new Array(i);
					for (var j = 0; j < i; j++) {
						arr[j] = formatNumber(startMark.value * Math.pow(10, startMark.pow) * (j + 1), Math.ceil);
					}
					// console.log(arr);
					REPORT.YearBook.prototype.maxVal = arr[i - 1].value * Math.pow(10, arr[i - 1].pow);
					return arr;
				}
			}
			if (parseInt(endMark.value) == endMark.value) {
				return arguments.callee((1 + parseInt(endMark.value)) * Math.pow(10, endMark.pow));
			} else {
				return arguments.callee((endMark.value) * Math.pow(10, endMark.pow) + Math.pow(10, endMark.pow - 1));
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
		},
		drawTitle: function() {
			this.context.beginPath();
			this.context.font = "12px verdana";
			this.context.textBaseline = "bottom";
			this.context.textAlign = "center";
			this.context.fillStyle = "black";
			var marks = this.getMarks(this.getMaxOver(data));
			var w = this.width / 2 - this.wordWidth;
			this.context.fillText("0k", this.width / 2, this.headHeight);
			for (var i = 0; i < marks.length; i++) {
				this.context.fillText(marks[i].value + marks[i].abbr, this.width / 2 + (i + 1) * w / marks.length, this.headHeight);
				this.context.fillText(-marks[i].value + marks[i].abbr, this.width / 2 - (i + 1) * w / marks.length, this.headHeight);
			};
			this.context.stroke();
		},
		getMonthWord: function(date) {
			var mouth = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			return mouth[date.getMonth()];
		},
		getMaxOver: function(d) {
			var maxVal = 0;
			for (var i = 0; i < d.length; i++) {
				maxVal = Math.max(maxVal, Math.abs(d[i].income - d[i].spend), Math.abs(d[i].predict.income - d[i].predict.spend));
			};
			return Math.ceil(maxVal);
		},
		drawLine: function(data) {
			for (var i = data.length - 1; i > 0; i--) {
				this.context.beginPath();
				this.context.moveTo(data[i].overX, data[i].overY);
				if (i == data.length - 1) {
					this.context.dashedLineTo(Math.floor(data[i - 1].overX), Math.floor(data[i - 1].overY));
				} else {
					this.context.lineTo(Math.floor(data[i - 1].overX), Math.floor(data[i - 1].overY));
				}
				this.context.lineWidth = 1;
				this.context.strokeStyle = "black";
				this.context.stroke();
			};

		},
		drawGrid: function(color, stepx, stepy, context) {
			this.context.strokeStyle = color;
			this.context.lineWidth = 0.5;
			for (var i = stepx + 0.5; i < this.context.canvas.width; i += stepx) {
				this.context.beginPath();
				this.context.moveTo(i, 0);
				this.context.lineTo(i, this.context.canvas.height);
				this.context.stroke();
			}
			for (var i = stepy + 0.5; i < this.context.canvas.height; i += stepy) {
				this.context.beginPath();
				this.context.moveTo(0, i);
				this.context.lineTo(this.context.canvas.width, i);
				this.context.stroke();
			}
		}
	};
	// 画虚线方法扩展	
	var moveToFunction = CanvasRenderingContext2D.prototype.moveTo;
	CanvasRenderingContext2D.prototype.lastMoveToLocation = {};
	CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
		moveToFunction.apply(this, [x, y]);
		this.lastMoveToLocation.x = x;
		this.lastMoveToLocation.y = y;
	};
	CanvasRenderingContext2D.prototype.dashedLineTo = function(x, y, dashLength) {
		dashLength = dashLength === undefined ? 4 : dashLength;
		var startX = this.lastMoveToLocation.x;
		var startY = this.lastMoveToLocation.y;
		var deltaX = x - startX;
		var deltaY = y - startY;
		var numDashes = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength);
		for (var i = 0; i < numDashes; i++) {
			this[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * i, startY + (deltaY / numDashes) * i);
		}
		this.moveTo(x, y);
	};
})()