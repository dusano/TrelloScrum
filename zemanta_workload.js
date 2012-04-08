/*
** TrelloScrum v0.54 - https://github.com/dusano/TrelloScrum
** Adds Scrum to your Trello (with Zemanta extensions)
**
** Calculation of workload for the board
**
** Original:
** Dusan Omercevic <https://github.com/dusano>
**
*/

//what to do when DOM loads
$(function(){
	//Add menu item to the board menu for calculating workload of the board
	$(document).on('DOMNodeInserted', ".pop-over .content", addCalculateWorkloadMenuItem);
});

function calculateWorkload(cards) {
	
	processing_complete = true;
	for (var i = 0; i < cards.length; i++)
		processing_complete &= cards[i]["complete"];
	
	if (!processing_complete) {
		setTimeout(function(){calculateWorkload(cards)}, 100);
		return;
	}
	
	unparsed_entries = new Array();
	workload = {};
	total_no_points = 0;
	for (var i = 0; i < cards.length; i++) {
		var card = cards[i];
		for (var j = 0; j < card.checklist.length; j++) {
			checklist = card.checklist[j];
			for (var k = 0; k < checklist.checkItems.length; k++) {
				checkItem = checklist.checkItems[k];
				
				try {
					regex = /^.*\[(\d*)\s*@(\w*)]$/;
					matches = regex.exec(checkItem.name);
					no_points = parseInt(matches[1]);
					member = matches[2];
					
					if (!(member in workload))
						workload[member] = 0;
					workload[member] += no_points;
					total_no_points += no_points;
				} catch(err) {
					unparsed_entries.push(
						{
							"card": card.name,
							"item": checkItem.name
						});
				}
			}
		}
	}
	
	$("#workload-title").text("Workload (" + total_no_points + "):");
	
	var member_list = $("#workload-dialog-content").find("ul#members");
	member_list.empty();
	for (var member in workload)
		$('<li/>')
			.text(member + ": " + workload[member])
			.appendTo(member_list);
	
	var unparsed_list = $("#workload-dialog-content").find("ul#unparsed");
	unparsed_list.empty();
	if (unparsed_entries.length) {
		$("#unparsable-entries").show();
		for (var i = 0; i < unparsed_entries.length; i++)
			$('<li/>')
				.text(unparsed_entries[i].card + ": " + unparsed_entries[i].item)
				.appendTo(unparsed_list);
	} else
		$("#unparsable-entries").hide();
}

function fetchCardAndCalculateWorkload(cards) {
	
	$.each(cards, function(ix, card) {	
		
		card["complete"] = false;
		$.ajax({
			type: "GET",
			url: "https://trello.com/1/cards/" + card.id + "/checklists",
			success: function(checklists) {
				card["checklist"] = checklists;
				card["complete"] = true;
			},
			error: function(err) {
				console.log("Error:" + JSON.stringify(err));
			}
		});
	});
	
	setTimeout(function(){calculateWorkload(cards)}, 1);
}

function addCalculateWorkloadMenuItem() {
	if (!$(this).find("a.js-workload").length) {
		MembersMenuItem = $(this).find("a.js-members");
		
	  	var WorkloadMenuItem = MembersMenuItem.parent()
	  		.clone();
	  	
	  	WorkloadMenuItem.find("a")
	  		.removeClass("js-members")
	  		.addClass("js-workload")
	  		.attr("href", "#")
	  		.text("Workload")
	  		.click(function() {
	  			regex = /\/[^\/]*\/[^\/]*\/([^\/]*)\/?.*$/;
	  			matches = regex.exec(window.document.location.pathname);
	  			board_id = matches[1];
	  			$.ajax({
					type: "GET",
					url: "https://trello.com/1/boards/" + board_id + "/cards",
					success: function(cards) {
						var dialog_div = $('<div id="workload-dialog" title="Board workload">' +
							'<div id="workload-dialog-content">' +
							'<h2 id="workload-title">Workload:</h2>' +
							'<ul id="members" class="workload-list"/>' +
							'<div id="unparsable-entries" style="visibility:none">' +
							'<h2>Unparsable entities:</h2>' +
							'<ul id="unparsed" class="workload-list"/>' +
							'</div>' +
							'</div>' +
							'<div><a id="workload-dialog-refresh" class="button" href="#">Refresh</div>' +
							'</div>');
						dialog_div.find("#workload-dialog-refresh").click(function() {
							fetchCardAndCalculateWorkload(cards);
						});
						dialog_div.dialog(
							{ 
								width: 350,
								height: 530,
								draggable: true
							});
						fetchCardAndCalculateWorkload(cards);
					},
					error: function(err) {
						console.log("Error:" + JSON.stringify(err));
					}
				});
	  		});
	  	
	  	WorkloadMenuItem
	  		.insertAfter(MembersMenuItem.parent());
	}
}