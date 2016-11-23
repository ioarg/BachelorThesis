/*
This file will be used to alter the view of the page 
and handle user interaction
*/
//Some color globals used in our graph
var DEFAULTFILL = "#27a7ce";
var DOMINATOR_FILL = "#59cc16";
var DEFAULTSTROKE = "#22629e";
var DOMINATOR_STROKE = "#4f9e22";
var algorithm_code = "empty";
var algorithm_name;
var ajaxObject = {
	"code" : -1,
	"net" : {},
	"extras" : {}	//extra data assosiated with the network that an algorithm needs
};
var stepDataArray = [];
var randomWeights = true;
var weightMap = [];
var dialogError = false;
var footerHeight = 90;

//Reset everything (Clear graph view and data so far)
function _reset(options){
	if(options == "all"){
		graph.clear();
		network.nodes = [];
		usedIds = []; 
		panelOffset = $("#graph_panel").offset();
		addingNode = false; 							
		removingNode = false;							
		linkSelect1 = false;							
		linkSelect2 = false;							
		linkStart = null;										
		linkEnd = null; 	 
	}
	else{
		for(var i=0; i<network.nodes.length; i++){
			network.nodes[i].dominator = false;
			network.nodes[i].preferedBy = 0;
		}
	}
}

//Send an Ajax Request to the server
function _sendAjaxRequest(){
	$.ajax({
		url: "http://localhost:3000",
		contentType: "application/json",
		dataType: "json",
		type: "POST",
		data: JSON.stringify(ajaxObject),
		success : handleResponse
	});
}

/*//Make the solutionBox follow scroll
function _solutionBoxFollow(){
	var limit = $("#page_header").height() + $("#main_container").height();
	var winOffset = $(window).scrollTop() + $(window).height();
	var topLine;
	if(winOffset < limit ){
		topLine = winOffset - $("#solutionBox").height();
		$("#solutionBox").css({ top : topLine + "px"});
	}
	else{
		topLine = limit - $("#solutionBox").height();
		$("#solutionBox").css({ top : topLine + "px"});
		console.log("I'm in Else");
	}
}*/

function _responsiveSizes(){
	$("#dca_dialog_scroll").hide();
	$("#tools_panel").height($("#main_container").height());
	$("#solutionBox").height($("#main_container").height());
	$("#solutionBox").width( Math.floor( $("#main_container").width()/5) );
	$("#solutionBoxData").height($("#solutionBox").height() - 85);
	$("#drawHeader").width($("#main_container").width() - $("#solutionBox").width() - $("#tools_panel").width() -20);
	$("#graph_panel").width($("#main_container").width() - $("#solutionBox").width() - $("#tools_panel").width() -20);
	paper.setDimensions($("#graph_panel").width(), $("#graph_panel").height());
}

$(document).ready(function() {	
	//Initialize on ready
	_responsiveSizes();
	//Capture Window events
	$(window).on('resize', function(){
    	_responsiveSizes();
    	paper.scaleContentToFit({ "minScaleX" : 0.4, "minScaleY" : 0.4, "maxScaleX" : 1.0, "maxScaleY" : 1.0});
	});
	//Create the dca dialogue's list li elements
	function _dcaDialogCreateInputs(){
		var text = "";
		for(var i=0; i<network.nodes.length; i++){
			text +="<li>";
			text +="<form>Node "+network.nodes[i].id+" <input type=\"number\" id=\"weight_"+i+"\"></form>";
			text += "</li>";
		}
		return text;
	}
	//If the dca dialog "OK" was clicked, handle the weight data to be sent to the server
	function _dcaDialogWeightsHandler(){
		weightMap = [];
		dialogError = false;
		var noDuplicates = false;
		var uniqList = [];
		var difference = 0;
		if(randomWeights){
			while(!noDuplicates){	//the weights must be different
				for(var i=0; i<network.nodes.length; i++){
					weightMap.push(Math.floor( Math.random() * (40 - 10)) + 10 );
				}
				uniqList = _.uniq(weightMap);
				difference = weightMap.length - uniqList.length;
				if(difference == 0){
					noDuplicates = true;
					break;
				}
				else{
					weightMap = uniqList;
					for(var j=0; j<difference; j++){
						weightMap.push(Math.floor( Math.random() * (40 - 10)) + 10 );
					}
				}
			}
			ajaxObject["extras"]["weights"] = weightMap;
			_sendAjaxRequest();
			$("#dca_dialog").modal("hide");
		}
		else{
			$("#dca_dialog_list").children().each(function(){
				var weightTxt = $(this).find("input").val();
				var number = parseInt(weightTxt);
				if(isNaN(number)){
					dialogError = true;
					weightMap = [];
					alert("Weights must be integer inputs");
				}
				else{
					weightMap.push(number);
				}
			});
			if(!dialogError){
				difference = weightMap.length - _.uniq(weightMap).length;
				if(difference == 0){
					ajaxObject["extras"]["weights"] = weightMap;
					_sendAjaxRequest();
					$("#dca_dialog").modal("hide");
				}else{
					alert("Please don't insert duplicate numbers");
				}
			}
		}
	}
	
	//Buttons Reactions ===========================================================
	$("#execute_btn").click(function() {
		if(algorithm_code != "empty"){
			if(network.nodes.length > 2){
				ajaxObject.code = algorithm_code;
				ajaxObject.net = network;
				if(algorithm_code == "alg_3"){
					$("#dca_dialog_list").html(_dcaDialogCreateInputs());
					$("#dca_dialog").modal("show");
				}
				else{
					_sendAjaxRequest();
				}	
			}
			else{
				alert("Network too small");
			}
		}	
	});

	$(".workspace_btn").click(function(){
		$(".workspace_btn").removeClass("workspace_btn_clicked");
		$(this).addClass("workspace_btn_clicked");
	});

	$("#clear_btn").click(function() {
		//Reinitialize the main global variables
		_reset("all");
	});

	$(".algorithm_select").click(function(){
		algorithm_name = $(this).text();
		algorithm_code = $(this).attr("id");
		$("#selection_text").text("You selected the " + algorithm_name + " algorithm");
	});

	$("#instructions_btn").click(function(){
		$("#instructions_dialog").modal("show");
	});

	$("#dca_dialog_continue").click(function(){
		_dcaDialogWeightsHandler();
	});

	$("#weights_randomBtn").click(function(){
		randomWeights = true;
		$("#dca_dialog_scroll").hide();
	});

	$("#weights_customBtn").click(function(){
		randomWeights = false;
		$("#dca_dialog_scroll").show();
	});

});