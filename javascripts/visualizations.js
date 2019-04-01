
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
  d3.csv("data/monthly_time_series_viz_data_approvals.csv")
]

Promise.all(promises).then(ready)

function ready([speech_polarity_and_diversity, top_20_words_by_president, presidential_topics, monthly_time_series_viz_data_approvals]) {


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
	var topline_metrics_charts = function(name) {

		// filter data to selected name
		var data_filtered = speech_polarity_and_diversity.filter(function(d) {
			return d.president_name==name;
		});

			// chart 1 - word diversity
			var word_diversity = svg.selectAll(".diversity")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return Math.round(d.speech_diversity*10) / 10;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 2 - negative words
			var word_diversity = svg2.selectAll(".negative")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return Math.round(d.negative*10)/10;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 3 - positive words
			var word_diversity = svg3.selectAll(".positive")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return Math.round(d.positive*10)/10;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

			// chart 2 - sentiment score
			var word_diversity = svg4.selectAll(".sentiment")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return Math.round(d.sentiment*10)/10;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "left")
				.style("color", "#33adff");

	};

	////////////////////////////////////////////////
	//   Monthly Time Series: Approval vs. Sentiment
	/////////////////////////////////////////////////

	// Create parse data format
	var format = d3.timeParse("%Y-%m-%d");
	//format.parse("2011-01-01"); // returns a Date

	// format data
	monthly_time_series_viz_data_approvals.forEach(function(d) {
		d.president = d.president;
		d.speech_year = +d.speech_year;
		d.month = format(d.month);
		d.avg_sentiment = +d.avg_sentiment
		d.avg_approval = +d.avg_approval;
	});

	console.log(monthly_time_series_viz_data_approvals);

	var monthlyTimeSeries1 = function(name) {

		/*
		// Filter data for development purposes, remove when done
		var monthly_time_series_filtered = monthly_time_series_viz_data_approvals.filter(function(d) {
			return d.president == 'barack obama';
		})
		*/
		// Filter data for development purposes, remove when done
		var monthly_time_series_filtered = monthly_time_series_viz_data_approvals.filter(function(d) {
			return d.president == name;
		})

		// set margins and padding
		var margin = {top: 60, right: 30, bottom: 20, left: 75},
	    	width = 500 - margin.left - margin.right,
	    	height = 500 - margin.top - margin.bottom,
	    	padding = 20;

	    // set the ranges
		var x = d3.scaleTime().range([0, width]);
		var y0 = d3.scaleLinear().range([height, 0]);
		var y1 = d3.scaleLinear().range([height, 0]);

		// define the 1st line
		var valueline = d3.line()
		    .x(function(d) { return x(d.month); })
		    .y(function(d) { return y0(d.avg_sentiment); });

		// define the 2nd line
		var valueline2 = d3.line()
		    .x(function(d) { return x(d.month); })
		    .y(function(d) { return y1(d.avg_approval); });

		// append the svg object to the body of the page
		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		var svg = d3.select("#chart7").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		 // Scale the range of the data
	  	x.domain(d3.extent(monthly_time_series_filtered, function(d) { return d.month; }));
	  	y0.domain(d3.extent(monthly_time_series_filtered, function(d) { return d.avg_sentiment; }));
	  	y1.domain([0, 1]);
	  	//y1.domain([0, d3.max(monthly_time_series_filtered, function(d) { return Math.max(d.avg_approval); }) ]);

	  	  // Add the valueline path.
	  	svg.append("path")
	    	.data([monthly_time_series_filtered])
	      	.attr("class", "line")
	      	.attr("d", valueline);

	  	// Add the valueline2 path.
	  	svg.append("path")
      		.data([monthly_time_series_filtered])
      		.attr("class", "line")
      		.style("stroke", "red")
      		.attr("d", valueline2);

	  	// Add the X Axis
	  	svg.append("g")
	    	.attr("transform", "translate(0," + height + ")")
	    	.call(d3.axisBottom(x));

	  	// Add the Y0 Axis
	  	svg.append("g")
	    	.attr("class", "axisSteelBlue")
	    	.call(d3.axisLeft(y0));

	  	// Add the Y1 Axis
	  	svg.append("g")
	    	.attr("class", "axisRed")
	    	.attr("transform", "translate( " + width + ", 0 )")
	    	.call(d3.axisRight(y1));

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

	var barViz = function(name) {

		// filter data
		var top_20_words_filtered = top_20_words_by_president.filter(function(d) {
			return d.president_name==name;
		})

	    // make scales
	    var xScale = d3.scaleLinear()
	    	.domain([0, d3.max(top_20_words_filtered, function(d) {return d.word_count;})])
	    	.range([0, width1]);

	    var yScale = d3.scaleBand()
	    	.range([height1, 0]).padding(.2)
	    	.domain(top_20_words_filtered.map(function(d) {return d.word;}));

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
	    	.data(top_20_words_filtered)
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
    		.attr("x", function(d) {return xScale(d.word_count) - padding1*2;})
    		.style("fill", "#fff")
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

	var donutViz = function(name) {

		// filter data
		var topics_filtered = presidential_topics.filter(function(d) {
			return d.president_name==name;
		})

	    // add svg element
	    var svg6 = d3.select("#chart6")
	    	.append("svg")
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 500")
	        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	    // set up groups
	    var arcs = svg6.selectAll("g.arc")
	    	.data(pie(topics_filtered))
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
	    		if (Math.floor((topics_filtered[i].topic_percent / 1) * 100) >= 2) {
	    		return topics_filtered[i].topic  + ': ' + Math.floor((topics_filtered[i].topic_percent / 1) * 100) + '%';
	    		}	
	    	});


	    // add lines connecting labels to slice
        var polyline = arcs.append("g")
        	.attr("class", "lines")
        	.selectAll('polyline')
            .data(pie(topics_filtered))
            .enter()
            .append('polyline')
            .attr('points', function(d, i) {
            	if (Math.floor((topics_filtered[i].topic_percent / 1) * 100) >= 2) {
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



	// initialize selector
    topline_metrics_charts(presidents[0]);
    barViz(presidents[0]);
    donutViz(presidents[0]);
    monthlyTimeSeries1(presidents[0]);

    // make year picker
  	var nameSelector = d3.select("#selector")
  		.append("select");

  	nameSelector.selectAll(".name-select")
	    .data(presidents)
	    .enter()
	    .append("option")
	    .attr("value", function(d) {return d;})
	    .text(function(d) {return d;})
	    .attr("class", "name-select");

    nameSelector.on("change", function() {
    	var selection = d3.select(this)
    		.property("value");
    	
    	// remove old value
		d3.selectAll("#chart1").selectAll("p").remove();
		d3.selectAll("#chart2").selectAll("p").remove();
		d3.selectAll("#chart3").selectAll("p").remove();				
		d3.selectAll("#chart4").selectAll("p").remove();
		d3.selectAll("#chart5").selectAll("svg").remove();
		d3.selectAll("#chart6").selectAll("svg").remove();
		d3.selectAll("#chart7").selectAll("svg").remove();

    	topline_metrics_charts(selection);
    	barViz(selection);
    	donutViz(selection);
    	monthlyTimeSeries1(selection);
    });

};

