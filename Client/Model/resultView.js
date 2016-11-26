/*
This file has functions used to handle the response from the server
and represent the algorithms' results
*/
var stepDataArray = [];
//Coloring Globals
//Some color globals used in our graph
var DEFAULTFILL = "#27a7ce";
var DOMINATOR_FILL = "#59cc16";
var DEFAULTSTROKE = "#22629e";
var DOMINATOR_STROKE = "#4f9e22";
var CLUSTER_COLORS = [
	{"head_color" : "#d81717", "group_color" : "#a00404", "stroke": "#a00404" },
	{"head_color" : "#3b4bf7", "group_color" : "#1c29b2", "stroke": "#1c29b2" },
	{"head_color" : "#d87117", "group_color" : "#b25401", "stroke": "#b25401" },
	{"head_color" : "#d8d817", "group_color" : "#adad05", "stroke": "#adad05" },
	{"head_color" : "#17a2d8", "group_color" : "#1078a0", "stroke": "#1078a0" },
	{"head_color" : "#3ed817", "group_color" : "#26a008", "stroke": "#26a008" },
	{"head_color" : "#6b17d8", "group_color" : "#4d119b", "stroke": "#4d119b" },
	{"head_color" : "#17d89e", "group_color" : "#04a071", "stroke": "#04a071" }
];

//Checks if a node is dominator
function _isDominator(id, dominatorList){
	for(var i=0; i<dominatorList.length; i++){
		if(id == dominatorList[i]){
			return true;
		}
	}
	return false;
}

//Paint dominators in the graph with the appropriate colors
function _paintDominators(dominatorList){	
	for(var j=0; j<network.nodes.length; j++){
		if(!_isDominator(network.nodes[j].id, dominatorList)){
			network.nodes[j].graphic.attr({ circle: {fill: DEFAULTFILL, stroke : DEFAULTSTROKE}});
		}
		else{
			network.nodes[j].graphic.attr({ circle: {fill: DOMINATOR_FILL, stroke : DOMINATOR_STROKE}});
		}
	}
}

//Paint Clusters with different colors
function _paintClusters(clusterList, network){
	var tempNode;
	var index = 0;
	for(var i=0; i< clusterList.length; i++){
		if( index == CLUSTER_COLORS.length){
			index = 0;
		}
		//paint clusterhead
		tempNode = returnNodeById(clusterList[i].clusterhead);
		tempNode.graphic.attr({ circle: {fill: CLUSTER_COLORS[index]["head_color"], stroke : CLUSTER_COLORS[index]["stroke"]}});
		//paint the rest of the cluster
		for(var k=1; k<clusterList[i].group.length; k++){
			tempNode = returnNodeById(clusterList[i].group[k]);
			tempNode.graphic.attr({ circle: {fill: CLUSTER_COLORS[index]["group_color"], stroke : CLUSTER_COLORS[index]["stroke"]}});
		}
		index++;
	}
}

/*Check response type and use appropriate handler
The response will be an object that contains the 
fields:
code : the type of data the algorithm returns so that 
the client knows how to handle the representation
	1: wu li dominators list, 2: multipoint relays cds 
	3: dca, 4: max_min, 5: mis, 6: lmst. 7: rng, 8: gg
solution : the data to be sent to the client */
function handleResponse(data, status, XMLHttpRequest){
	switch(data["code"]){
		case "1" : _wuLiDominatorsAnalysis(data); break;
		case "2" : _mprCdsAnalysis(data); break;
		case "3" : _dcaAnalysis(data); break;
		case "4" : break;
		case "5" : break;
		case "6" : break;
		case "7" : break;
		case "8" : break;
		default:break;
	}
}

//Show the steps from th Wu Li CDS algorithm
function _wuLiDominatorsAnalysis(response){
	stepDataArray = []; //clear the global steps data from previous executions
	var stepId = 0; //will be used for indexing a global array of step data
	var text = "<p class=\"solution-result colored-text\">The algorithm's result is : [ "+response["solution"].final_result
				+" ]<br> Execution Analysis :</p>";
	//for each part of the solution
	for(var property in response["solution"]){
		if(response["solution"].hasOwnProperty(property) && property != "final_result"){
			//for each step of that part
			text += "<p class=\"solution-heading\">"+ response["solution"][property].text + "</p>"; 
			for(var j=0; j<response["solution"][property].steps.length; j++){
				text += "<div class=\"well dom-step step\" id=\""+stepId+"\">";
				text += response["solution"][property].steps[j].text;
				text += "<br/>Dominators [ " + response["solution"][property].steps[j].data["dominators"] +" ]";
				text += "</div>";
				stepDataArray.push(response["solution"][property].steps[j].data["dominators"]);
				stepId ++;
			}
			text += "<p class=\"colored-text\">Results so far : [ " + response["solution"][property].result["dominators"]+" ]</p>";
		}
	}
	$("#solutionBoxData").html(text);
	_paintDominators(response["solution"].final_result);
}

