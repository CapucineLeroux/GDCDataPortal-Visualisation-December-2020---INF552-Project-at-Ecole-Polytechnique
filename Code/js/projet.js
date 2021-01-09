var ctx = {
    w: 2900,
    h: 970,
    vmargin: 2,
    hmargin: 4,
    linePlot: false,
    stored_data : [],
    data : [],
    topo_intervals : [],
    topo_codes : [],
    morpho_codes : [],
    morpho_sous_codes : [],
    nb_patients : 0,
    //all of our widgets
    statsG : 0,
    statsFrame: 0,
    textG: 0,
    genderG: 0,
    ethnicityG: 0,
    vitalStatusG: 0,
    ageG: 0,
    topoG: 0,
    humanG: 0,
    topoChartG: 0,
    topoTreeG:0,
    morphoG: 0,
    morphoChartG:0,
    morphoTreeG: 0,
    clicked : false
};

var create_gender_Maps = function(){
    create_stats_text();
    create_stats_vitalStatus();
    create_stats_ethnicity();
    create_stats_age();
    create_topo_topoChart();
    create_topo_topoTree();
    create_morpho();
};

var create_vitalStatus_Maps = function(){
    create_stats_text();
    create_stats_gender();
    create_stats_ethnicity();
    create_stats_age();
    create_topo_topoChart();
    create_topo_topoTree();
    create_morpho();
};

var create_ethnicity_Maps = function(){
    create_stats_text();
    create_stats_gender();
    create_stats_vitalStatus();
    create_stats_age();
    create_topo_topoChart();
    create_topo_topoTree();
    create_morpho();
};

var create_age_Maps = function(){
    create_stats_text();
    create_stats_gender();
    create_stats_vitalStatus();
    create_stats_ethnicity();
    create_topo_topoChart();
    create_topo_topoTree();
    create_morpho();
};

var color_code = ["#F4C430","#D90115","#74D0F1","#C8AD7F","#730800","#FEC3AC","#7FDD4C","#007FFF","#F4661B","#FEBFDE","#C9A0DC","#008080","#85530F","#1034A6","#F9429E","#2D241E","#22780F","#660099"];
var interval_code = ["C00-C14","C15-C26","C30-C39","C40-C41","C42-C42","C44-C44","C47-C47","C48-C48","C49-C49","C50-C50","C51-C58","C60-C63","C64-C68","C69-C72","C73-C75","C76-C76","C77-C77","C80-C80"];
var color2 = ["#1E7FCB","#F4661B"];
var givecolor2 = d3.scaleOrdinal(color2);
var interval_morpho_code = ["805-808","814-838","844-849","850-854","855-855","868-871","872-879","938-948","Unknown"];
var morpho_intervals = {"805-808":"Squamous cell neoplasms",
                        "814-838":"Adenomas and adenocarcinomas",
                        "844-849":"Cystic, mucinous and serous neoplasms",
                        "850-854":"Ductal and lobular neoplasms",
                        "855-855":"Acinar cell neoplasms",
                        "868-871":"Paragangliomas and glomus tumors",
                        "872-879":"Nevis and Melanomas",
                        "938-948":"Gliomas"};

var font = "15px helvetica"

var find_morpho_interval = function (morpho3){
    morpho3 = parseInt(morpho3);
    var interval_min;
    var interval_max;
    for(interval in morpho_intervals){
        interval_min = parseInt(interval.split("-")[0]);
        interval_max = parseInt(interval.split("-")[1]);
        if (interval_min <= morpho3 && morpho3<= interval_max){
            return interval;
        }
    }
}


//______________________BAR CHART______________________
var createBarChart = function (svgEl, data, title){

    var max_data = d3.max(data, function(d){return d.values.length;});

    //the bars of the bar chart
    svgEl.append("g")
             .attr("class","bars")
             .attr("fill","steelblue")
             .selectAll("rect")
             .data(data)
             .enter()
             .append("rect")
             .attr("x",function(d,i){return 30*i;})
             .attr("width",30)
             .attr("y",function(d){return -500*d.values.length/ctx.nb_patients;})
             .attr("height",function(d){return 500*d.values.length/ctx.nb_patients;})
             .append("title")
             .text(function(d){return d.key+" : "+Math.floor(100*d.values.length/ctx.nb_patients)+"%";}).style("visibility","visible");

    //the x axis of the bar chart
    var xAxis_scale = d3.scaleBand()
                        .domain(data.map(d => d.key))
                        .range([0,30*(data.length)]);

    svgEl.append("g")
             .attr("class","xAxis")
             .style("font-size","7px")
             .call(d3.axisBottom(xAxis_scale).tickSizeOuter(0));

    //the y axis of the bar chart
    var yAxis_scale = d3.scaleLinear()
                        .domain([100*max_data/ctx.nb_patients,0])
                        .range([-500*max_data/ctx.nb_patients,0]);

    var tick_values = [];
    for (value of data){
        tick_values.push(Math.floor(100*value.values.length/ctx.nb_patients));
    }

    svgEl.append("g")
             .attr("class","yAxis")
             .call(d3.axisLeft(yAxis_scale).tickValues(tick_values));

    //title of the bar bar_chart
    svgEl.append("text")
             .text(title)
             .style("font-size","12px")
             .attr("font-weight","bold")
             .attr("transform","translate(0,"+Math.floor(-500*max_data/ctx.nb_patients - 20)+")");

};

