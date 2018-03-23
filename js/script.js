var channelWeightRange = [10]; //[3, 5, 6, 7, 8, 10, 11, 15, 18, 21, 22, 23, 25];
var graph = {};
var actionsWindow = document.getElementById('window');
var firstClick = false;
var linkNode;

$(document).ready(function() {
	$('#window').click(function(e) {
		if (e.target.classList.contains('nodeName') || e.target.classList.contains('node'))
			return;
		createNode(e);
	});
})

var Graph = (function (undefined) {
	var realCosts;

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
						realCosts = costs;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var nodeForSave = nodes[1];
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return {path: path.concat(shortest), cost: realCosts[nodeForSave]};
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();

function createNode(event) {
	var lastNode;
	var lastNodeNum;
	var newNodeNum;
	var newNode;

	if (Object.keys(graph).length === 0) {
		graph.N1 = {};
		newNode = 'N1';
	} else {
		for (prop in graph) {
			lastNode = prop;
		}
		lastNodeNum = lastNode.substring(1);
		newNodeNum = +lastNodeNum + 1;
		newNode = 'N' + newNodeNum;
		graph[newNode] = {};
	}
	sessionStorage.setItem('graph', JSON.stringify(graph));
	visualizeNode(newNode, event.clientX - 20, event.clientY - 120);
}

function visualizeNode(nodeName, positionX, positionY) {
	var nodeNum = nodeName.slice(1);

	$('#window').append("<div class='node' id=" + nodeName + "><span class='nodeName' id='S" + nodeNum + "'>" + nodeName + "</span><div/>");
	$('#' + nodeName).css('transform', 'translate(' + positionX + 'px, ' + positionY + 'px)');
	$('#' + nodeName).fadeIn(500);
	document.getElementById(nodeName).onmousedown = function(e) {
		if (e.button === 0) {
			createLink(e);
		} else if (e.button === 1) {
			removeNode(e);
		}
	}
}

function visualizeShortestPath() {
	var data = JSON.parse(sessionStorage.getItem('data'));
	var graphObj = new Graph(graph);
	var shortest = graphObj.findShortestPath(data.nodeFrom, data.nodeTo).path;
	var linkId;

	if ($('.link').hasClass('highlighted')) {
		$(this).removeClass('highlighted')
	}

	for (var i = 0, shortestLength = shortest.length; i < shortestLength - 1; i++) {
		linkId = 'from' + shortest[i] + 'to' + shortest[i+1];
		if (document.getElementById(linkId) === null) {
			linkId = 'from' + shortest[i+1] + 'to' + shortest[i];
			document.getElementById(linkId).classList.add('highlighted');
		} else {
			document.getElementById(linkId).classList.add('highlighted');
		}
	}
}

function removeNode(e) {
	var nodeToRemove;

	// Fix node to delete name (if need) to use it:
	if (e.target.id[0] === 'N') {
		nodeToRemove = e.target.id;
	} else {
		var id = e.target.id;
		nodeToRemove = id.replace('S', 'N');
	}

	//Node removing:
	delete graph[nodeToRemove];

	//Links removing:
	for (prop in graph) {
		delete graph[prop][nodeToRemove];
	}

	sessionStorage.setItem('graph', JSON.stringify(graph));;
	visualizeNodeRemoving(nodeToRemove);
}

function visualizeNodeRemoving(nodeToRemove) {
	var linkClasses;
	var linksToRemove = [];
	var linkWeightId;

	//Node removing:
	$('#' + nodeToRemove).remove();

	//Choosing what links to remove:
	allLinks = document.getElementsByClassName('link');
	for (var i = 0, allLinksLength = allLinks.length; i < allLinksLength; i++) {
		linkClasses = allLinks[i].classList;

		for (var j = 0, linkClassesLength = linkClasses.length; j < linkClassesLength; j++) {
			if (linkClasses[j].includes(nodeToRemove)) {
				linksToRemove.push(linkClasses[j]);
			}
		}
	}

	//Removing links:
	for (var i = 0, linksToRemoveLength = linksToRemove.length; i < linksToRemoveLength; i++) {
		$('.' + linksToRemove[i]).remove();
		linkWeightId = 'weight' + linksToRemove[i].replace(/-/g, '');
		$('#' + linkWeightId).remove();
	}

	if (sessionStorage.getItem('simulated') === 'true')
		visualizeShortestPath()
}

function createLink(e) {
	var linkTarget;

	// In order to don't reselect linkNode, when whe choose linkTarget
	if (firstClick === false) {
		// Fix node name (if need) to use it:
		if (linkNode === undefined) {
			if (e.target.id[0] === 'N') {
				linkNode = e.target.id;
			} else {
				var id = e.target.id;
				linkNode = id.replace('S', 'N');
			}
		}
	} else {
		$('body').bind('click', function(e) {
			if (e.target.classList.contains('nodeName') || e.target.classList.contains('node')) {
				// Fix target name (if need) to use it:
				if (e.target.id[0] === 'N') {
					linkTarget = e.target.id;
				} else {
					var id = e.target.id;
					linkTarget = id.replace('S', 'N');
				}

				if (linkTarget === linkNode){
					$('body').unbind('click');
					firstClick = false;
					linkNode = undefined;
					return;
				}

				if (graph[linkNode][linkTarget] === undefined) {
					graph[linkNode][linkTarget] = channelWeightRange[Math.floor(Math.random()*channelWeightRange.length)];						
				}
				if (graph[linkTarget][linkNode] === undefined) {
					graph[linkTarget][linkNode] = graph[linkNode][linkTarget];
				}

				$('body').unbind('click');
				sessionStorage.setItem('graph', JSON.stringify(graph));
				visualizeLink(e, linkNode, linkTarget, graph[linkNode][linkTarget]);
				linkNode = undefined;
				firstClick = false;
				
				return;
			} else {
				$('body').unbind('click');
				firstClick = false;
				linkNode = undefined;
				return;
			}
		})
	}

	if (firstClick === false)
		firstClick = true;

	return;
}

function visualizeLink(e, linkNode, linkTarget, weight) {
	var bounding1 = document.getElementById(linkNode).getBoundingClientRect();
	var bounding2 = document.getElementById(linkTarget).getBoundingClientRect();
	var isLinkExists = false;
	var classToCheck1 = "from-" + linkNode + "-to-" + linkTarget;
	var classToCheck2 = "from-" + linkTarget + "-to-" + linkNode;
	var x1, y1, x2, y2;
	var weightX, weightY;

	x1 = (bounding1.left + bounding1.right) / 2;
	y1 = (bounding1.top + bounding1.top) / 2 + 22 - 100;
	x2 = (bounding2.left + bounding2.right) / 2;
	y2 = (bounding2.top + bounding2.top) / 2 + 22 - 100;

	weightX = (x1 + x2) / 2;
	weightY = (y1 + y2) / 2;

	var links = document.getElementsByClassName('link');
	for (var i = 0, linksLength = links.length; i < linksLength; i++) {
		for (var j = 0, linksClassListLength = links[i].classList.length; j < linksClassListLength; j++) {
			if (links[i].classList[j] === classToCheck1 || links[i].classList[j] === classToCheck2)
				isLinkExists = true;
		}
	}

	if (!isLinkExists) {
		document.getElementById('canvas').innerHTML += 
		"<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "'" 
		+ "id='from" + linkNode + "to" + linkTarget + "' class='link from-" + linkNode + "-to-" + linkTarget + "'/>"
		+ "<text class='link-weight' id='weightfrom" + linkNode + "to" + linkTarget + "' x=" + weightX + " y=" + weightY + ">" + weight + "</text>";

				
	}

	$('.link, .link-weight').mousedown(function(e) {
		if (e.button === 1) {
			removeLink(e);
		}
	})

	if (sessionStorage.getItem('simulated') === 'true')
		visualizeShortestPath()
}

function removeLink(e) {
	var linkStart, linkEnd;
	var posLinkStart, posLinkEnd;
	var id = e.target.id;
	
	posLinkStart = id.indexOf('from') + 4;
	linkStart = id.slice(posLinkStart, id.indexOf('to'));

	posLinkEnd =id.indexOf('to') + 2;
	linkEnd = id.slice(posLinkEnd);

	delete graph[linkStart][linkEnd];
	delete graph[linkEnd][linkStart];

	sessionStorage.setItem('graph', JSON.stringify(graph));
	visualizeLinkRemoving(id);
}

function visualizeLinkRemoving(id) {
	if (id.includes('weight')) {
		$('#' + id).remove();
		$('#' + id.slice(id.indexOf('from'))).remove();
	} else {
		$('#' + id).remove();
		$('#weight' + id).remove();
	}

	if (sessionStorage.getItem('simulated') === 'true')
		visualizeShortestPath()
}

$(window).bind('beforeunload', function(){
	sessionStorage.setItem('simulated', "");
});