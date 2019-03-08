const margin = { top: 60, right: 0, bottom: 100, left: 30 };
var svg = d3.select("svg"),
    width = 900 - margin.left - margin.right,
    height = 1150 - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("class", "everything");

// svg objects
var link, node;
// the data - an object with nodes and links
var graph;

// load the data
d3.json("datagraph.json", function(error, _graph) {
  if (error) throw error;
  graph = _graph;
  initializeDisplay();
  initializeSimulation();
  console.log(graph);
});
 


//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(graph.nodes);
  initializeForces();
  simulation.on("tick", ticked);
}

// values for all forces
forceProperties = {
    center: {
        x: 0.5,
        y: 0.5
    },
    charge: {
        enabled: true,
        strength: -200,
        distanceMin: 1,
        distanceMax: 500
    },
    collide: {
        enabled: true,
        strength: .7,
        iterations: 1,
        radius: 5
    },
    forceX: {
        enabled: false,
        strength: .1,
        x: .5
    },
    forceY: {
        enabled: false,
        strength: .1,
        y: .5
    },
    link: {
        enabled: true,
        distance: 30,
        iterations: 1
    }
}


var radius = d3.scaleLinear()
    .domain([10, 103000])
    .range([1, 50]);

// add forces to the simulation
function initializeForces() {
    // add forces and associate each with a name
    simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide())
        .force("center", d3.forceCenter())
        .force("forceX", d3.forceX())
        .force("forceY", d3.forceY());
    // apply properties to each of the forces
    updateForces();
}
 
// apply new force properties
function updateForces() {
    // get each force by name and update the properties
    simulation.force("center")
        .x(width * forceProperties.center.x)
        .y(height * forceProperties.center.y);
    simulation.force("charge")
        .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
        .distanceMin(forceProperties.charge.distanceMin)
        .distanceMax(forceProperties.charge.distanceMax);
    simulation.force("collide")
        .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
        .radius(function(d) { return radius(d.value/2) ;})
        .iterations(forceProperties.collide.iterations);
    simulation.force("forceX")
        .strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
        .x(width * forceProperties.forceX.x);
    simulation.force("forceY")
        .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
        .y(height * forceProperties.forceY.y);
    simulation.force("link")
        .id(function(d) {return d.id;})
        .distance(function(d) { return radius(d.source.value) +radius(d.target.value)+ forceProperties.link.distance; })
        .iterations(forceProperties.link.iterations)
        .links(forceProperties.link.enabled ? graph.links : []);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    simulation.alpha(1).restart();
}



//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {
  // set the data and properties of link lines
  link = g.append("g")
        .attr("class", "links")
    .selectAll("path")
    .data(graph.links)
    .enter().append("svg:path")
    .attr("stroke-width",1);
    link.style('fill', 'none')
        .style('stroke', 'black')
      .style("stroke-width", '2px');
  // set the data and properties of node circles
  
  genre = ['men','women']
 node = g.append("g")
        .attr("class", "nodes")
    .selectAll("image")
    .data(graph.nodes)
    .enter().append("image")
      .attr("xlink:href", function(d) {
   if (d.img =='https://randomuser.me/api/portraits/med/') 
   {userimg = d.img +genre[Math.floor(Math.random()*2)]+'/'+(Math.floor(Math.random() * 100) + 1)+'.jpg';} 
   else {userimg = d.img;}
   return userimg })
      .attr("x", function(d) { return -1*((radius(d.value) )+36)/2; })
      .attr("y", function(d) { return -1*((radius(d.value) )+36)/2; })
      .attr("width", function(d) { return (radius(d.value) )+36; })
      .attr("height", function(d) { return (radius(d.value) )+36; })
      .on("click",(d) => heatmapChart(d.id,userimg))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
 
  
  node.append("title")
      .text(function(d) { return d.id; });
  // visualize the graph
  updateDisplay(); }


var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);
 
zoom_handler(svg);     
 
function zoom_actions(){
    g.attr("transform", d3.event.transform)
}

// update the display based on the forces (but not positions)
function updateDisplay() {
    node
        .attr("r", forceProperties.collide.radius)
       
        .attr("stroke-width", forceProperties.charge.enabled==false ? 0 : Math.abs(forceProperties.charge.strength)/15);

 
}