var createTopoBarChart = function (svgEl, data, title, filter_data){

    var max_data = d3.max(data, function(d){return d.values.length;});
    var color = d3.scaleOrdinal().domain(interval_code).range(color_code);
    var scale = d3.scaleLinear().domain([0,0.3*max_data]).range([0,0.3*1871]);

    //the bars of the bar chart
    var bars = svgEl.append("g")
             .attr("class","bars")
             .selectAll("rect")
             .data(data)
             .enter()
             .append("rect")
             .attr("x",0)
             .attr("width", function(d){return scale(0.3*d.values.length);})
             .attr("y",function(d,i){return -25*(i+1);})
             .attr("height",function(d){return 25;})
             .attr("fill",function(d){return color(d.key);})
             .attr("opacity",1)
             .attr("stroke","white")
             .on("click",function(event,d){
                if (ctx.clicked){
                    d3.select(this).transition().duration(200).attr("opacity",1);
                    ctx.data = ctx.stored_data;
                    ctx.nb_patients = ctx.data.length;
                    ctx.humanG.select("#"+d.key).transition().duration(200).attr("opacity",0.1);
                    ctx.humanG.select("#body").transition().duration(200).attr("opacity",1);
                    create_stats();
                    create_topo_topoTree();
                    create_morpho();
                    ctx.clicked = false;
                }
                else {
                    d3.select(this).transition().duration(200).attr("opacity",0.5);
                    ctx.humanG.select("#body").transition().duration(200).attr("opacity",0.5);
                    ctx.data = filter_data(d.key);
                    ctx.nb_patients = ctx.data.length;
                    if (d.key === "C44-C44"){
                        ctx.humanG.select("#"+d.key).attr("opacity",1);
                    }
                    else{
                        ctx.humanG.select("#"+d.key).raise().attr("opacity",1);
                    }
                    create_stats();
                    create_topo_topoTree();
                    create_morpho();
                    ctx.clicked = true;
                }
              })
             .append("title")
             .text(function(d){return ctx.topo_intervals[d.key]+" : "+Math.floor(d.values.length)+" cases";})
             .style("visibility","visible");

    //the legends of the bars
    svgEl.append("g")
             .attr("class","legends")
             .selectAll("text")
             .data(data)
             .enter()
             .append("text")
             .text(function(d){return d.values.length;})
             .attr("transform",function(d,i){return "translate("+(scale(0.3*d.values.length)+5)+","+(-25*(i+1)+17)+")"})
             .attr("fill",function(d){return color(d.key);});

    //the y axis of the bar chart
    bar_names = data.map(d => d.key).reverse();
    for (let i=0 ; i<bar_names.length ; i++){
        var bar_name = ctx.topo_intervals[bar_names[i]];
        bar_names[i] = bar_name;
    }

    var yAxis_scale = d3.scaleBand()
                        .domain(bar_names)
                        .range([-25*(data.length),0]);

    var yAxis = svgEl.append("g")
             .attr("class","yAxis")
             .style("font","11px helvetica")
             .call(d3.axisLeft(yAxis_scale).tickSizeOuter(0));

    yAxis.selectAll("text").attr("fill",function(d,i){return color(interval_code[17-i]);});

    //the x axis of the bar chart
    var xAxis_scale = d3.scaleLinear()
                        .domain([0,max_data])
                        .range([0,0.3*1871]);

    svgEl.append("g")
             .attr("class","xAxis")
             .call(d3.axisBottom(xAxis_scale).tickSizeOuter(10));

};

var createMorphoBarChart = function (svgEl, data, title, filter_data){

    var max_data = d3.max(data, function(d){return d.values;});
    console.log(max_data);
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var scale = d3.scaleLinear().domain([0,0.2*max_data]).range([0,0.2*4259]);

    //the bars of the bar chart
    var bars = svgEl.append("g")
             .attr("class","bars")
             .selectAll("rect")
             .data(data)
             .enter()
             .append("rect")
             .attr("x",0)
             .attr("width", function(d){return scale(0.2*d.values);})
             .attr("y",function(d,i){return -30*(i+1);})
             .attr("height",function(d){return 30;})
             .attr("fill",function(d){return color(d.key);})
             .attr("opacity",1)
             .attr("stroke","white")
             .on("click",function(event,d){
                if (ctx.clicked){
                    d3.select(this).transition().duration(200).attr("opacity",1);
                    ctx.data = ctx.stored_data;
                    ctx.nb_patients = ctx.data.length;
                    create_stats();
                    create_topo_topoChart();
                    create_topo_topoTree();
                    create_morpho_morphoTree();
                    ctx.clicked = false;
                }
                else {
                    d3.select(this).transition().duration(200).attr("opacity",0.5);
                    ctx.data = filter_data(d.key);
                    ctx.nb_patients = ctx.data.length;
                    create_stats();
                    create_topo_topoChart();
                    create_topo_topoTree();
                    create_morpho_morphoTree();
                    ctx.clicked = true;
                }
              })
             .append("title")
             .text(function(d){return morpho_intervals[d.key]+" : "+Math.floor(d.values)+" cases";})
             .style("visibility","visible");

    //the legends of the bars
    svgEl.append("g")
             .attr("class","legends")
             .selectAll("text")
             .data(data)
             .enter()
             .append("text")
             .text(function(d){return d.values;})
             .attr("transform",function(d,i){return "translate("+(scale(0.2*d.values)+5)+","+(-30*(i+1)+17)+")"})
             .attr("fill",function(d){return color(d.key);});

    //the y axis of the bar chart
    bar_names = data.map(d => d.key).reverse();
    for (let i=0 ; i<bar_names.length ; i++){
        if (bar_names[i] !== "Unknown"){
            var bar_name = morpho_intervals[bar_names[i]];
            bar_names[i] = bar_name;
        }
    }

    var yAxis_scale = d3.scaleBand()
                        .domain(bar_names)
                        .range([-30*(data.length),0]);

    var yAxis = svgEl.append("g")
             .attr("class","yAxis")
             .style("font","11px helvetica")
             .call(d3.axisLeft(yAxis_scale).tickSizeOuter(0));

    yAxis.selectAll("text").style("font-size","15px").attr("fill",function(d,i){return color(interval_morpho_code[8-i]);});

    //the x axis of the bar chart
    var xAxis_scale = d3.scaleLinear()
                        .domain([0,max_data])
                        .range([0,0.2*4259]);

    svgEl.append("g")
             .attr("class","xAxis")
             .call(d3.axisBottom(xAxis_scale).tickSizeOuter(10));

};

