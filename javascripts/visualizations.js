
///////////////////////////////////////////////////
// 
//				Topline Metrics Charts
//
///////////////////////////////////////////////////

// load data using promises
var promises = [
  d3.csv("data/speech_polarity_and_diversity.csv"),
  d3.csv("data/top_20_words_by_president.csv"),
  d3.csv("data/presidential_topics.csv")
]

Promise.all(promises).then(ready)

function ready([speech_polarity_and_diversity, top_20_words_by_president, presidential_topics]) {


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
	    	.attr("transform", function(d) {
	    		return "translate(" + arc.centroid(d) + ")";
	    	})
	    	.attr("text-anchor", "middle")
	    	.text(function(d, i) {
	    		if (Math.floor((topics_filtered[i].topic_percent / 1) * 100) > 4) {
	    		return Math.floor((topics_filtered[i].topic_percent / 1) * 100) + '%';
	    		}	
	    	})
	    	.style("fill", "#fff")
	    	.style("font-weight", 1000);

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

    	topline_metrics_charts(selection);
    	barViz(selection);
    	donutViz(selection);});

};

