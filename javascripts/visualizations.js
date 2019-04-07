
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
	//format.parse("2011-01-01"); // returns a Date

	// format data
	monthly_time_series_viz_data_approvals.forEach(function(d) {
		d.president = d.president;
		d.speech_year = +d.speech_year;
		d.month = format(d.month);
		d.avg_sentiment = +d.avg_sentiment
		d.avg_approval = +d.avg_approval;
	});

	var monthlyTimeSeries1 = function(selector_names) {

		/*
		// Filter data for development purposes, remove when done
		var monthly_time_series_filtered = monthly_time_series_viz_data_approvals.filter(function(d) {
			return d.president == 'barack obama';
		})
		*/
		// Filter data for development purposes, remove when done
		//var monthly_time_series_filtered = monthly_time_series_viz_data_approvals.filter(function(d) {
		//	return d.president == 'ABRAHAM LINCOLN';
		//})

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
		var margin = {top: 30, right: 30, bottom: 20, left: 30},
	    	width = 500 - margin.left - margin.right,
	    	height = 250 - margin.top - margin.bottom,
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
	    	.attr("preserveAspectRatio", "xMinYMin meet")
	    	.attr("viewBox", "0 0 500 250")
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
	      	.style("stroke-width", '1px')
	      	.attr("d", valueline);

	  	// Add the valueline2 path.
	  	svg.append("path")
      		.data([monthly_time_series_filtered])
      		.attr("class", "line")
      		.style("stroke", "red")
      		.style("stroke-width", '1px')
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
					return padding1*1.5;
				} else if (xScale(d.word_count) <= 50) {
					return xScale(d.word_count) - padding1*1.4;
    			} else if (xScale(d.word_count) <= 100) {
					return xScale(d.word_count) - padding1*1.6;
				} else if (xScale(d.word_count) <= 150) {
					return xScale(d.word_count) - padding1*1.9;
				} else {
    				return xScale(d.word_count) - padding1*2.1;
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
	var selector_names_init = ["ABRAHAM LINCOLN"];

	// initialize selector
    topline_metrics_charts(selector_names_init);
    barViz(selector_names_init);
    donutViz(selector_names_init);
	monthlyTimeSeries1(selector_names_init);

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

						    	topline_metrics_charts(selector_names);
						    	barViz(selector_names);
						    	donutViz(selector_names);
						    	monthlyTimeSeries1(selector_names);

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

								// if all items are removed, revert to default
								if (selector_names.length != 0) {

							    	topline_metrics_charts(selector_names);
							    	barViz(selector_names);
							    	donutViz(selector_names);
							    	monthlyTimeSeries1(selector_names);
							    } else {
									// initialize selector
								    topline_metrics_charts(selector_names_init);
								    barViz(selector_names_init);
								    donutViz(selector_names_init);
									monthlyTimeSeries1(selector_names_init);
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

								// initialize selector
							    topline_metrics_charts(selector_names_init);
							    barViz(selector_names_init);
							    donutViz(selector_names_init);
								monthlyTimeSeries1(selector_names_init);
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

								// initialize selector
							    topline_metrics_charts(presidents);
							    barViz(presidents);
							    donutViz(presidents);
								monthlyTimeSeries1(presidents);
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

								// initialize selector
							    topline_metrics_charts(last_five_presidents);
							    barViz(last_five_presidents);
							    donutViz(last_five_presidents);
								monthlyTimeSeries1(last_five_presidents);
							})
						});

};