var createProportionBarChart = function (svgEl, data, title, filter_data, create_new_Maps){

    //sort by key order
    var a ;
    var b ;
    var c ;
    var new_data;
    if (data.length === 3){
        a = data[0].key;
        b = data[1].key;
        c = data[2].key;
        if (a<=b && a<=c){
            if (b<=c){
                new_data = [data[0],data[1],data[2]];
            }
            else{
                new_data = [data[0],data[2],data[1]];
            }
        }
        else if (b<=a && b<=c){
            if (a<=c){
                new_data = [data[1],data[0],data[2]];
            }
            else{
                new_data = [data[1],data[2],data[0]];
            }
        }
        else{
            if (a<=b){
                new_data = [data[2],data[0],data[1]];
            }
            else{
                new_data = [data[2],data[1],data[0]];
            }
        }
        data = new_data;
    }

    if (data.length === 2){
        a = data[0].key;
        b = data[1].key;
        if (a<=b){
            new_data = [data[0],data[1]];
        }
        else {
            new_data = [data[1],data[0]];
        }

        data = new_data;
    }


    var max_data = d3.max(data, function(d){return d.values.length;});

    var bar_height = 0;
    var tick_values = [];
    //the bars of the bar chart
    svgEl.append("g")
             .attr("class","bars")
             .selectAll("rect")
             .data(data)
             .enter()
             .append("rect")
             .attr("fill",function(d){if (d.key === "null"){return "lightgrey";} else {return givecolor2(d.key);}})
             .attr("x",function(d){tick_values.push(Math.floor(bar_height/2)); bar_height += 200*d.values.length/ctx.nb_patients; return bar_height - 200*d.values.length/ctx.nb_patients;})
             .attr("width",function(d){return 200*d.values.length/ctx.nb_patients;})
             .attr("y",-30)
             .attr("height",20)
             .attr("opacity",1)
             /**.on("mouseover",function(event,d){
                 d3.select(this).attr("opacity",0.5);
                 ctx.data = filter_data(d.key);
                 ctx.nb_patients = ctx.data.length;
                 create_new_Maps();
             })
             .on("mouseout",function(event,d){
                 d3.select(this).attr("opacity",1);
                 ctx.data = ctx.stored_data;
                 ctx.nb_patients = ctx.data.length;
                 createMaps();
             })*/
            .on("click",function(event,d){
                if (ctx.clicked){
                    d3.select(this).transition().duration(200).attr("opacity",1);
                    ctx.data = ctx.stored_data;
                    ctx.nb_patients = ctx.data.length;
                    create_stats();
                    create_topo_topoChart();
                    create_topo_topoTree();
                    create_morpho();
                    ctx.clicked = false;
                }
                else {
                    d3.select(this).transition().duration(200).attr("opacity",0.5);
                    ctx.data = filter_data(d.key);
                    ctx.nb_patients = ctx.data.length;
                    create_new_Maps();
                    ctx.clicked = true;
                }
              })
             .append("title")
             .text(function(d){
                 if (d.key === "null"){
                     return "Unknown : "+Math.floor(100*d.values.length/ctx.nb_patients)+"% ("+d.values.length+" cases)";
                 }
                 else{
                     return d.key+" : "+Math.floor(100*d.values.length/ctx.nb_patients)+"% ("+d.values.length+" cases)";
                 }
             })
             .style("visibility","visible");

    var axis_name = data.map(d => d.key).reverse();
    for (let i = 0; i < axis_name.length ; i++){
        if (axis_name[i] === "null"){
            axis_name[i] = "Unknown";
        }
    }

    //the x axis of the bar chart
    var xAxis_scale = d3.scaleLinear()
                        .domain([0,100])
                        .range([0,200]);

    svgEl.append("g")
             .attr("class","xAxis")
             .style("font-size","10px")
             .call(d3.axisBottom(xAxis_scale).tickValues(tick_values));

    //title of the bar bar_chart
    svgEl.append("text")
             .text(title)
             .style("font",font)
             .attr("transform","translate(0,-40)");

    //legend
    svgEl.append("g")
             .attr("class","legend")
             .selectAll("rect")
             .data(data)
             .enter()
             .append("rect")
             .attr("fill",function(d){if (d.key === "null"){return "lightgrey";} else {return givecolor2(d.key);}})
             .attr("x",210)
             .attr("width",10)
             .attr("y",function(d,i){return 12*(i)-32;})
             .attr("height",10);

    svgEl.select(".legend")
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("transform",function(d,i){return "translate(225, "+(12*(i)-24)+")";})
    .attr("font","12px helvetica")
    .text(function(d){
        if (d.key === "null"){
            return "Unknown ("+d.values.length+")";
        }
        else{
            return d.key+" ("+d.values.length+")";
        }
    });

};

//______________________DISTRIBUTION CHART______________________

var createDistribution= function(chart,data,data_distribution,title,filter_data,create_new_Maps){

    var max_data = d3.max(data, function(d){return parseInt(d.key);});

    //bar chart

    var count_bars = [{"key":0,"index":0},
                      {"key":0,"index":1},
                      {"key":0,"index":2},
                      {"key":0,"index":3},
                      {"key":0,"index":4},
                      {"key":0,"index":5},
                      {"key":0,"index":6},
                      {"key":0,"index":7},
                      {"key":0,"index":8},
                      {"key":0,"index":9}];
    for (age of data){
        var section = Math.floor(parseInt(age.key)/10.);
        count_bars[section].key = count_bars[section].key + age.values.length;
    }


    //the y axis of the chart
    var max_length_data = d3.max(data,function(d){return d.values.length;});
    var scale = d3.scaleLinear().domain([max_length_data,0]).range([-0.75*278,0]);

    chart.append("g")
    .attr("class","bars")
    .attr("fill","lightgrey")
    .attr("stroke","white")
    .selectAll("rect")
    .data(count_bars)
    .enter()
    .append("rect")
    .attr("x",function(d,i){return i*3*max_data/9.;})
    .attr("width", 3*max_data/9.)
    .attr("y",function(d){return scale(0.14*d.key)})
    .attr("height",function(d){return -scale(0.14*d.key)})
    .attr("opacity",1)
    .on("click",function(event,d){
        if (ctx.clicked){
            d3.select(this).transition().duration(200).attr("opacity",1);
            ctx.data = ctx.stored_data;
            ctx.nb_patients = ctx.data.length;
            create_stats_text();
            create_stats_gender();
            create_stats_vitalStatus();
            create_stats_ethnicity();
            create_topo_topoChart();
            create_topo_topoTree();
            create_morpho();
            ctx.clicked = false;
        }
        else {
            d3.select(this).transition().duration(200).attr("opacity",0.5);
            ctx.data = filter_data(d.index);
            ctx.nb_patients = ctx.data.length;
            create_new_Maps();
            ctx.clicked = true;
        }
      })
    .append("title")
    .text(function(d,i){return 10*i+" \u2264 age \u003C "+10*(i+1)+" ("+d.key+" cases)";})
    .style("visibility","visible");

    var points = chart.append("g")
                      .attr("class","points")
                      .attr("fill","steelblue")
                      .selectAll("circle")
                      .data(data)
                      .enter()
                      .append("circle")
                      .attr("r",3)
                      .attr("cx",function(d){return 3*d.key;})
                      .attr("cy",function(d){return scale(d.values.length);})
                      .text(function(d,i){return "age "+d.key+" ("+d.values.length+" cases)";})
                      .style("visibility","visible");

    //the x axis of the chart
    var xAxis_scale = d3.scaleLinear()
                        .domain([0,max_data+10])
                        .range([0,3*max_data+30]);
    chart.append("g")
             .attr("class","xAxis")
             .call(d3.axisBottom(xAxis_scale));

    var yAxis_scale = d3.scaleLinear()
                        .domain([max_length_data,0])
                        .range([-0.75*278,0]);

    var yAxis = chart.append("g")
             .attr("class","yAxis")
             .call(d3.axisLeft(yAxis_scale).ticks(5));

    yAxis.selectAll("line")
        .style("stroke", "steelblue");

    yAxis.selectAll("path")
        .style("stroke", "steelblue");

    yAxis.selectAll("text")
        .style("stroke", "steelblue");

    //title of the chart
    chart.append("text")
             .text(title)
             .style("font","17px helvetica")
             .attr("transform","translate(0,"+Math.floor(-0.75*278 - 20)+")");

    var mu = d3.mean(data_distribution);
    var sigma = d3.deviation(data_distribution);

    //gaussian line

    var gaussian = function(x){
        return (1./(sigma*Math.sqrt(2.*3.14)))*Math.exp(-Math.pow(x-mu,2)/(2.*Math.pow(sigma,2)));
    };

    var gaussian_points = [];
    for (var i=0 ; i<=max_data ; i+=0.1){
        gaussian_points.push({"x":i,"y":gaussian(i)});
    }
    var y_min = d3.min(gaussian_points,function(d){return d.y;});
    var y_max = d3.max(gaussian_points,function(d){return d.y;});
    var yscale = d3.scaleLinear().domain([-y_max,-y_min]).range([-max_length_data,0]);

    chart.selectAll("circle")
    .data(gaussian_points)
    .enter()
    .append("circle")
    .attr("fill","#16B84E")
    .attr("r",1)
    .attr("cx",function(d){return xAxis_scale(d.x);})
    .attr("cy",function(d){return -scale(yscale(-d.y));});


};