//Converts the result of the DCA algorithm to string 
function _stringifyDcaResult(clusters){
	var text = "";
	for(var i=0; i<clusters.length; i++){
		text += "{ head : "+clusters[i].clusterhead+" | group : ["+clusters[i]["group"]+"]} ";
	}
	return text;
}

//Show the steps of the Multipoint Relay CDS algorithm
function _mprCdsAnalysis(response){
	stepDataArray = []; //clear the global steps data from previous executions
	var stepId = 0; //will be used for indexing a global array of step data
	var text = "<p class=\"solution-result colored-text\">The algorithm's result is : [ "+response["solution"].final_result
				+" ]<br> Execution Analysis :</p>";
	if(response["solution"].hasOwnProperty("MPR_set")){
		text += "<p class=\"solution-heading\">"+ response["solution"]["MPR_set"].text + "</p>";
		for(var j=0; j<response["solution"]["MPR_set"].steps.length; j++){
			text += "<div class=\"well mpr-step step\" id=\""+stepId+"\">";
			text += response["solution"]["MPR_set"].steps[j].text;
			text += "<br/>MPR set [ " + response["solution"]["MPR_set"].steps[j].data["mpr_set"] +" ]";
			text += "</div>";
			stepDataArray.push(response["solution"]["MPR_set"].steps[j].data["mpr_set"]);
			stepId ++;
		}
		text += "<p class=\"colored-text\">MPR sets per node : [ ";
		for(var k=0; k<response["solution"]["MPR_set"].result["All_MPR_sets"].length; k++){
			text += "{ Node " + network.nodes[k].id + " : " +response["solution"]["MPR_set"].result["All_MPR_sets"][k] + " } ";
		}
		text += " ]</p>";
	}
	if(response["solution"].hasOwnProperty("MPR_cds")){
		text += "<p class=\"solution-heading\">"+ response["solution"]["MPR_cds"].text + "</p>";
		for(var j=0; j<response["solution"]["MPR_cds"].steps.length; j++){
			text += "<div class=\"well mpr-step step\" id=\""+stepId+"\">";
			text += response["solution"]["MPR_cds"].steps[j].text;
			text += "<br/>Dominators [ " + response["solution"]["MPR_cds"].steps[j].data["dominators"] +" ]";
			text += "</div>";
			stepDataArray.push(response["solution"]["MPR_cds"].steps[j].data["dominators"]);
			stepId ++;
		}
		text += "<p class=\"colored-text\">Results so far : [ " + response["solution"]["MPR_cds"].result["MPR_cds"]+" ]</p>";
	}
	$("#solutionBoxData").html(text);
	_paintDominators(response["solution"].final_result);
}

function _dcaAnalysis(response){
	stepDataArray = []; //clear the global steps data from previous executions
	var stepId = 0; //will be used for indexing a global array of step data
	var solution = response["solution"];
	var text = "<p class=\"solution-result colored-text\">The algorithm's result is : [ "+_stringifyDcaResult(solution.final_result)
				+" ].</br>The weights given for each node by id order were : ["+ ajaxObject["extras"]["weights"] +"].</br>Execution Analysis :</p>";		
	for(var i=0; i< solution["DCA_timesteps"].length; i++){
		text += "<p class=\"solution-heading\">"+ solution["DCA_timesteps"][i].text + "</p>";
		for(var j=0; j<solution["DCA_timesteps"][i].steps.length; j++){
			text += "<div class=\"well dca-step step\" id=\""+stepId+"\">";
			text += solution["DCA_timesteps"][i].steps[j].text;
			text += "</div>";
			stepId++;
		}
	}
	ajaxObject["extras"] = {};
	$("#solutionBoxData").html(text);
	_paintClusters(response["solution"].final_result);
}

//Handle clicks on objects related to algorithm results
$(document).ready(function(){
	$(document).on("click",".dom-step",function(){
		_paintDominators(stepDataArray[$(this).attr("id")]);
	});

	$(document).on("click",".mpr-step",function(){
		_paintDominators(stepDataArray[$(this).attr("id")]);
	});
});