// update the display positions after each simulation tick
function ticked() {
    link.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + 
            d.source.x + "," + 
            d.source.y + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.target.x + "," + 
            d.target.y;
    });

    
        node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";

        });
    d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');
}



//////////// UI EVENTS ////////////

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// update size-related forces
d3.select(window).on("resize", function(){
    width = +svg.node().getBoundingClientRect().width;
    height = +svg.node().getBoundingClientRect().height;
    updateForces();
});

// convenience function to update everything (run after UI input)
function updateAll() {
    updateForces();
    updateDisplay();
  
  node.style("opacity", 1);
  link.style("opacity", 1);
  d3.select(".controls").style("opacity", 1);
  d3.selectAll("rect").remove();
  d3.selectAll(".dayLabel").remove();
 
  d3.select("#heatmap").html("");
  d3.select("#locationDropdown").html("");
  d3.selectAll(".nav").html("");
  d3.selectAll(".divglob")
    .style("margin-left", "0px")
    .style("background", "#fffffe")
 
  
   d3.selectAll(".nav")
    .style("height","0px")
   
   d3.selectAll(".custom-select")
    .style("height","0px")
   
   
    d3.selectAll(".right")
             .style("margin-right", "0px")
    
   d3.selectAll(".friendname")
     .text('')
     .style("padding-right", "0px")
     .style("font-size", "0px")
     .style("font-family", 'Dancing Script')
     .style("vertical-align", 'middle')
          
   d3.selectAll(".roundedImage").html("");
     
            

   d3.selectAll(".roundedImage")
     .style("border",'0px')
     .style("width" ,'0px')
     .style("height",'0px')
  
}

          
        