//_________________TOPO TREE_________________

var find_interval = function(code){
    var intervals = ctx.topo_intervals;
    var value = parseInt(code.slice(1));

    for (interval in intervals){
        var min = parseInt(interval.slice(1,3));
        var max = parseInt(interval.slice(5));

        if (min<=value && value<=max){
            return interval;
        }
    }
};


var preprocess_topo_tree_data = function(){

    var sous_code_data = d3.nest()
                       .key(function(d) { if(d.icd_o_3_site === null){return null;} else{return d.icd_o_3_site;} })
                       .entries(ctx.data);
    var sous_code_count = {} ;
    for (let a=0 ; a<=9 ; a++){
        for (let b=0 ; b<=9 ; b++){
            for (let c=0 ; c<=8 ; c++){
                sous_code_count["C"+c.toString()+b.toString()+"."+a.toString()] = 0;
            }
        }
    }

    for (sous_code of sous_code_data){
        sous_code_count[sous_code.key] = sous_code.values.length ;
    }

    var code_count = {};
    for (let i=0 ; i<=9 ; i++){
        for (let j=0 ; j<=8 ; j++){
            code_count["C"+j.toString()+i.toString()] = 0;
        }
    }
    for (sous_code in sous_code_count){
        if (sous_code !== "null"){
            code_count[sous_code.slice(0,3)] += sous_code_count[sous_code];
        }
    }

    interval_count = {};
    for (interval of interval_code){
        interval_count[interval] = 0;
        var code_min = interval.split("-")[0];
        var code_max = interval.split("-")[1];
        if (interval !== "C00-C14"){
            for (let k=parseInt(code_min.slice(1,3)) ; k<=parseInt(code_max.slice(1,3)) ; k++){
                interval_count[interval] += code_count["C"+k.toString()];
            }
        }
        else {
            for (let l=0 ; l<=9 ; l++){
                interval_count[interval] += code_count["C0"+l.toString()];
            }
            for (let m=10 ; m<=14 ; m++){
                interval_count[interval] += code_count["C"+m.toString()];
            }
        }
    }
    interval_count["C80-C80"] += sous_code_count["null"];
    delete sous_code_count["null"];

    var data = ctx.topo_codes.filter(function(d){
        if (d.code_id === "C80-C80" || d.code_id === "C80" || d.code_id === "C80.9"){return false;}
        else if (d.code_id.includes("-")){return interval_count[d.code_id] !== 0;}
        else if (d.code_id.includes(".")) {return interval_count[find_interval(d.code_id.slice(0,3))] !== 0 && code_count[d.code_id.slice(0,3)] !== 0 && sous_code_count[d.code_id] !==0;}
        else {return interval_count[find_interval(d.code_id)] !== 0 && code_count[d.code_id] !==0;}
    });

    //create the root node
    var root = d3.stratify()
                 .id(function(d){return d.code_id;})
                 .parentId(function(d){

                     if (d.code_id === "C"){
                         return null;
                     }
                     else {
                         var code = d.code_id;
                         if (code.includes(".")){
                             return code.split(".")[0];
                         }
                         else if (code.includes("-")){
                             return "C";
                         }
                         else {
                             return find_interval(code);
                         }
                     }

                 })
                 (data);
    return root;
};


