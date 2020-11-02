
//Chart
Chart=(function(){

	var _data;
  var _chartMargin,_chartSize;
  //var _chart; //SVG Node
  var _chartD3;
  var _x,_y;
  var _xAxis,_yAxis;

  var _currentYear=2016;
  

	function initialize(){
		console.log("Initializing chart...");

		var request = new XMLHttpRequest();
		request.open('GET', 'chart2016.json', true);
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    _data=JSON.parse(request.responseText);
        build();
		  } 
		};
		request.send();

    _chartSize={};
    _chartMargin={};
	}


  function getLocale(){
    return d3.locale({ 
          decimal: ",", 
          thousands: ".", 
          grouping: [3], 
          currency: ["", " €"], 
          dateTime: "%A, %e de %B de %Y, %X", 
          date: "%d/%m/%Y", 
          time: "%H:%M:%S", 
          periods: ["AM", "PM"], 
          days: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"], 
          shortDays: ["dom", "lun", "mar", "merc", "gio", "ven", "sab"], 
          months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", 
          "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"], 
          shortMonths: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"] 
        });
  }



  function update(){


      var total=0;
      _.each(_data, function(v,k){
        total+=(v.Jews+v.Greek+v.Rome);
      });

      var format=getLocale().numberFormat(",.2f");
      total=format(total);

      // var total_label=document.querySelector("h4");
      // total_label.innerHTML="€ "+total;


      var maxData=d3.max(_data, function(d){ return  d.Jews+d.Greek+d.Rome });
      if(maxData==0) maxData=500;

      _y.domain([0,maxData])
            .nice(5);   
      _yAxis.scale(_y);   

      var line=d3.svg.line()
             .x(function(d,i) {return _x(i)+50}) // was 20
             .y(function(d){ return (_y( d.Jews+d.Greek+d.Rome))});





      _chartD3.select("path.line")
		.transition()
        .duration(600)
        .ease("quad-in-out")
        .attr("d", line(_data));

     /*
      var bars=_chartD3.selectAll("g.bar")
                           .data(data);*/

     _chartD3.selectAll("circle.circles").data(_data).transition().duration(600).ease("quad-in-out") 
          .attr("cy", function(d){ 
            return -(_chartSize.height-_y( d.Jews+d.Greek+d.Rome))
          });


      _chartD3.selectAll("g.tooltip").data(_data).transition().duration(600).ease("quad-in-out") 
          .attr("transform", function(d,i){ 
            var anchor_x=i<=6?-12:-268;
            return "translate("+anchor_x+",-"+((_chartSize.height-_y( d.Jews+d.Greek+d.Rome))+12)+")";
          });



     var format=getLocale().numberFormat("n");
      _chartD3.selectAll("text.totale").data(_data).text(function(d){return 'Ttl '+format(d3.format(".2f")(d.Jews+d.Greek+d.Rome))});
      _chartD3.selectAll("text.attesa").data(_data).text(function(d){return 'G '+format(d3.format(".2f")(d.Greek))});
      _chartD3.selectAll("text.pagate").data(_data).text(function(d){return 'R '+format(d3.format(".2f")(d.Rome))});
      _chartD3.selectAll("text.ritardo").data(_data).text(function(d){return 'J '+format(d3.format(".2f")(d.Jews))});



    _chartD3.selectAll("rect.h").on("mouseover", null).on("mouseout",null);
    _chartD3.selectAll("rect.h").data(_data).on("mouseover", function(d,i){
              var t= d.Jews+d.Greek+d.Rome;
              if(t>0){
                _chartD3.select("g.l1 g:nth-child("+(i+1)+") g.status-bar").style("opacity", 0.5);
                _chartD3.select("g.l2 g:nth-child("+(i+1)+") g.tooltip").style("display", "block");
                _chartD3.select("g.l2 g:nth-child("+(i+1)+") circle").style("fill", "#fff");
              }

           }).on("mouseout", function(d,i){

             var t= d.Jews+d.Greek+d.Rome;
              if(t>0){
                _chartD3.select("g.l1 g:nth-child("+(i+1)+") g.status-bar").style("opacity", 0.9);
                _chartD3.select("g.l2 g:nth-child("+(i+1)+") g.tooltip").style("display", "none");
                _chartD3.select("g.l2 g:nth-child("+(i+1)+") circle").style("fill", "#333333");
              }
           })

     _chartD3.select(".y.axis").transition() // change the y axis
            .duration(600)
            .ease("quad-in-out")
            .call(_yAxis);

     _chartD3.selectAll("rect.attesa").data(_data).transition().duration(600)
                                                                  .ease("quad-in-out")
                                                                  .attr("y", function(d){return -(_chartSize.height-_y(d.Greek))}).attr("height", function(d){return _chartSize.height-_y(d.Greek)})
     
    _chartD3.selectAll("rect.pagate").data(_data).transition().duration(600)
                                                                  .ease("quad-in-out")    
                                                                  .attr("y", function(d){ return -(_chartSize.height-_y(d.Greek+d.Rome))}).attr("height", function(d){ return _chartSize.height-_y(d.Rome)})             
                                                                  
    _chartD3.selectAll("rect.ritardo").data(_data).transition().duration(600)
                                                                  .ease("quad-in-out") 
                                                                  .attr("y", function(d){ return -(_chartSize.height-_y( d.Jews+d.Greek+d.Rome))}).attr("height", function(d){ return _chartSize.height-_y(d.Jews)})                                                          
  

  }

  function onChange(e){
    var select=document.querySelector("select#years");
    var v=select.options[select.selectedIndex].value;

    var request = new XMLHttpRequest();
    request.open('GET', './data/chart-'+v+'.json', true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        _data=JSON.parse(request.responseText);
        update();
        //console.log(_data);
      } 
    };
    request.send();


    return false;
  }

	function build(){
      // var select=document.querySelector("select#years");
      // select.addEventListener("change", onChange);
      //_chart=document.querySelector("svg#chart");
      _chartMargin={left:40, top:25, bottom:45, right:0};
      _chartSize.height=320-_chartMargin.top-_chartMargin.bottom;
      _chartSize.width=880-_chartMargin.left-_chartMargin.right;
      
      _chartD3=d3.select("svg#chart").append('g').attr("transform", "translate(" + _chartMargin.left + "," + _chartMargin.top + ")");       


      _x=d3.scale.ordinal().domain(d3.range(_data.length))
                              .rangeRoundBands([0, _chartSize.width],0);

      _y=d3.scale.linear().domain([0,d3.max(_data, function(d){ return  d.Jews+d.Greek+d.Rome })])               
                          .range([_chartSize.height,0])              
                          .nice(5);      
      
      _xAxis = d3.svg.axis()
                        .scale(_x)
                        .tickFormat(function(i) { 
                          return _data[i].label; 
                        })
                        .orient("bottom");

      _yAxis = d3.svg.axis()
                        .scale(_y)
                        .orient("left")
                        .tickSize(-_chartSize.width)
                        .ticks(5)
                       // .tickFormat(GotoStudio.Utils.getLocale().numberFormat("n"));


      _chartD3.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(4," + (_chartSize.height+10) + ")")
            .call(_xAxis);

      _chartD3.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(10,0)")
          .call(_yAxis)

	  var starting_line=d3.svg.line()
	 .x(function(d,i) {return _x(i)+40})
	 .y(_chartSize.height);
      var l1=_chartD3.append("g").attr("class","l1");

      var bars=l1.selectAll("g.bar")
                           .data(_data);

      bars.enter().append("g")
          .attr("class", "bar") // centering ticks
          .attr("transform", function(d, i) { return "translate(" + (_x(i) + 20) + ","+_chartSize.height+")"; })

      var singleBars=bars.append("g")
                         .attr("class", "status-bar")
                         .attr("transform", 'translate(-3,0) scale(1,0)')
		
		// var colors = ['#ca0020','#ffffbf','#0571b0']; // ['#999999', '#006693', '#a42c0f'];
		// var colors = ['#ca0020','#2ca02c','#0571b0'];
		var colors = ['#11CBD7','#FFF6A2','#F60C86'];
		

						 
      singleBars.append("rect").attr("class","attesa")
	  .attr("width", 60).attr("fill", colors[0])
	  .attr("y", function(d){return -(_chartSize.height-_y(d.Greek))})
	  .attr("height", function(d){return _chartSize.height-_y(d.Greek)})
	  .attr("data-legend","Greek-Catholic");
	   
      singleBars.append("rect")
	  .attr("class","pagate")
	  .attr("width", 60)
	  .attr("fill", colors[1])
	  .attr("data-legend","Roman-Catholic")
	  .attr("y", function(d){ return -(_chartSize.height-_y(d.Greek+d.Rome))})
	  .attr("height", function(d){ return _chartSize.height-_y(d.Rome)});
	  
      singleBars.append("rect")
	  .attr("class","ritardo")
	  .attr("width", 60)
	  .attr("fill", colors[2])
	  .attr("data-legend","Judaic")
	  .attr("y", function(d){ return -(_chartSize.height-_y( d.Jews+d.Greek+d.Rome))})
	  .attr("height", function(d){ return _chartSize.height-_y(d.Jews)});
	  
      singleBars.transition()
		.duration(600)
		.ease("quad-in-out")
		.attr("transform", 'translate(-3,0) scale(1,1)');
        

		// city.append("path")
      // .attr("class", "line")
      // .attr("d", function(d) { return line(d.values); })
      // .attr("data-legend",function(d) { return d.name})
      // .style("stroke", function(d) { return color(d.name); });
		
	legend = _chartD3.append("g")
		.attr("class","legend")
		.attr("transform","translate(27,320)")
		.style("font-size","12px")
		.call(d3.legend)

	  setTimeout(function() { 
		legend
		  .style("font-size","20px")
		  .attr("data-style-padding",10)
		  .call(d3.legend)
	  },1000);	
		
      bars.append("circle")
          .attr("class", "circles")
          .attr("cx", 30) // was 0
          .attr("cy", 0)
          .attr("r", 4)
          // .attr("fill", "#333333")
          .attr("fill", "gray")

      _chartD3.append("path")
        .attr("class", "line")
        .attr("d", starting_line(_data))


      var l2=_chartD3.append("g").attr("class","l2");
      var tooltip=l2.selectAll("g.tooltip")
                           .data(_data);

      tooltip.enter().append("g")
          .attr("class", "tooltip-placeholder")
          .attr("transform", function(d, i) { return "translate(" + (_x(i) + 40) + ","+_chartSize.height+")"; })
      //console.log(_chart);



       var format=getLocale().numberFormat("n"); //d3.format("s");

      //var tooltipsG1=tooltip.append("g");

      var tooltips=tooltip.append("g").attr("class","tooltip").attr("transform", function(d,i){return i<=6 ? 'translate(-12,-12)' : 'translate(-268,-12)'}); //.attr("opacity", function(d,i){return i==0?1:0});
      tooltips.append("path").attr("class", "r1").attr("d", "M80,24H12C5.4,24,0,18.6,0,12l0,0C0,5.4,5.4,0,12,0l68,0V24z");
      tooltips.append("rect").attr("class", "r2").attr("x",80).attr("y",0).attr("height",24).attr("width",60);
      tooltips.append("rect").attr("class", "r3").attr("x",140).attr("y",0).attr("height",24).attr("width",60);
      tooltips.append("path").attr("class", "r4").attr("d", "M268,24h-68V0l68,0c6.6,0,12,5.4,12,12v0C280,18.6,274.6,24,268,24z");
      tooltips.append("text").attr("class", "t totale").attr("transform", "translate(70,15)")
	  .attr("text-anchor","end")
	  .text(function(d){return '€ '+format( d.Jews+d.Greek+d.Rome)})
		.style('fill', 'darkOrange')
      tooltips.append("text").attr("class", "t attesa").attr("transform", "translate(130,15)").attr("text-anchor","end")
	  .text(function(d){return '€ '+format(d.Greek)});
      
	  tooltips.append("text").attr("class", "t pagate").attr("transform", "translate(190,15)").attr("text-anchor","end")
	  .text(function(d){return '€ '+format(d.Rome)})
	  .style('fill', 'navy');
      tooltips.append("text").attr("class", "t ritardo").attr("transform", "translate(250,15)").attr("text-anchor","end").text(function(d){return '€ '+format(d.Jews)});
      tooltips.append("circle")
          .attr("cx", function(d,i){return i<=6 ? 12 : 268})
          .attr("cy", 12)
          .attr("r", 4)
          .attr("fill", "#fff")


           
    tooltip.append("rect").attr("class","h").attr("width", 60).attr("fill", 'rgba(0,0,0,0)').attr("height", _chartSize.height).attr("y", -_chartSize.height).attr("x", -30);
    update();
	}

	

	return {
      init: function(){
          initialize();
      }
    }
})();





    