
///////////////////////////////////////////////////
// 
//				Topline Metrics Charts
//
///////////////////////////////////////////////////

// load data using promises
var promises = [
  d3.csv("data/speech_polarity_and_diversity.csv"),
  d3.csv("data/top_20_words_by_president.csv"),
  d3.csv("data/presidential_topics.csv"),
  d3.csv("data/monthly_time_series_viz_data_approvals.csv"),
  d3.csv("data/sentiment_vs_economics.csv"),
  d3.csv("data/speech_emotion_for_model_syuzhet.csv")
]

Promise.all(promises).then(ready)

function ready([speech_polarity_and_diversity, top_20_words_by_president, presidential_topics, monthly_time_series_viz_data_approvals, sentiment_vs_economics]) {

	// initialize empty list
	var selector_names = [];

	// last five presidents
	var last_five_presidents = ['DONALD TRUMP', 'BARACK OBAMA', 'GEORGE W. BUSH', 'BILL CLINTON'];

	// format data
	speech_polarity_and_diversity.forEach(function(d) {
		d.president_name = d.president_name;
		d.positive = +d.positive;
		d.negative = +d.negative;
		d.sentiment = +d.sentiment;
		d.speech_diversity = +d.speech_diversity;
	});

	// initailize charts			
    var svg = d3.select('#chart1');
	var svg2 = d3.select('#chart2');
	var svg3 = d3.select('#chart3');
	var svg4 = d3.select('#chart4');

	// get unique president names
	var presidents = [];

	for (var i = 0; i < speech_polarity_and_diversity.length; i++) {
		presidents.push(speech_polarity_and_diversity[i].president_name);
	}

	// function to get word diversity
	var topline_metrics_charts = function(selector_names) {

		// filter data to selected name
		var data_filtered = [];

		for (var i = 0; i < selector_names.length; i++) {
			for (var j = 0; j < speech_polarity_and_diversity.length; j++) {
				if (selector_names[i] == speech_polarity_and_diversity[j].president_name) {
					data_filtered.push(speech_polarity_and_diversity[j]);
				}
			}
		}

		var data_filtered_negative_sum = 0;
		var data_filtered_positive_sum = 0;
		var data_filtered_sentiment_sum = 0;
		var data_filtered_speech_diversity_sum = 0;

		// average metrics in list
		for (var i = 0; i < data_filtered.length; i++) {
			data_filtered_negative_sum += data_filtered[i].negative;
			data_filtered_positive_sum += data_filtered[i].positive;
			data_filtered_sentiment_sum += data_filtered[i].sentiment;
			data_filtered_speech_diversity_sum += data_filtered[i].speech_diversity;
		}
		var data_filtered_avg = [];
		data_filtered_avg["negative"] = data_filtered_negative_sum / data_filtered.length;
		data_filtered_avg["positive"] = data_filtered_positive_sum / data_filtered.length;
		data_filtered_avg["sentiment"] = data_filtered_sentiment_sum / data_filtered.length;
		data_filtered_avg["speech_diversity"] = data_filtered_speech_diversity_sum / data_filtered.length;

			// chart 1 - word diversity
			var word_diversity = svg.append("p")
				.text((Math.round(data_filtered_avg.speech_diversity*10) / 10) + '')
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 2 - negative words
			var word_diversity = svg2.append("p")
				.text((Math.round(data_filtered_avg.negative*10)/10) + '')
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 3 - positive words
			var word_diversity = svg3.append("p")
				.text((Math.round(data_filtered_avg.positive*10)/10) + '')
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 2 - sentiment score
			var word_diversity = svg4.append("p")
				.text((Math.round(data_filtered_avg.sentiment*10)/10) + '')
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

	};

	////////////////////////////////////////////////
	//   Monthly Time Series: Approval vs. Sentiment
	/////////////////////////////////////////////////

	// Create parse data format
	var format = d3.timeParse("%Y-%m-%d");

	// format data
	monthly_time_series_viz_data_approvals.forEach(function(d) {
		d.president = d.president;
		d.speech_year = +d.speech_year;
		d.month = format(d.month);
		d.avg_sentiment = +d.avg_sentiment
		d.avg_approval = +d.avg_approval;
	});

	var monthlyTimeSeries1 = function(selector_names) {

		var monthly_time_series_filtered = [];
		for (var i = 0; i < selector_names.length; i++) {
			for (j = 0; j < monthly_time_series_viz_data_approvals.length; j++) {
				if (selector_names[i] == monthly_time_series_viz_data_approvals[j].president) {
					monthly_time_series_filtered.push(monthly_time_series_viz_data_approvals[j]);
				}
			}
		}

	    // sort by date
	    var sortDate = function(a, b) {
	    	return a.month - b.month;
	    };

	    monthly_time_series_filtered = monthly_time_series_filtered.sort(sortDate);

		// set margins and padding
		var margin = {top: 50, right: 50, bottom: 30, left: 45},
	    	width = 500 - margin.left - margin.right,
	    	height = 500 - margin.top - margin.bottom,
	    	padding = 20;

	    // set the ranges
		var x = d3.scaleTime().range([0, width]);
		var y0 = d3.scaleLinear().range([height, 0]);
		var y1 = d3.scaleLinear().range([height, 0]);

		// define the 1st line
		var valueline = d3.line()
			.curve(d3.curveBasis) 
		    .x(function(d) { return x(d.month); })
		    .y(function(d) { return y0(d.avg_sentiment); });

		// define the 2nd line
		var valueline2 = d3.line()
			.curve(d3.curveBasis) 
		    .x(function(d) { return x(d.month); })
		    .y(function(d) { return y1(d.avg_approval); });

		// append the svg object to the body of the page
		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		var svg = d3.select("#chart7").append("svg")
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 500")
		  .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		 // Scale the range of the data
	  	x.domain(d3.extent(monthly_time_series_filtered, function(d) { return d.month; }));
	  	y0.domain(d3.extent(monthly_time_series_filtered, function(d) { return d.avg_sentiment; }));
	  	y1.domain([0, 1]);

	  	  // Add the valueline path.
	  	svg.append("path")
	    	.data([monthly_time_series_filtered])
	      	.attr("class", "line")
	      	.style("stroke-width", '3px')
	      	.attr("d", valueline);

	  	// Add the valueline2 path.
	  	svg.append("path")
      		.data([monthly_time_series_filtered])
      		.attr("class", "line")
      		.style("stroke", "steelblue")
      		.style("stroke-width", '3px')
      		.attr("d", valueline2);

	  	// Add the X Axis
	  	svg.append("g")
	    	.attr("transform", "translate(0," + height + ")")
	    	.call(d3.axisBottom(x)
	    		.tickFormat(d3.timeFormat("%Y")));

	  	// Add the Y0 Axis
	  	svg.append("g")
	    	.attr("class", "axisSteelBlue")
	    	.style("color", "#33adff")
	    	.call(d3.axisLeft(y0));

	  	// Add the Y1 Axis
	  	svg.append("g")
	    	.attr("class", "axisRed")
	    	.style("color", "steelblue")
	    	.attr("transform", "translate( " + width + ", 0 )")
	    	.call(d3.axisRight(y1));

        // add title
        svg.append("text")
        	.attr("class", "summary-text-top")
            .attr("text-anchor", "start")
            .attr("x", -padding)
            .attr("y", -padding)
            .text("Monthly Sentiment vs. Approval");

        // Add x axis label
        svg.append("text")
		    .attr("class", "x label")
		    .attr("text-anchor", "end")
		    .attr("x", margin.left + width/2)
		    .attr("y", height + 30)
		    .text("Date");

		// Add y axis label
		svg.append("text")
		    .attr("class", "y label")
		    .style("fill", "#33adff")
		    .attr("text-anchor", "center")
		    .attr("x", -height/2 - margin.bottom)
		    .attr("y", -padding*2)
		    .attr("dy", ".75em")
		    .attr("transform", "rotate(-90)")
		    .text("Sentiment Score");

		// Add y2 axis label
		svg.append("text")
		    .attr("class", "y label")
		    .style("fill", "steelblue")
		    .attr("text-anchor", "center")
		    .attr("x", -height/2 - margin.bottom)
		    .attr("y", width + margin.left - 10)
		    .attr("dy", ".75em")
		    .attr("transform", "rotate(-90)")
		    .text("Approval Rating");

	};

	/////////////////////////////////////////////////
	//   Monthly Time Series: Economics vs. Sentiment
	/////////////////////////////////////////////////

	// format data
	sentiment_vs_economics.forEach(function(d) {
		d.president = d.president;
		d.speech_year = +d.speech_year;
		d.month = format(d.month);
		d.avg_sentiment = +d.avg_sentiment
		d.avg_approval = +d.avg_approval;
		d.unemploychg = +d.unemploychg;
		d.sp500chg = +d.sp500chg;
		d.cons_sentchg = +d.cons_sentchg;
		d.real_gdpchg = +d.real_gdpchg;
		d.cpichg = +d.cpichg;
		d.pcechg = +d.pcechg;
		d.gdpc1chg = +d.gdpc1chg;
		d.ind_prochg = +d.ind_prochg;
		d.savingschg = +d.savingschg;
		d.avg_sentiment_ctr = +d.avg_sentiment_ctr;
	});

	var monthlyTimeSeries2 = function(selector_names) {

		// set margins and padding
		var margin = {top: 5, right: 45, bottom: 40, left: 40},
	    	width = 500 - margin.left - margin.right,
	    	height = 250 - margin.top - margin.bottom,
	    	padding = 20;
		var headHeight = 60;
    	var color = d3.scaleOrdinal(["#000000", "#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);
		var overlappingPathOpacity = 0.5;
		var legendRectSize = 15;
		var legendSpacing = 4;

		var monthly_time_series_filtered2 = [];
		for (var i = 0; i < selector_names.length; i++) {
			for (var j = 0; j < sentiment_vs_economics.length; j++) {
				if (selector_names[i] == sentiment_vs_economics[j].president) {
					monthly_time_series_filtered2.push(sentiment_vs_economics[j]);
				}
			}
		}

		if (monthly_time_series_filtered2.length == 0) {
			for (var j = 0; j < sentiment_vs_economics.length; j++) {
				monthly_time_series_filtered2.push(sentiment_vs_economics[j]);
			}
		}

		d3.select("#chart8header").append("p")
	  		.text("Sentiment vs. Economic Data: 1959 - 2018")
	  		.attr("class", "summary-text-top");

		var nY = d3.extent(monthly_time_series_filtered2, function(d) { return d.speech_year; });
		var numYears = nY[1] - nY[0];

	    // sort by date
	    var sortDate = function(a, b) {
	    	return a.month - b.month;
	    };

	    monthly_time_series_filtered2 = monthly_time_series_filtered2.sort(sortDate);

		var x = d3.scaleTime().range([0, width]);
		var y = d3.scaleLinear().range([height, 0]);
		var yr = d3.scaleLinear().range([height, 0]);

		var xRange = d3.extent(monthly_time_series_filtered2, function(d) { return d.month; });
		var yRange = [d3.min(monthly_time_series_filtered2, function(d) {return d3.min(Object.values(d).slice(6,17));}), 
						d3.max(monthly_time_series_filtered2, function(d) {return d3.max(Object.values(d).slice(6,17));})];
		
		x.domain(xRange);
		y.domain(yRange);
		yr.domain(d3.extent(monthly_time_series_filtered2, function(d) { return d.avg_sentiment; }));

		var lineas = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return yr(d.avg_sentiment); });

		var lineue = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.unemploychg); });

		var linesp = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.sp500chg); });                      

		var linecs = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.cons_sentchg); });

		var linerg = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.real_gdpchg); });											

		var linecp = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.cpichg); });

		var linepc = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.pcechg); });

		var lineip = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.ind_prochg); });

		var linesv = d3.line()
		.curve(d3.curveBasis) 
		.x(function(d) { return x(d.month); })
		.y(function(d) { return y(d.savingschg); });

		var svg = d3.select("#chart8").append("svg")
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 250")
		  .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		// Axis Labels
		d3.select("#chart8 svg").append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", margin.left + width/2)
		.attr("y", height + margin.top + margin.bottom - 7)
		.text("Time");

		d3.select("#chart8 svg").append("text")
		.attr("class", "y label")
		.attr("text-anchor", "center")
		.attr("x", -height/2 - margin.bottom)
		.attr("y", 7)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text("Econometric Percent Change");

		d3.select("#chart8 svg").append("text")
		.attr("class", "yr label")
		.attr("text-anchor", "center")
		.attr("x", -height/2 - margin.bottom)
		.attr("y", width + margin.left + 33	)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text("Average Speech Sentiment");

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "asline")
		.attr("d", lineas)
		.attr("data-legend","Average Sentiment")
		.attr("visibility","visible")
		.style("fill", "none")
		.style("stroke", function(d) { return color(1) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "ueline")
		.attr("d", lineue)
		.attr("data-legend","Unemployment")
		.attr("visibility","visible")
		.style("fill", "none")
		.style("stroke", function(d) { return color(2) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "spline")
		.attr("d", linesp)
		.attr("data-legend","S&P 500")
		.attr("visibility","visible")
		.style("fill", "none")
		.style("stroke", function(d) { return color(3) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "csline")
		.attr("d", linecs)
		.attr("data-legend","Consumer Sentiment")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(4) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "rgline")
		.attr("d", linerg)
		.attr("data-legend","Real GDP")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(5) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "cpline")
		.attr("d", linecp)
		.attr("data-legend","CPI")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(6) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "pcline")
		.attr("d", linepc)
		.attr("data-legend","Personal Consumption")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(7) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "ipline")
		.attr("d", lineip)
		.attr("data-legend","Industrial Production")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(8) } );

		svg.append("path")
		.datum(monthly_time_series_filtered2)
		.attr("class", "svline")
		.attr("d", linesv)
		.attr("data-legend","Personal Savings")
		.attr("visibility","hidden")
		.style("fill", "none")
		.style("stroke", function(d) { return color(9) } );

	  	// Add the X Axis
	  	svg.append("g")
	    	.attr("transform", "translate(0," + height + ")")
	    	.call(d3.axisBottom(x));

	  	// Add the Y Axis
	  	svg.append("g")
	    	.attr("class", "axisSteelBlue")
	    	.call(d3.axisLeft(y));

	  	// Add the YR Axis
	  	svg.append("g")
	    	.attr("class", "axisRed")
	    	.attr("transform", "translate( " + width + ", 0 )")
	    	.call(d3.axisRight(yr));

		// gridlines in x axis function
		function make_x_gridlines() {		
		    return d3.axisBottom(x)
		        .ticks(15)
		}

		// gridlines in y axis function
		function make_y_gridlines() {		
		    return d3.axisLeft(y)
		        .ticks(10)
		}

		// add the X gridlines
		svg.append("g")			
		  .attr("class", "grid")
		  .attr("transform", "translate(0," + height + ")")
		  .call(make_x_gridlines()
		      .tickSize(-height)
		      .tickFormat("")
		  )

		// add the Y gridlines
		svg.append("g")			
		  .attr("class", "grid")
		  .call(make_y_gridlines()
		      .tickSize(-width)
		      .tickFormat("")
		  )

		// header
		var svghead = d3.select("#chart8header").append("svg")
		.attr("width", width + margin.left + margin.right*2 + padding*4)
		.attr("height", headHeight)
		.append("g")
		.attr("transform", "translate(" + (margin.left + padding*6) + ",0)");

		d3.select("#chart8header svg").append("text")
		.attr("x",padding*2)
		.attr("y",12)
		.text("Legend:")
		.style("font-weight","bold");
		
		d3.select("#chart8header svg").append("text")
		.attr("x",padding*2)
		.attr("y",32)
		.text("(click to select)");

		var legend = svghead.selectAll('.legend')
		.data(color.domain())
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i) {
			var column = Math.floor(i/3);
			var height = legendRectSize + legendSpacing;
					var offset =  legendSpacing;
					var horz = column*150;
					var vert = i * height - (column * 3 * height) + offset;
					return 'translate(' + horz + ',' + vert + ')';
				});

		legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', color)
		.style("fill-opacity", function(d, i) {
			if (i < 3) {
				return overlappingPathOpacity;
			} else {
				return 0;
			}})
		.style('stroke', color);

		legend.append('text')
		.attr('x', legendRectSize + legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
		.text(function(d,i) { 
			if (i == 0) {
				return "Speech Sentiment"
			} else if (i == 1) {
				return "Unemployment"
			} else if (i == 2) {
				return "S&P 500"
			} else if (i == 3) {
				return "Consumer Sentiment"
			} else if (i == 4) {
				return "Real GDP"
			} else if (i == 5) {
				return "CPI"
			} else if (i == 6) {
				return "Personal Consumption"
			} else if (i == 7) {
				return "Industrial Production"
			} else if (i == 8) {
				return "Personal Savings"
			};
		});

		d3.select(".clickableLegend").remove();
		
		svghead.append("rect")
		.attr("class","clickableLegend")
		.attr("width", 475)
		.attr("height", (legendRectSize + legendSpacing) * 3)
		.on('click', function(d) { legClicked(d3.mouse(this)) });

	};


	function legClicked(mouse) {

		var legendRectSize = 15;
		var legendSpacing = 4;
		var overlappingPathOpacity = 0.5;

		var whichColumn = Math.floor(mouse[0]/150);

		var whichLeg = Math.floor(mouse[1]/(legendRectSize + legendSpacing)) + 3*whichColumn;
		
		if (whichLeg == 0) {
			d3.select(".asline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};

		if (whichLeg == 1) {
			d3.select(".ueline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
		
		if (whichLeg == 2) {
			d3.select(".spline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};

		if (whichLeg == 3) {
			d3.select(".csline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
		
		if (whichLeg == 4) {
			d3.select(".rgline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
		
		if (whichLeg == 5) {
			d3.select(".cpline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
				
		if (whichLeg == 6) {
			d3.select(".pcline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
				
		if (whichLeg == 7) {
			d3.select(".ipline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};
				
		if (whichLeg == 8) {
			d3.select(".svline")
			.attr("visibility", function() {
				if (d3.select(this).attr("visibility") == "visible") {
					return "hidden";
				} else {
					return "visible";
				}});
		};

		d3.selectAll(".legend rect")
		.style("fill-opacity", function(d, i) {
			var existOpacity = d3.select(this).style("fill-opacity");
			if ((d-1) == whichLeg) {
				if (existOpacity == 0) {
					return overlappingPathOpacity;
				} else {
					return 0;
				};
			} else {
				return existOpacity;
			};
		});

	};


	////////////////////////////////////////////////
	//   Linear Regression Scatter Plot
	////////////////////////////////////////////////

	var regressionScatter = function(selector_names) {

		// Filter NA values in avg approval for complete regression data set
		monthly_time_series = monthly_time_series_viz_data_approvals.filter(function(d) {
			return !isNaN(d.avg_approval);
		});

		monthly_time_series = monthly_time_series.filter(function(d) {
			return d.avg_sentiment >= 0.0;
		});

		monthly_time_series = monthly_time_series.filter(function(d) {
			return !isNaN(d.avg_sentiment);
		});

		var monthly_time_series_filtered = [];
		for (var i = 0; i < selector_names.length; i++) {
			for (var j = 0; j < monthly_time_series.length; j++) {
				if (selector_names[i] == monthly_time_series[j].president) {
					monthly_time_series_filtered.push(monthly_time_series[j]);
				}
			}
		};

		if (monthly_time_series_filtered.length == 0) {
			for (var j = 0; j < monthly_time_series.length; j++) {
				monthly_time_series_filtered.push(monthly_time_series[j]);
			}
		};

		// sort by date
	    var sortApproval = function(a, b) {
	    	return a.avg_approval - b.avg_approval;
	    };

	    monthly_time_series_filtered = monthly_time_series_filtered.sort(sortApproval);

		var x_property = "avg_approval", y_property = "avg_sentiment";

		var margin = {left: 45, right: 5, top: 5, bottom: 35},
		  aspect_ratio = .68,
		  width,
		  height;

		var x_scale = d3.scaleLinear();
		var y_scale = d3.scaleLinear();

		var x_axis_generator = d3.axisBottom().tickFormat(d => d)
		var y_axis_generator = d3.axisLeft();

		var loess_generator = science.stats.loess(), loess_values, loess_data;
		var line_generator = d3.line()
			.x(d => x_scale(d[x_property]))
			.y(d => y_scale(d[y_property]));

		var input = d3.select("input");

		var svg = d3.select("#chart9").append("svg");

		var g = svg.append("g");

		var x_axis = g.append("g");
		var y_axis = g.append("g");

		var x_values = monthly_time_series_filtered.map(d => d[x_property]);
		var y_values = monthly_time_series_filtered.map(d => d[y_property]);

		x_scale.domain(d3.extent(x_values));
		y_scale.domain(d3.extent(y_values));

		var points = g.selectAll("circle")
		    .data(monthly_time_series_filtered)
		  .enter().append("circle")
		    .attr("r", 3);

		draw = function(resizing, adjusting){
		  if (resizing){
		    width = 500 - margin.left - margin.right;
	    	height = 200 - margin.top - margin.bottom;

		    x_scale.range([0, width]);
		    y_scale.range([height, 0]);

		    x_axis_generator.scale(x_scale);
		    y_axis_generator.scale(y_scale);

		    svg
		    	.attr("preserveAspectRatio", "xMinYMin meet")
	    		.attr("viewBox", "0 0 500 200");

		    g.attr("transform", "translate(" + [margin.left, margin.top] + ")");

		    x_axis
		        .attr("transform", "translate(0, " + height + ")")
		        .call(x_axis_generator);

		    y_axis.call(y_axis_generator);

		    points.attr("transform", d => "translate(" + [x_scale(d[x_property]), y_scale(d[y_property])] + ")");

		    // Add x axis label
	        svg.append("text")
			    .attr("class", "axis-label")
			    .attr("text-anchor", "end")
			    .attr("x", margin.left + width/2)
			    .attr("y", height + 35)
			    .text("Date");

			// Add y axis label
			svg.append("text")
			    .attr("class", "axis-label")
			    .attr("text-anchor", "center")
			    .attr("x", -height/2 - margin.bottom)
			    .attr("y", 5)
			    .attr("dy", ".75em")
			    .attr("transform", "rotate(-90)")
			    .text("Sentiment Score");
		  }

		  if (adjusting){
		    //var new_bandwidth = input.property("value") / 100;
			var new_bandwidth = +document.getElementById('slider').value;
			new_bandwidth = new_bandwidth / 100;
		    d3.select(".bandwidth").text(new_bandwidth.toFixed(2));
		    loess_generator.bandwidth(new_bandwidth);
		    loess_values = loess_generator(x_values, y_values);
		    loess_data = monthly_time_series_filtered.map((d, i) => ({avg_approval: d[x_property], avg_sentiment: loess_values[i]}));
		  }

		  var loess_line = g.selectAll(".loess-line")
		      .data([loess_data]);

		  loess_line.enter().append("path")
		      .attr("class", "loess-line")
		    .merge(loess_line)
		      .attr("d", line_generator);
		};

		draw(1, 1);
		window.addEventListener("resize", _ => draw(1, 0));
		input.on("input", _ => draw(0, 1));

		d3.select("#chart9header").append("p")
	  		.text("Linear Regression of Sentiment vs. Approval")
	  		.attr("class", "summary-text-top");
	};


	/////////////////////////////////////////////////
	//
	//			Top Words Bargraph
	//
	/////////////////////////////////////////////////

	// format data
	top_20_words_by_president.forEach(function(d) {
		d.president_name = d.president_name;
		d.word = d.word;
		d.word_count = +d.word_count;
	});

    // sort by word count
	top_20_words_by_president.sort(function(a, b){
	    if(a.word_count < b.word_count) { return -1; }
	    if(a.word_count > b.word_count) { return 1; }
	    return 0;
	});

	// set margins and padding
	var margin1 = {top: 60, right: 20, bottom: 20, left: 100},
    	width1 = 500 - margin1.left - margin1.right,
    	height1 = 500 - margin1.top - margin1.bottom,
    	padding1 = 20;

	var barViz = function(selector_names) {

		// filter data
		var top_20_words_filtered = top_20_words_by_president.filter(function(d) {
			return d.president_name=='ABRAHAM LINCOLN';
		})

		// filter data to selected name
		var words_filtered = [];

		for (var i = 0; i < selector_names.length; i++) {
			for (var j = 0; j < top_20_words_by_president.length; j++) {
				if (selector_names[i] == top_20_words_by_president[j].president_name) {
					var word_and_count = {"word": top_20_words_by_president[j].word, "word_count": top_20_words_by_president[j].word_count};
					words_filtered.push(word_and_count);
				}
			}
		}

		// calculate sum of each word
		var words_sum = [];

		for (var i = 0; i < words_filtered.length; i++) {
			var word_individual = {"word": words_filtered[i].word, "word_count": words_filtered[i].word_count};

			if (i < 20) {
				words_sum.push(word_individual);

			} else {

				for (j = 0; j < words_sum.length; j++) {
					if (words_filtered[i].word == words_sum[j].word) {
						words_sum[j].word_count = words_sum[j].word_count + word_individual.word_count;
						var added = 1;
					}
				}
				if (added != 1) {
					words_sum.push(word_individual);

				}
			}
		}

	    // sort by word count
		words_sum.sort(function(a, b){
		    if(a.word_count < b.word_count) { return 1; }
		    if(a.word_count > b.word_count) { return -1; }
		    return 0;
		});

		// get only top 20 words
		var words_clean = [];

		for (i = 0; i < 20; i ++) {
			words_clean.push(words_sum[i]);
		}

	    // reverse sort by word count
		words_clean.sort(function(a, b){
		    if(a.word_count < b.word_count) { return -1; }
		    if(a.word_count > b.word_count) { return 1; }
		    return 0;
		});

	    // make scales
	    var xScale = d3.scaleLinear()
	    	.domain([0, d3.max(words_clean, function(d) {return d.word_count;})])
	    	.range([0, width1]);

	    var yScale = d3.scaleBand()
	    	.range([height1, 0]).padding(.2)
	    	.domain(words_clean.map(function(d) {return d.word;}));

	   	// make y axis
	   	var yAxis  = d3.axisLeft(yScale).ticks(0);

	    // add svg element
	    var svg5 = d3.select("#chart5")
	    	.append("svg")
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 500")
	        .append("g")
	        .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

	    // add bar group
	    var bars = svg5.selectAll(".bar")
	    	.data(words_clean)
	    	.enter()
	    	.append("g");

	    // add bars
		bars.append("rect")
			.attr("class", "bar")
			.attr("y", function(d) {return yScale(d.word);})
			.attr("height", yScale.bandwidth())
			.attr("x", 0)
			.attr("width", function(d) {return xScale(d.word_count);})
			.style("fill", "#4db8ff");

		// add y axis
		svg5.append("g")
			.attr("class", "axis")
			.call(yAxis)
			.style("text-anchor", "start")
			.attr("transform", "translate(" + -padding1*4 + ", 0)");

        // add title
        svg5.append("text")
        	.attr("class", "bar-text")
            .attr("text-anchor", "start")
            .attr("x", -padding1*4.5)
            .attr("y", -padding1*1.3)
            .text("Top Words Used in Speech");

    	// add commas function
    	var addCommas = function(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			};

    	// add text annotation to bars
    	bars.append("text")
    		.attr("class", "label")
    		.attr("y", function(d) {return yScale(d.word) + yScale.bandwidth() / 2 + 4;})
    		.attr("x", function(d) {
				if (xScale(d.word_count) <= 30) {
					return xScale(d.word_count)+10;
				} else if (xScale(d.word_count) <= 50) {
					return xScale(d.word_count) - padding1*1.9;
    			} else if (xScale(d.word_count) <= 100) {
					return xScale(d.word_count) - padding1*1.9;
				} else if (xScale(d.word_count) <= 150) {
					return xScale(d.word_count) - padding1*1.9;
				} else {
    				return xScale(d.word_count) - padding1*2.3;
    			}})
    		.style("fill", function(d) {
    			if ((xScale(d.word_count) - padding1*1.5) <= 0) {
    				return "#4db8ff";
    			} else {
    				return "#fff";
    			};})
    		.text(function(d) {return addCommas(d.word_count);});

    	// mouseover function
    	bars.on("mouseover", function() {
    		d3.select(this)
    			.select("rect")
    			.style("fill", "steelblue");

    	});

    	// mouseout function
    	bars.on("mouseout", function() {
    		d3.select(this)
    		.select("rect")
    			.style("fill", "#4db8ff");

    	}); 

	};

	/////////////////////////////////////////////////
	//
	//			Topics Donut
	//
	/////////////////////////////////////////////////

	// set margins and padding
	var margin2 = {top: 10, right: 20, bottom: 20, left: 10},
    	width2 = 500 - margin2.left - margin2.right,
    	height2 = 500 - margin2.top - margin2.bottom,
    	padding2 = 20,
    	outerRadius = width2 / 2.8,
    	innerRadius = width2/3.6;

    // initialize pie
    var pie = d3.pie()
    	.value(function(d) {return d.topic_percent;});

    // make arc
    var arc = d3.arc()
    	.innerRadius(innerRadius)
    	.outerRadius(outerRadius);

    // set up 10 color ordinal
    var color = d3.scaleOrdinal(d3.schemeBlues[5]);

	// format data
	presidential_topics.forEach(function(d) {
		d.president_name = d.president_name;
		d.topic = d.topic;
		d.topic_percent = +d.topic_percent;
	});

    // sort by word count
	presidential_topics.sort(function(a, b){
	    if(a.topic_percent < b.topic_percent) { return -1; }
	    if(a.topic_percent > b.topic_percent) { return 1; }
	    return 0;
	});

	var donutViz = function(selector_names) {

		// filter data to selected name
		var topics_filtered = [];

		for (var i = 0; i < selector_names.length; i++) {
			for (var j = 0; j < presidential_topics.length; j++) {
				if (selector_names[i] == presidential_topics[j].president_name) {
					var topic_and_percent = {"topic": presidential_topics[j].topic, "topic_percent": presidential_topics[j].topic_percent};
					topics_filtered.push(topic_and_percent);
				}
			}
		}

		// calculate sum of each topic
		var topics_sum = [];

		for (var i = 0; i < topics_filtered.length; i++) {
			var topic_percent_individual = {"topic": topics_filtered[i].topic, "topic_percent": topics_filtered[i].topic_percent};

			if (i < 10) {
				topics_sum.push(topic_percent_individual);

			} else {

				for (j = 0; j < topics_sum.length; j++) {
					if (topics_filtered[i].topic == topics_sum[j].topic) {
						topics_sum[j].topic_percent = topics_sum[j].topic_percent + topic_percent_individual.topic_percent;
					} 
				}
			}
		}

		// recalculate percentages of topics based on new sum
		for (var i = 0; i < topics_sum.length; i++) {
			topics_sum[i].topic_percent = topics_sum[i].topic_percent / selector_names.length;
		}

	    // add svg element
	    var svg6 = d3.select("#chart6")
	    	.append("svg")
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 500")
	        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	    // set up groups
	    var arcs = svg6.selectAll("g.arc")
	    	.data(pie(topics_sum))
	    	.enter()
	    	.append("g")
	    	.attr("class", "arc")
	    	.attr("transform", "translate(" + outerRadius*1.45 + ", " + outerRadius*1.6 + ")");

	    // draw arc paths
	    arcs.append("path")
	    	.attr("fill", function(d) {return color(d.index);})
	    	.attr("d", arc);

	    // add text labels for wedges
	    arcs.append("text")
	    	.attr("class", "donut-labels")
	    	.attr("transform", function(d) {
	    		var pos = arc.centroid(d)

	    		pos[0] = pos[0] * 1.4;
	    		pos[1] = pos[1] * 1.4;
	    		return "translate(" + pos + ")";
	    	})
	    	.attr("text-anchor", "middle")
	    	.text(function(d, i) {
	    		if (Math.floor((topics_sum[i].topic_percent / 1) * 100) >= 2) {
	    		return topics_sum[i].topic  + ': ' + Math.floor((topics_sum[i].topic_percent / 1) * 100) + '%';
	    		}	
	    	});


	    // add lines connecting labels to slice
        var polyline = arcs.append("g")
        	.attr("class", "lines")
        	.selectAll('polyline')
            .data(pie(topics_sum))
            .enter()
            .append('polyline')
            .attr('points', function(d, i) {
            	if (Math.floor((topics_sum[i].topic_percent / 1) * 100) >= 2) {
	                var pos = arc.centroid(d);
		    		pos[0] = pos[0] * 1.27;
		    		pos[1] = pos[1] * 1.3;
	                return [arc.centroid(d), pos];
	            }
            });

	    // add title
	    svg6.append("text")
	    	.attr("class", "donut-text")
	        .attr("text-anchor", "start")
	        .attr("x", -(padding2*.1))
	        .attr("y", padding2*1.2)
	        .text("Topics Discussed in Speech");

	    // add tooltip
	    arcs.call(pieToolTip);

	    // create tooltip
	    function pieToolTip(selection) {

	    // add tooltip (svg circle element) when mouse enters slice
	    selection.on('mouseenter', function(data) {

	        svg6.append('text')
	            .attr('class', 'toolCircle')
	            .attr("transform", "translate(" + outerRadius*1.45 + ", " + outerRadius*1.6 + ")")
	            .html(function() {	

				    // return tip values
				    return Math.floor((data.data.topic_percent / 1) * 100) + "% Focus On " + data.data.topic;

	        	})
	            .style('text-anchor', 'middle'); // centres text in tooltip
   

	        svg6.append('circle')
	            .attr('class', 'toolCircle')
				.attr("transform", "translate(" + outerRadius*1.45 + ", " + outerRadius*1.6 + ")")
	            .attr('r', innerRadius *.95) 
	            .style('fill', color(data.index)) // colour based on category mouse is over
	            .style('fill-opacity', 0.7);

	    	});

		    // remove the tooltip when mouse leaves the slice/label
		    selection.on('mouseout', function () {
		        d3.selectAll('.toolCircle').remove();
		    });
		};

	};

	// initialize selector_names with only one name
	var selector_names_init = ["BARACK OBAMA"];

	// initialize selector
    topline_metrics_charts(selector_names_init);
    barViz(selector_names_init);
    donutViz(selector_names_init);
	monthlyTimeSeries1(selector_names_init);
	monthlyTimeSeries2(selector_names_init);
	regressionScatter(selector_names_init);

    // make year picker
  	var nameSelector = d3.select("#selector")
  		.selectAll("select");

  	nameSelector.selectAll(".name-select")
	    .data(presidents)
	    .enter()
	    .append("option")
	    .attr("value", function(d) {return d;})
	    .text(function(d) {return d;})
	    .attr("class", "name-select");


		// jquery multi selector
		$(document).ready(function() {
							// selector defaults
						    var $multiselect = $('.multi-select').select2({
						    	placeholder: selector_names_init[0],
						    	width: '20%'
						    });

						    // add names and update visualizations
							$('.multi-select').on('select2:select', function (e) {
							    var name = e.params.data.text;
							    
							    // if select all presidents or last five, make the list equal to it
							    if (name == 'All Presidents') {
							    	selector_names = presidents;
							    } else if (name == 'Last Five') {
							    	selector_names = last_five_presidents;
							    } else {
							    	selector_names.push(name);
							    }

						    	// remove old value
								d3.selectAll("#chart1").selectAll("p").remove();
								d3.selectAll("#chart2").selectAll("p").remove();
								d3.selectAll("#chart3").selectAll("p").remove();				
								d3.selectAll("#chart4").selectAll("p").remove();
								d3.selectAll("#chart5").selectAll("svg").remove();
								d3.selectAll("#chart6").selectAll("svg").remove();
								d3.selectAll("#chart7").selectAll("svg").remove();
								d3.selectAll("#chart8header").selectAll("p").remove();
								d3.selectAll("#chart8header").selectAll("svg").remove();
								d3.selectAll("#chart8").selectAll("svg").remove();
								d3.selectAll("#chart9header").selectAll("p").remove();
								d3.selectAll("#chart9").selectAll("svg").remove();

						    	topline_metrics_charts(selector_names);
						    	barViz(selector_names);
						    	donutViz(selector_names);
						    	monthlyTimeSeries1(selector_names);
						    	monthlyTimeSeries2(selector_names);
						    	regressionScatter(selector_names);

							});

							// remove items and update visualizations
							$('.multi-select').on('select2:unselect', function (e) {
								var name = e.params.data.text;

								// if unselect all presidents, revert to empty list
								if (name == 'All Presidents' | name == 'Last Five') {
									selector_names = [];
								} else {
									selector_names.splice(selector_names.indexOf(name), 1);
								}

						    	// remove old value
								d3.selectAll("#chart1").selectAll("p").remove();
								d3.selectAll("#chart2").selectAll("p").remove();
								d3.selectAll("#chart3").selectAll("p").remove();				
								d3.selectAll("#chart4").selectAll("p").remove();
								d3.selectAll("#chart5").selectAll("svg").remove();
								d3.selectAll("#chart6").selectAll("svg").remove();
								d3.selectAll("#chart7").selectAll("svg").remove();
								d3.selectAll("#chart8header").selectAll("p").remove();
								d3.selectAll("#chart8header").selectAll("svg").remove();
								d3.selectAll("#chart8").selectAll("svg").remove();
								d3.selectAll("#chart9header").selectAll("p").remove();
								d3.selectAll("#chart9").selectAll("svg").remove();

								// if all items are removed, revert to default
								if (selector_names.length != 0) {

							    	topline_metrics_charts(selector_names);
							    	barViz(selector_names);
							    	donutViz(selector_names);
							    	monthlyTimeSeries1(selector_names);
							    	monthlyTimeSeries2(selector_names);
							    	regressionScatter(selector_names);
							    } else {
									// initialize selector
								    topline_metrics_charts(selector_names_init);
								    barViz(selector_names_init);
								    donutViz(selector_names_init);
									monthlyTimeSeries1(selector_names_init);
									monthlyTimeSeries2(selector_names_init);
									regressionScatter(selector_names_init);
							    }
							});

							// reset selector button
							$("#reset").click(function() {
								$('.multi-select').val(null).trigger('change');
								selector_names = [];

						    	// remove old value
								d3.selectAll("#chart1").selectAll("p").remove();
								d3.selectAll("#chart2").selectAll("p").remove();
								d3.selectAll("#chart3").selectAll("p").remove();				
								d3.selectAll("#chart4").selectAll("p").remove();
								d3.selectAll("#chart5").selectAll("svg").remove();
								d3.selectAll("#chart6").selectAll("svg").remove();
								d3.selectAll("#chart7").selectAll("svg").remove();
								d3.selectAll("#chart8header").selectAll("p").remove();
								d3.selectAll("#chart8header").selectAll("svg").remove();
								d3.selectAll("#chart8").selectAll("svg").remove();
								d3.selectAll("#chart9header").selectAll("p").remove();
								d3.selectAll("#chart9").selectAll("svg").remove();

								// initialize selector
							    topline_metrics_charts(selector_names_init);
							    barViz(selector_names_init);
							    donutViz(selector_names_init);
								monthlyTimeSeries1(selector_names_init);
								monthlyTimeSeries2(selector_names_init);
								regressionScatter(selector_names_init);
							})

							// select all selector button
							$("#selectAll").click(function() {
								$('.multi-select').val(null).trigger('change');
								selector_names = [];
								if (typeof(selectAllPresidents) != "undefined") {
									$('.multi-select').children().last().remove();
									selectAllPresidents = new Option("All Presidents", presidents, true, true);
									$('.multi-select').append(selectAllPresidents).trigger('change');
								} else {
									selectAllPresidents = new Option("All Presidents", presidents, true, true);
									$('.multi-select').append(selectAllPresidents).trigger('change');
								}
						    	// remove old value
								d3.selectAll("#chart1").selectAll("p").remove();
								d3.selectAll("#chart2").selectAll("p").remove();
								d3.selectAll("#chart3").selectAll("p").remove();				
								d3.selectAll("#chart4").selectAll("p").remove();
								d3.selectAll("#chart5").selectAll("svg").remove();
								d3.selectAll("#chart6").selectAll("svg").remove();
								d3.selectAll("#chart7").selectAll("svg").remove();
								d3.selectAll("#chart8header").selectAll("p").remove();
								d3.selectAll("#chart8header").selectAll("svg").remove();
								d3.selectAll("#chart8").selectAll("svg").remove();
								d3.selectAll("#chart9header").selectAll("p").remove();
								d3.selectAll("#chart9").selectAll("svg").remove();

								// initialize selector
							    topline_metrics_charts(presidents);
							    barViz(presidents);
							    donutViz(presidents);
								monthlyTimeSeries1(presidents);
								monthlyTimeSeries2(presidents);
								regressionScatter(presidents);
							})

							// select last five presidents button
							$("#selectLastFive").click(function() {
								$('.multi-select').val(null).trigger('change');
								selector_names = [];
								if (typeof(selectFive) != "undefined") {
									$('.multi-select').children().last().remove();
									selectFive = new Option("Last Five", last_five_presidents, true, true);
									$('.multi-select').append(selectFive).trigger('change');
								} else {
									selectFive = new Option("Last Five", last_five_presidents, true, true);
									$('.multi-select').append(selectFive).trigger('change');
								}
								
						    	// remove old value
								d3.selectAll("#chart1").selectAll("p").remove();
								d3.selectAll("#chart2").selectAll("p").remove();
								d3.selectAll("#chart3").selectAll("p").remove();				
								d3.selectAll("#chart4").selectAll("p").remove();
								d3.selectAll("#chart5").selectAll("svg").remove();
								d3.selectAll("#chart6").selectAll("svg").remove();
								d3.selectAll("#chart7").selectAll("svg").remove();
								d3.selectAll("#chart8header").selectAll("p").remove();
								d3.selectAll("#chart8header").selectAll("svg").remove();
								d3.selectAll("#chart8").selectAll("svg").remove();
								d3.selectAll("#chart9header").selectAll("p").remove();
								d3.selectAll("#chart9").selectAll("svg").remove();

								// initialize selector
							    topline_metrics_charts(last_five_presidents);
							    barViz(last_five_presidents);
							    donutViz(last_five_presidents);
								monthlyTimeSeries1(last_five_presidents);
								monthlyTimeSeries2(last_five_presidents);
								regressionScatter(last_five_presidents);
							})
						});

};