var createTopoTree = function(svgEl){

    //count the occurences of each node in the data
    var sous_code_data = d3.nest()
                       .key(function(d) { if(d.icd_o_3_site === null){return null;} else{return d.icd_o_3_site;} })
                       .entries(ctx.data);
    var sous_code_count = {} ;
    for (sous_code of sous_code_data){
        sous_code_count[sous_code.key] = sous_code.values.length ;
    }

    var code_count = {};
    for (let i=0 ; i<=9 ; i++){
        for (let j=0 ; j<=8 ; j++){
            code_count["C"+j.toString()+i.toString()] = 0;
        }
    }
    for (sous_code in sous_code_count){
        if (sous_code !== "null"){
            code_count[sous_code.slice(0,3)] += sous_code_count[sous_code];
        }
    }

    var interval_count = {};
    for (interval of interval_code){
        interval_count[interval] = 0;
        var code_min = interval.split("-")[0];
        var code_max = interval.split("-")[1];
        if (interval !== "C00-C14"){
            for (let k=parseInt(code_min.slice(1,3)) ; k<=parseInt(code_max.slice(1,3)) ; k++){
                interval_count[interval] += code_count["C"+k.toString()];
            }
        }
        else {
            for (let l=0 ; l<=9 ; l++){
                interval_count[interval] += code_count["C0"+l.toString()];
            }
            for (let m=10 ; m<=14 ; m++){
                interval_count[interval] += code_count["C"+m.toString()];
            }
        }
    }
    interval_count["C80-C80"] += sous_code_count["null"];
    delete sous_code_count["null"];

    //ne pas se préoccuper de ceux-là pour la taille de l'arbre mais de l'élément svg
    var width = 300;
    var height = 300;

    var dx = 10;
    var dy = 320;
    var margin = ({top: 10, right: 120, bottom: 10, left: 40});

    var diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    var tree = d3.tree().nodeSize([dx, dy]);

    var data = ctx.topo_codes;
    var root = preprocess_topo_tree_data();

    root.x0 = height/2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        d.children = null;
    });


    //color scale of the nodes and the links
    var color = d3.scaleOrdinal().domain(interval_code).range(color_code);

    const gLink = ctx.topoTreeG.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = ctx.topoTreeG.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {

        const duration = d3.event && d3.event.altKey ? 2500 : 250;
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
        });

        height = right.x - left.x + margin.right + margin.left;

        const transition = ctx.topoTreeG.transition()
            .duration(duration)
            .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => ctx.topoTreeG.dispatch("toggle"));

        // Update the nodes…
        const node = gNode.selectAll("g")
          .data(nodes, d => d.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
              d.children = d.children ? null : d._children;
              update(d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            //.attr("fill", d => d._children ? "#555" : "#999")
            .style("fill",function(d){
                var code = d.data.code_id;
                if (code === "C"){
                    return "grey";
                }
                else if (code.includes(".")){
                    return color(find_interval(code.slice(0,3)));
                }
                else if (code.includes("-")){
                    return color(code);
                }
                else {
                    return color(find_interval(code));
                }
            })
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .style("fill",function(d){
                var code = d.data.code_id;
                if (code === "C"){
                    return "grey";
                }
                else if (code.includes(".")){
                    return color(find_interval(code.slice(0,3)));
                }
                else if (code.includes("-")){
                    return color(code);
                }
                else {
                    return color(find_interval(code));
                }
            })
            .text(function(d) {
                if (d.data.code_id === "C") {return d.data.code_name;}
                else if (d.data.code_id.includes("-")) {return d.data.code_name + " ("+interval_count[d.data.code_id]+")";}
                else if (d.data.code_id.includes(".")) {return d.data.code_name + " ("+sous_code_count[d.data.code_id]+")";}
                else {return d.data.code_name + " ("+code_count[d.data.code_id]+")";}
            })
            .style("font-size",function(d){
                var code = d.data.code_id;
                if (code === "C"){
                    return "12px";
            }})
            .style("font-weight",function(d){
                var code = d.data.code_id;
                if (code === "C"){
                    return "bold";
            }})
          .clone(true).lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
          .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter()
                              .append("path")
                              .style("stroke",function(d){
                                    var code = d.target.data.code_id;
                                    if (code === "C"){
                                        return "grey";
                                    }
                                    else if (code.includes(".")){
                                        return color(find_interval(code.slice(0,3)));
                                    }
                                    else if (code.includes("-")){
                                        return color(code);
                                    }
                                    else {
                                        return color(find_interval(code));
                                    }
                              })
                              .attr("opacity",0.5)
                              .attr("d", d => {
                                  const o = {x: source.x0, y: source.y0};
                                  return diagonal({source: o, target: o});
                              });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
              const o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
    }

    update(root);
}

//_______________________MORPHO_TREE_______________________

var preprocess_morpho_tree_data = function(morpho_interval_count){
    var root;
    if (morpho_interval_count["Unknown"] !== 0 ){
        root = {"name":"Morphology","children":[{"name":"Unknown","children":[]}]};
    }
    else {
        root = {"name":"Morphology","children":[]};
    }

    var morpho3_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology.slice(0,3);} })
                        .entries(ctx.data);
    var morpho3 = [];
    for (morpho of morpho3_data){
        morpho3.push(morpho.key);
    }
    morpho3 = morpho3.sort();

    var morpho5_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology;} })
                        .entries(ctx.data);
    var morpho5 = [];
    for (morpho of morpho5_data){
        morpho5.push(morpho.key);
    }
    morpho5 = morpho5.sort();

    for (interval in morpho_intervals){
        if (morpho_interval_count[interval] !== 0){
            var interval_root = {"name":interval, "children":[]};
            var min_interval = parseInt(interval.split('-')[0]);
            var max_interval = parseInt(interval.split('-')[1]);
            for (let i=min_interval ; i<= max_interval ; i++){
                if (morpho3.includes(i.toString())){
                    var morpho3_root = {"name":i.toString(),"children":[]};
                    for (let j=0 ; j<10 ; j++){
                        for (let k=0 ; k<=6 ; k++){
                            var name5 = i.toString()+j.toString()+"/"+k.toString();
                            if (morpho5.includes(name5)){
                                var morpho5_root = {"name":name5,"children":[]};
                                morpho3_root.children.push(morpho5_root);
                            }
                        }
                    }
                    interval_root.children.push(morpho3_root);
                }
            }
            root.children.push(interval_root);
        }
    }
    return root;
};