const heatmapChart = function(id,image_f) {
           
  node.style("opacity", 0);
  link.style("opacity", 0);
  d3.select(".controls").style("opacity", 0);
  d3.selectAll("rect").style("opacity", 1);

  var dataset;
  var margins = {top:40, right:50, bottom:70, left:50};
  var days = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUIL","AOU","SEP","OCT","NOV","DEC"],
      times = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "12", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24","25","26","27","28","29","30","31"];
  
  // calculate width and height based on window size
  var w = Math.max(Math.min(window.innerWidth, 1000), 500) - margins.left - margins.right - 20,
  gridSize = Math.floor(w / times.length),
	h = gridSize * (days.length+2);

  //reset the overall font size
	var newFontSize = w * 62.5 / 900;
	d3.select("html").style("font-size", newFontSize + "%");
  
  var svg = d3.select(".left")
    .style("height","60px")
  	.append("text")
  	.text('left')
    
   
   var svg = d3.select(".right")
    .style("height","60px")
  	.append("text")
  	.text('right');
  
  // svg container
  var svg = d3.select("#heatmap")
  	.append("svg")
  	.attr("width", w + margins.top + margins.bottom)
  	.attr("height", h + margins.left + margins.right)
  	.append("g")
  	.attr("transform", "translate(" + margins.left + "," + margins.top + ")")
    .on("click",(d) => updateAll());
  
  // linear colour scale
 
  
  colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
  
  
  
  var dayLabels = svg.selectAll(".dayLabel")
  	.data(days)
  	.enter()
  	.append("text") 
  	.text(function(d) { return d; })
  	.attr("x", 0)
  	.attr("y", function(d, i) { return i * gridSize; })
  	.style("text-anchor", "end")
		.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", "mono")

  var timeLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter() 
    .append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", "mono");
    
    // load data
    d3.text('dataheat.csv', function(error, raw) {
      var dsv = d3.dsvFormat(',')
      var data = dsv.parse(raw);
  
      
    // Nest stock values by symbol.
  	  var symbols = d3.nest()
        .key(function(d) { return d.Name; })
        .entries(data);
     
	  // Parse and caculate some values for each symbols
      symbols.forEach(function(s) {
     
      s.values.forEach(function(d) { 
      d.Value = + d.Value; 
      d.Year = +d.Year; 
      d.Day = +d.Day;
      d.Month = +d.Month;
      }); 
         
      s.maxValue = d3.max(s.values, function(d) { return d.Value; });
      s.minValue = d3.min(s.values, function(d) { return d.Value; });
        
    });
      
      dataset=symbols.filter(function(d){ return d.key == id; })

      var Years = ["2015", "2016" ,"2017","2018","2019"];
      var currentLocationIndex = 0;
      newdata=dataset[0].values;
      
      
    var colours = d3.scaleQuantile()
      .domain([0, 8 ,dataset[0].maxValue])
      .range(colors);
      
    // create location dropdown menu
    var locationMenu = d3.select("#locationDropdown");
    locationMenu 
      .style("height","60px")
      .append("select")
      .attr("id", "locationMenu")
      .selectAll("option")
        .data(Years)
        .enter()
        .append("option")
        .attr("value", function(d, i) { return i; })
        .text(function(d) { return d; });
 
      var dataperyear = d3.nest()
      .key(function(d) { return d.Year; })
      .entries(newdata);
     
      
      
      
      
    // function to create the initial heatmap
    var drawHeatmap = function(Year) {      
      
    var selectYear = dataperyear.find(function(d) {
        return d.key == Year ;
      });
      
      
      var heatmap = svg.selectAll(".hour")
        .data(selectYear.values)
        .enter()
        .append("rect")
        .attr("x", function(d) { return (d.Day-1) * gridSize; })
        .attr("y", function(d) { return (d.Month-1) * gridSize; })
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.6)
        .style("fill", function(d) { return colours(d.Value); })
      
          d3.selectAll(".divglob")
            .style("margin-left", "200px")
            .style("background", "#e9ebee")
 
          d3.selectAll(".friendname")
            .text(id)
            .style("padding-right", "75px")
            .style("margin-left", "45px")
            .style("font-size", "40px")
            .style("font-family", 'Dancing Script')
            .style("vertical-align", 'middle')
            .style("text-align", 'center')
          
          d3.selectAll(".roundedImage").append("img")
            .attr("src",image_f )
            
           d3.selectAll(".right")
             .style("margin-right", "60px")
        
            
             d3.selectAll(".roundedImage")
               .style("border", '2px dotted orange')
               .style("width", '100px')
               .style("height", '100px')
          
         
      const legend = svg.selectAll(".legend")
              .data([0].concat(colours.quantiles()),function(d) {return d});

      const legend_g = legend.enter().append("g")
              .attr("class", "legend");
 
          legend_g.append("rect")
            .attr("x", (d, i) => 60 * i)
            .attr("y", 375)
            .attr("width", 60)
            .attr("height", 30 )
            .style("fill", (d, i) => colors[i]);

          legend_g.append("text")
            .attr("class", "mono")
            .text((d) => "≥ " + Math.round(d))
            .attr("x", (d, i) => 60 * i+30/1.5)
            .attr("y", 375 + 1.5*30);
      
      
      }
    
    drawHeatmap(Years[currentLocationIndex]);

      
      
      
    var updateHeatmap = function(Year) {
    //  console.log("currentLocationIndex: " + currentLocationIndex)
      // filter data to return object of location of interest
      var selectYear = dataperyear.find(function(d) {
          return d.key == Year ;
      });
      
   
      // update the data and redraw heatmap
      var heatmap = svg.selectAll(".hour")
        .data(selectYear.values)
        .transition()
          .duration(500)
          .style("fill", function(d) { return colours(d.Value); })
      }

    
    
    
    
    
    // run update function when dropdown selection changes
    locationMenu.on("change", function() {
      // find which location was selected from the dropdown
      var selectedLocation = d3.select(this)
        .select("select")
        .property("value");
      currentLocationIndex = +selectedLocation;
      // run update function with selected location
      updateHeatmap(Years[currentLocationIndex]);
    });    

    d3.selectAll(".nav").on("click", function() {
      if(d3.select(this).classed("left")) {
        if(currentLocationIndex == 0) {
          currentLocationIndex = Years.length-1;
        } else {
          currentLocationIndex--;  
        }
      } else if(d3.select(this).classed("right")) {
        if(currentLocationIndex == Years.length-1) {
          currentLocationIndex = 0;
        } else {
          currentLocationIndex++;  
        }
      }
      d3.select("#locationMenu").property("value", currentLocationIndex)
      updateHeatmap(Years[currentLocationIndex]);
    })
  })
    
           
      
 }

 

