
///////////////////////////////////////////////////
// 
//				Topline Metrics Charts
//
///////////////////////////////////////////////////

// Get the data
d3.csv("data/speech_polarity_and_diversity.csv").then(function(data) {
				data.forEach(function(d) {
					d.president_name = d.president_name;
					d.n = +d.n;
					d.speech_date = +d.speech_date;
					d.negative = +d.negative;
					d.positive = +d.positive;
					d.sentiment = +d.sentiment;
					d.negative_ratio = +d.negative_ratio;

				});

	// initailize charts			
    var svg = d3.select('#chart1');
	var svg2 = d3.select('#chart2');
	var svg3 = d3.select('#chart3');
	var svg4 = d3.select('#chart4');

	// get unique president names
	var presidents = [];

	for (var i = 0; i < data.length; i++) {
		presidents.push(data[i].president_name);
	}

	// function to get word diversity
	var topline_metrics_charts = function(name) {

		// filter data to selected name
		var data_filtered = data.filter(function(d) {
			return d.president_name==name;
		});

			// chart 1 - word diversity
			var word_diversity = svg.selectAll(".diversity")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return d.n;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "middle");

			// chart 2 - negative words
			var word_diversity = svg2.selectAll(".negative")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return d.negative;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "middle");

			// chart 3 - positive words
			var word_diversity = svg3.selectAll(".positive")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return d.positive;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "middle");

			// chart 2 - sentiment score
			var word_diversity = svg4.selectAll(".sentiment")
				.data(data_filtered)
				.enter()
				.append("p")
				.text(function(d) {return d.sentiment;})
				.attr("class", "summary-text-num")
				.attr("text-anchor", "middle");

	};

	// initialize selector
    topline_metrics_charts(presidents[0]);

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

    	topline_metrics_charts(selection);});

});