var createMorphoTree = function(){

    //counts the number of cases with this morpho code

    var morpho3_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology.slice(0,3);} })
                        .entries(ctx.data);
    var morpho3_count = {};
    for (var morpho3 of morpho3_data){
        morpho3_count[morpho3.key] = morpho3.values.length;
    }
    morpho3 = [];
    for (var morpho of morpho3_data){
        morpho3.push(morpho.key);
    }

    var morpho5_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology;} })
                        .entries(ctx.data);
    var morpho5_count = {};
    for (morpho5 of morpho5_data){
        morpho5_count[morpho5.key] = morpho5.values.length;
    }

    var morpho_interval_count = {};
    for (interval in morpho_intervals){
        morpho_interval_count[interval] = 0;
        var min_interval = parseInt(interval.split('-')[0]);
        var max_interval = parseInt(interval.split('-')[1]);
        for (let i=min_interval ; i<=max_interval ; i++){
            if (morpho3.includes(i.toString())){
                morpho_interval_count[interval] += morpho3_count[i.toString()];
            }
        }
    }
    if (morpho3_count["null"] === undefined){
        morpho_interval_count["Unknown"] = 0;
    }
    else {
        morpho_interval_count["Unknown"] = morpho3_count["null"];
    }


    //ne pas se préoccuper de ceux-là pour la taille de l'arbre
    var width = 300;
    var height = 300;

    var dx = 15;
    var dy = 250;
    var margin = ({top: 10, right: 120, bottom: 10, left: 40});

    var diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    var tree = d3.tree().nodeSize([dx, dy]);

    var data = ctx.topo_codes;
    const root = d3.hierarchy(preprocess_morpho_tree_data(morpho_interval_count));

    root.x0 = height/2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        //if (d.depth && d.data.name.length !== 7) {
                d.children = null;
         //}
    });

    //color scale of the nodes and the links
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    const gLink = ctx.morphoTreeG.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = ctx.morphoTreeG.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {

        const duration = d3.event && d3.event.altKey ? 2500 : 250;
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
        });

        height = right.x - left.x + margin.right + margin.left;

        const transition = ctx.morphoTreeG.transition()
            .duration(duration)
            .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => ctx.morphoTreeG.dispatch("toggle"));

        // Update the nodes…
        const node = gNode.selectAll("g")
          .data(nodes, d => d.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
              d.children = d.children ? null : d._children;
              update(d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            //.attr("fill", d => d._children ? "#555" : "#999")
            .style("fill",function(d){
                var code = d.data.name;
                if (code === "Morphology"){
                    return "grey";
                }
                else if (code.includes("-")){
                    return color(code);
                }
                else if (code.includes("/")){
                    return color(d.parent.parent.data.name);
                }
                else {
                    return color(d.parent.data.name);
                }
            })
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .style("fill",function(d){
                var code = d.data.name;
                if (code === "Morphology"){
                    return "grey";
                }
                else if (code.includes("-")){
                    return color(code);
                }
                else if (code.includes("/")){
                    return color(d.parent.parent.data.name);
                }
                else {
                    return color(d.parent.data.name);
                }
            })
        .style("font-size",function(d){
            var code = d.data.name;
            if (code === "Morphology"){
                return "12px";
        }})
        .style("font-weight",function(d){
            var code = d.data.name;
            if (code === "Morphology"){
                return "bold";
        }})
            .text(function(d){
                var code = d.data.name;
                if (code === "Morphology"){
                    return "See more -->";
                }
                else if (code === "Unknown"){
                    return code+" ("+morpho_interval_count[code]+")";
                }

                else if (code.includes("-")){
                    return morpho_intervals[code]+" ("+morpho_interval_count[code]+")";
                }
                else if (code.includes("/")){
                    return ctx.morpho_sous_codes[code]+" ("+morpho5_count[code]+")";
                }
                else{
                    return ctx.morpho_codes[code]+" ("+morpho3_count[code]+")";
                }
            }
            )
          .clone(true).lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
          .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter()
                              .append("path")
                              .style("stroke",function(d){
                                    var code = d.target.data.name;
                                  if (code === "Morphology"){
                                      return "grey";
                                  }
                                  else if (code.includes("-")){
                                      return color(code);
                                  }
                                  else if (code.includes("/")){
                                      return color(d.target.parent.parent.data.name);
                                  }
                                  else {
                                      return color(d.target.parent.data.name);
                                  }
                              })
                              .attr("opacity",0.5)
                              .attr("d", d => {
                                  const o = {x: source.x0, y: source.y0};
                                  return diagonal({source: o, target: o});
                              });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
              const o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
    }

    update(root);
}

var createHuman = function (humanG){

    var organ_default_opacity = 0.1;
    humanG.selectAll("image").remove();

    humanG.append("image").attr("id","C44-C44").attr("xlink:href","./images/C44-C44.png").attr("transform", "translate(135,-19) scale(0.91)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","body").attr("xlink:href","./images/grey_body.png").attr("transform", "translate(140,-17) scale(0.91)").attr("opacity",1);
    humanG.append("image").attr("id","C00-C14").attr("xlink:href","./images/C00-C14.png").attr("transform", "scale(0.91) translate(235,20)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C15-C26").attr("xlink:href","./images/C15-C26.png").attr("transform", "scale(0.91) translate(187,35)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C30-C39").attr("xlink:href","./images/C30-C39.png").attr("transform", "scale(0.91) translate(221,13)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C40-C41").attr("xlink:href","./images/C40-C41.png").attr("transform", "scale(0.91) translate(280,300)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C42-C42").attr("xlink:href","./images/C42-C42.png").attr("transform", "scale(0.91) translate(270,280)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C47-C47").attr("xlink:href","./images/C47-C47.png").attr("transform", "translate(207,290) scale(0.2)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C48-C48").attr("xlink:href","./images/C48-C48.png").attr("transform", "scale(0.91) translate(207,155)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C49-C49").attr("xlink:href","./images/C49-C49.png").attr("transform", "scale(0.91) translate(63,-10)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C50-C50").attr("xlink:href","./images/C50-C50.png").attr("transform", "scale(0.91) translate(260,85)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C51-C58").attr("xlink:href","./images/C51-C58.png").attr("transform", "scale(0.91) translate(239,267)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C60-C63").attr("xlink:href","./images/C60-C63.png").attr("transform", "scale(0.91) translate(238,267)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C64-C68").attr("xlink:href","./images/C64-C68.png").attr("transform", "scale(0.81) translate(260,205)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C69-C72").attr("xlink:href","./images/C69-C72.png").attr("transform", "translate(141,-60)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C73-C75").attr("xlink:href","./images/C73-C75.png").attr("transform", "scale(0.9) translate(152,-20)").attr("opacity",organ_default_opacity);
    humanG.append("image").attr("id","C77-C77").attr("xlink:href","./images/C77-C77.png").attr("transform", "scale(0.55) translate(190,-30)").attr("opacity",organ_default_opacity);

};

