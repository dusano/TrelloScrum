/*
** TrelloScrum v0.54 - https://github.com/dusano/TrelloScrum
** Adds Scrum to your Trello (with Zemanta extensions)
**
** Export of Trello board to csv
**
** Original:
** Dusan Omercevic <https://github.com/dusano>
**
*/

//what to do when DOM loads
$(function(){
	//Export data to CSV
	$(document).on('DOMNodeInserted', ".pop-over .content", addCSVbutton);
});

function attachCSVdata(CSVbutton, cards) {
	processing_complete = true;
	for (var i = 0; i < cards.length; i++)
		processing_complete &= cards[i]["complete"];
	
	if (!processing_complete) {
		setTimeout(function(){attachCSVdata(CSVbutton, cards)}, 100);
		return;
	}

	var csvstring = "";
	for (var i = 0; i < cards.length; i++) {
		var card = cards[i];
		
		regex = /\(([0-9]+)\)\s*/;
		card_name = card
			.name
			.replace(regex, "")
			.replace(/\"/g, "'");
		
		no_points = -1
	
		try {
			matches = regex.exec(card.name);
			no_points = parseInt(matches[1]);
		} catch(err) {
			console.error("Card " + card.name + " is not in valid format");
		}
		
		card_desc = card
			.desc
			.replace(/(\r\n|\n)/g, "<br />")
			.replace(/\"/g, "'");
	
		csvstring = csvstring + 
			"\"" + card_name + "\"," + 
			"\"" + card_desc + "\"," +
			"\"" + card["checklist"] + "\"," + 
			no_points + "\n";
	}

	CSVbutton
		.attr("href", "data:text/csv," + escape(csvstring))
		.show();
}

function exportCardsToCSV(CSVbutton, cards) {
	
	$.each(cards, function(ix, card) {	
		
		card["complete"] = false;
		$.ajax({
			type: "GET",
			url: "https://trello.com/1/cards/" + card.id + "/checklists",
			success: function(checklists) {
				checklist_str = "";
				$.each(checklists, function(iy, checklist) {
					for (var i = 0; i < checklist.checkItems.length; i++) {
						if (checklist_str != "")
							checklist_str += "<br />";
						checklist_str += checklist.checkItems[i].name;
					}
				});
				card["checklist"] = checklist_str;
				card["complete"] = true;
			},
			error: function(err) {
				console.log("Error:" + JSON.stringify(err));
			}
		});
	});
	
	setTimeout(function(){attachCSVdata(CSVbutton, cards)}, 1);
}

function addCSVbutton() {
	if (!$(this).find("a.js-export-csv").length) {
		JSONbutton = $(this).find("a.js-export-json");
	  	var CSVbutton = JSONbutton
	  		.clone()
	  		.removeClass("js-export-json")
	  		.addClass("js-export-csv")
	  		.attr("href", "#")
	  		.text("CSV")
	  		.appendTo(JSONbutton.parent())
	  		.hide();
	  	
	  	
	  	$.ajax({
			type: "GET",
			url: "https://trello.com/1/boards/4f758b58cbcf5f30554f2192/cards",
			success: function(cards) {
				exportCardsToCSV(CSVbutton, cards);
			},
			error: function(err) {
				console.log("Error:" + JSON.stringify(err));
			}
		});
	}
}
