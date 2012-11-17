angular.module('log-graph', []).
	value('apiKey','50728d46e4b088be4c29ea02').
	directive('barGraph', function () {
	 
		var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = 800 - margin.left - margin.right,
				height = 300 - margin.top - margin.bottom,
				color = d3.interpolateRgb("#f77", "#77f");
			
		return {
			restrict: 'E',
			scope: {
				val: '='
			},
			link : function (scope, element, attrs) {
				var chart = d3.select(element[0])
										.append("svg")
										.attr("class", "chart")
										.attr("width", width + margin.left + margin.right)
										.attr("height", height  + margin.top + margin.bottom)
										.append("g")
										.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				scope.$watch('val', function(newVal, oldVal) {
					var nomalizedValue =[],
							x, y, xAxis, yAxis;

					if(!newVal){
						return;
					}

					chart.selectAll('*').remove();

					nomalizedValue = _.map(_.groupBy(newVal,function(val) {
															return val.time;
														}),function(v,k) {
															return { time: k, num : _.reduce(v,function(p,n,m) {
															return m+1;
															},0)};
														});

					x = d3.scale.ordinal()
						.domain(_.map(nomalizedValue,function(d) {return d.time;}))
						.rangeBands([0, width]);

					y = d3.scale.linear()
						.domain([0, d3.max(_.map(nomalizedValue,function(d) {return d.num;}))])
						.range([height, 0]);

					xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom");

					yAxis = d3.svg.axis()
						.scale(y)
						.orient("left");

					chart.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis);

					chart.append("g")
						.attr("class", "y axis")
						.call(yAxis)
						.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text("완료 횟수");

					chart.selectAll("rect")
						.data(nomalizedValue)
						.enter().append("rect")
						.attr("class", "bar")
						.attr("x", function(d) { return x(d.time); })
						.attr("width", x.rangeBand())
						.attr("y", function(d) { return y(d.num); })
						.attr("height", function(d) {return height - y(d.num); });
				});
			}
		};
	}).
	controller('graphCtrl',function($scope, $http) {
		var userName = "jeado",
				data = [];

		$scope.name = userName;

		$scope.getData = function() {
			$http.get('https://api.mongolab.com/api/1/databases/angular-todo/collections/logs',
			{
				params: {
					apiKey : '50728d46e4b088be4c29ea02'
				}
			})
			.success(function(data) {
				$scope.data = data;
			})
			.error(function(data, status) {
				throw Error(status);
			});
		};
	});

angular.bootstrap($('#log-graph'),['log-graph']);