var create_stats = function (){
    var svgEl = d3.select("#main").select("svg");

    //**********Stats widget**********
    svgEl.select("#stats").remove();
    ctx.statsG = svgEl.append("g").attr("id","stats");
    ctx.statsG.selectAll("rect").remove();
    ctx.statsFrame = ctx.statsG.append("rect").attr( "x", 20).attr( "y", 20).attr( "width", 500).attr( "height", 600).attr("fill","white").attr("stroke",'black');
    //ctx.statsTitleFrame = ctx.statsG.append("rect").attr( "x", 30).attr( "y", 30).attr( "width", 300).attr( "height", 30).attr("fill","steelblue").attr("opacity",0.5).attr("stroke",'black');

    create_stats_text();
    create_stats_gender();
    create_stats_vitalStatus();
    create_stats_ethnicity();
    create_stats_age();

    ctx.statsG.attr("transform","scale(0.8) translate(10,20)");
};

var create_stats_text = function(){
    //_____text_____
    ctx.statsG.select("#text").remove();
    ctx.textG = ctx.statsG.append("g").attr("id","text").attr("transform","translate(35,52)");
    ctx.textG.append("text").text("Summary ("+ctx.data.length+"/"+ctx.stored_data.length+" patients)").style("font","20px helvetica");
};
var create_stats_gender = function(){
    //_____gender_____
    ctx.statsG.select("#gender").remove();
    ctx.genderG = ctx.statsG.append("g").attr("id","gender").attr("transform","translate(60,150)");
    //pre_processed data for the bar chart
    var gender_data = d3.nest()
                        .key(function(d) { return d.gender; })
                        .entries(ctx.data);
    var filter_gender_data = function(key){return ctx.stored_data.filter(function(d1){return d1.gender === key;})};
    createProportionBarChart(ctx.genderG,gender_data,"Gender",filter_gender_data,create_gender_Maps);
};
var create_stats_vitalStatus = function(){
    //_____vital status_____
    ctx.statsG.select("#vitalStatus").remove();
    ctx.vitalStatusG = ctx.statsG.append("g").attr("id","vitalStatus").attr("transform","translate(60,225)");
    //pre_processed data for the bar chart
    var vital_status_data = d3.nest()
                              .key(function(d) { return d.vital_status; })
                              .entries(ctx.data);
    var filter_vitalStatus_data = function(key){return ctx.stored_data.filter(function(d1){return d1.vital_status === key;})};
    createProportionBarChart(ctx.vitalStatusG,vital_status_data,"Vital Status",filter_vitalStatus_data,create_vitalStatus_Maps);
};
var create_stats_ethnicity = function(){
    //_____ethnicity_____
    ctx.statsG.select("#ethnicity").remove();
    ctx.ethnicityG = ctx.statsG.append("g").attr("id","ethnicity").attr("transform","translate(60,300)");
    //pre_processed data for the bar chart
    var ethnicity_data = d3.nest()
                           .key(function(d) { return d.ethnicity; })
                           .entries(ctx.data);
    var filter_ethnicity_data = function(key){return ctx.stored_data.filter(function(d1){return d1.ethnicity === key;});};
    createProportionBarChart(ctx.ethnicityG,ethnicity_data,"Ethnicity",filter_ethnicity_data,create_ethnicity_Maps);
};

var create_stats_age = function(){
    //_____age_____
    ctx.statsG.select("#age").remove();
    ctx.ageG = ctx.statsG.append("g").attr("id","age");
    //pre_processed data for the bar chart
    var clean_data = ctx.data.filter(function(d){return (d.age_at_initial_pathologic_diagnosis !== null && d.age_at_initial_pathologic_diagnosis !== undefined)});
    var age_data = d3.nest()
                     .key(function(d) { return d.age_at_initial_pathologic_diagnosis; })
                     .entries(clean_data);
    var age_data_distribution = [];
    for (datum of clean_data){
        age_data_distribution.push(parseInt(datum.age_at_initial_pathologic_diagnosis));
    }
    var filter_age_data = function(index){return ctx.stored_data.filter(function(d1){return index*10 <= parseInt(d1.age_at_initial_pathologic_diagnosis) && parseInt(d1.age_at_initial_pathologic_diagnosis)<(index+1)*10;});};
    createDistribution(ctx.ageG,age_data,age_data_distribution,"Age at Diagnosis",filter_age_data,create_age_Maps);
    ctx.ageG.attr("transform","scale(0.9) translate(60,650)");
}

var create_topo = function(){
    var svgEl = d3.select("#main").select("svg");

    //**********Topo widget**********
    svgEl.select("#topo").remove();
    ctx.topoG = svgEl.append("g").attr("id","topo");
    ctx.topoG.selectAll("rect").remove();
    ctx.topoFrame = ctx.topoG.append("rect").attr( "x", 20).attr( "y", 20).attr( "width", 3000).attr( "height", 600).attr("fill","white").attr("stroke",'black');
    //ctx.topoTitleFrame = ctx.topoG.append("rect").attr( "x", 30).attr( "y", 30).attr( "width", 300).attr( "height", 30).attr("fill","steelblue").attr("opacity",0.5).attr("stroke",'black');

    create_topo_title();
    create_topo_human();
    create_topo_topoChart();
    create_topo_topoTree();

    ctx.topoG.attr("transform","scale(0.8) translate(540,20)");
};

var create_topo_title = function(){
    //_____title_____
    ctx.topoG.selectAll("text").remove();
    ctx.topoG.append("text").text("Cancer tissue site").style("font","20px helvetica").attr("transform","translate(35,52)");
};

var create_topo_human = function(){
    //_____human_____
    ctx.topoG.select("#human").remove();
    ctx.humanG = ctx.topoG.append("g").attr("id","human").attr("transform", "scale(0.85) translate(-100,150)");
    createHuman(ctx.humanG);
};

var create_topo_topoChart = function(){
    //_____topoChart_____
    ctx.topoG.select("#topoChart").remove();
    ctx.topoChartG = ctx.topoG.append("g").attr("id","topoChart").attr("transform", "translate(610,550)");
    //pre_processed data
    var interval_count = [];
    var interval_dict = {};
    var i=0;
    for (topo in ctx.topo_intervals){
        interval_count.push({"key":topo,"values":[]});
        interval_dict[topo] = i;
        i += 1;
    }
    for (patient of ctx.data){
        var sous_code = patient.icd_o_3_site;
        if (sous_code === null){
            sous_code = "C80.9";
        }
        var interval = find_interval(sous_code.split(".")[0]);
        var index = interval_dict[interval];
        interval_count[index].values.push(patient);
    }
    var filter_topo_data = function(key){return ctx.stored_data.filter(function(d1){if(d1.icd_o_3_site === null){return key === "Unknown";} else{return find_interval(d1.icd_o_3_site.slice(0,3)) === key;}})};
    createTopoBarChart(ctx.topoChartG,interval_count,"Tissue site",filter_topo_data);
};

