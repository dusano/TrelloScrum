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

function addCalculateWorkloadMenuItem() {
	if (!$(this).find("a.js-workload").length) {
		MembersMenuItem = $(this).find("a.js-members");
		
	  	var WorkloadMenuItem = MembersMenuItem.parent()
	  		.clone();
	  	
	  	WorkloadMenuItem.find("a")
	  		.removeClass("js-members")
	  		.addClass("js-workload")
	  		.attr("href", "#")
	  		.text("Workload");
	  	
	  	WorkloadMenuItem
	  		.insertAfter(MembersMenuItem.parent());
	}
}