var create_topo_topoTree = function(){
    //_____topoTree_____
    ctx.topoG.select("#topoTree").remove();
    ctx.topoTreeG = ctx.topoG.append("g").attr("id","topoTree").attr("width",600).attr("height",600);
    createTopoTree();
    ctx.topoTreeG.attr("transform","scale(1.25) translate(1050,250)");
};

var create_morpho = function(){
    var svgEl = d3.select("#main").select("svg");

    //**********Morpho widget**********
    svgEl.select("#morpho").remove();
    ctx.morphoG = svgEl.append("g").attr("id","morpho");
    ctx.morphoG.selectAll("rect").remove();
    ctx.morphoFrame = ctx.morphoG.append("rect").attr( "x", 20).attr( "y", 20).attr( "width", 3530).attr( "height", 500).attr("fill","white").attr("stroke",'black');
    //ctx.morphoTitleFrame = ctx.morphoG.append("rect").attr( "x", 30).attr( "y", 30).attr( "width", 300).attr( "height", 30).attr("fill","steelblue").attr("opacity",0.5).attr("stroke",'black');

    create_morpho_title();
    create_morpho_morphoTree();
    create_morpho_morphoChart();

    ctx.morphoG.attr("transform","scale(0.8) translate(10,650)");
};

var create_morpho_title = function(){
    //_____title_____
    ctx.morphoG.selectAll("text").remove();
    ctx.morphoG.append("text").text("Cancer morphological type").style("font","20px helvetica").attr("transform","translate(35,52)");
};

var create_morpho_morphoChart = function(){
    //_____morphoChart_____
    ctx.morphoG.select("#morphoChart").remove();
    ctx.morphoChartG = ctx.morphoG.append("g").attr("id","morphoChart").attr("transform", "translate(330,400)");
    //preprocess the data
    var morpho3_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology.slice(0,3);} })
                        .entries(ctx.data);
    var morpho3_count = {};
    for (var morpho3 of morpho3_data){
        morpho3_count[morpho3.key] = morpho3.values.length;
    }
    morpho3 = [];
    for (var morpho of morpho3_data){
        morpho3.push(morpho.key);
    }

    var morpho5_data = d3.nest()
                        .key(function(d) { if(d.icd_o_3_histology === null){return null;} else{return d.icd_o_3_histology;} })
                        .entries(ctx.data);
    var morpho5_count = {};
    for (morpho5 of morpho5_data){
        morpho5_count[morpho5.key] = morpho5.values.length;
    }

    var morpho_interval_count = {};
    for (interval in morpho_intervals){
        morpho_interval_count[interval] = 0;
        var min_interval = parseInt(interval.split('-')[0]);
        var max_interval = parseInt(interval.split('-')[1]);
        for (let i=min_interval ; i<=max_interval ; i++){
            if (morpho3.includes(i.toString())){
                morpho_interval_count[interval] += morpho3_count[i.toString()];
            }
        }
    }
    if (morpho3_count["null"] === undefined){
        morpho_interval_count["Unknown"] = 0;
    }
    else {
        morpho_interval_count["Unknown"] = morpho3_count["null"];
    }
    var morpho_interval_data_count = [];
    for (interval in morpho_interval_count){
        morpho_interval_data_count.push({"key":interval, "values":morpho_interval_count[interval]});
    }

    var filter_morpho_data = function(key){return ctx.stored_data.filter(function(d1){if(d1.icd_o_3_histology === null){return key === "Unknown";} else{return find_morpho_interval(d1.icd_o_3_histology.slice(0,3)) === key;}})};
    createMorphoBarChart(ctx.morphoChartG,morpho_interval_data_count,"Tissue site",filter_morpho_data);
};

var create_morpho_morphoTree = function(){
    //_____morphoTree_____
    ctx.morphoG.select("#morphoTree").remove();
    ctx.morphoTreeG = ctx.morphoG.append("g").attr("id","morphoTree").attr("width",600).attr("height",600);
    createMorphoTree();
    ctx.morphoTreeG.attr("transform","scale(1.25) translate(1100,225)");
};


var createMaps = function(){

    create_stats();
    create_topo();
    create_morpho();

};

var createViz = function(){
    console.log("Using D3 v"+d3.version);
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    svgEl.append("rect").attr("id","background").attr("x",0).attr("y",0).attr("width",ctx.w).attr("height",ctx.h).attr("fill","steelblue").attr("opacity",0.7);
    svgEl.append("text").text("GDC Portal Cancer Data").attr("fill","white").attr("transform","scale(2.2) translate(10,10)");
    loadData(svgEl);
};

var loadData = function(svgEl){

    Promise.all([d3.json("./data/data.json"),
                 d3.json("./data/ICD-O-3_morphology_1_3.json"),
                 d3.json("./data/ICD-O-3_topography_code_intervals.json"),
                 d3.json("./data/ICD-O-3_topography_codes.json"),
                 d3.json("./data/ICD-O-3_topography_sous_codes.json"),
                 d3.json("./data/ICD-O-3_morphology_1_5.json")])
    .then(function(data){

        ctx.stored_data = data[0];
        ctx.data = ctx.stored_data;
        ctx.nb_patients = ctx.data.length;
        ctx.morpho_codes = data[1];
        ctx.morpho_sous_codes = data[5];

        var topo = {"level_0":data[2],"level_1":data[3],"level_2":data[4]};
        var topo_codes = [];

        for (code_2 in topo.level_2){
            topo_codes.push({"code_id":code_2,"code_name":topo.level_2[code_2][0]});
        }
        for (code_1 in topo.level_1){
            topo_codes.push({"code_id":code_1,"code_name":topo.level_1[code_1]});
        }
        for (code_0 in topo.level_0){
            topo_codes.push({"code_id":code_0,"code_name":topo.level_0[code_0]});
        }
        topo_codes.push({"code_id":"C","code_name":"See more -->"});

        ctx.topo_codes = topo_codes;
        ctx.topo_intervals = data[2];
        ctx.essai = data[5];

        var svgEl = d3.select("#main").select("svg");
        createMaps(svgEl);
    });

};
