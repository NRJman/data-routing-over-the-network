var mainButtonClicked = false;

$('#simulate').on('click', function() {
	mainButtonClicked = true;
	prepareSimulation();
});

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

var generalStructure = {};

$('body').bind('dblclick', function(e) {
	if (e.target.classList[0] === 'nodeName' || e.target.classList[0] === 'node')
		renderModal(e);
});

function renderModal(e) {
	var graph = JSON.parse(sessionStorage.getItem('graph'));
	var graphObj = new Graph(graph);
	var allNodesList = [];
	var table = document.getElementById('table');
	var title = document.getElementById('modalTitle');
	var startNode, i, shortestPath;
	table.innerHTML = "<tr>" + 
							"<th>Target</th>" +
							"<th>Next step to get the target</th>" + 
							"<th>Summary weight</th>" + 
						"</tr>";
	title.innerText = '';

	if (e.target.id[0] === 'N') {
		startNode = e.target.id;
	} else {
		var id = e.target.id;
		startNode = id.replace('S', 'N');
	}
	/*console.log(graphObj.findShortestPath('N1', 'N4'));*/
	for (i = 0; i < document.getElementsByClassName('node').length; i++) {
		allNodesList.push(document.getElementsByClassName('node')[i].id)
	}

	for (i = 0; i < allNodesList.length; i++) {
		if (allNodesList[i] !== startNode) {
			shortestPath = graphObj.findShortestPath(startNode, allNodesList[i]);
			title.innerText = 'Selected node: ' + startNode;
			table.innerHTML += 
				"<tr>" 
			+  		"<td>" + shortestPath.path[shortestPath.path.length - 1] + "</td>" 
			+  		"<td>" + shortestPath.path[1] + "</td>"
			+  		"<td>" + shortestPath.cost + "</td>"
			+ 	"</tr>";
		}
	}

	$('#nodesModal').modal('show');
}

function prepareSimulation() {
	if (mainButtonClicked) {
		var primaryData = {};

		primaryData.nodeFrom = document.getElementById('start').value;
		primaryData.nodeTo = document.getElementById('finish').value;
		primaryData.logical = document.getElementById('logicalCheckbox').checked;
		primaryData.datagram = document.getElementById('datagramCheckbox').checked;
		primaryData.messageSize = document.getElementById('messageSize').value;
		primaryData.datafieldSize = document.getElementById('fieldSize').value;

		if (primaryData.nodeFrom === "") {
			alert('Please fill all the fields.');
			return;
		}

		if (primaryData.nodeTo === "") {
			alert('Please fill all the fields.');
			return;
		}
		if (primaryData.messageSize === "") {
			alert('Please fill all the fields.');
			return;
		}
		if (primaryData.datafieldSize === "") {
			alert('Please fill all the fields.');
			return;
		}
		if (primaryData.logical === false && primaryData.datagram === false) {
			alert('Please fill all the fields.');
			return;
		}
		if (primaryData.nodeFrom.length < 2 || primaryData.nodeFrom[0] !== 'N' || isNaN(primaryData.nodeFrom.slice(1))) {
			alert('Incorrect node name.');
			return;
		}
		if (primaryData.nodeTo.length < 2 || primaryData.nodeTo[0] !== 'N' || isNaN(primaryData.nodeTo.slice(1))) {
			alert('Incorrect node name.');
			return;
		}
		if (isNaN(primaryData.messageSize) || primaryData.messageSize <= 0) {
			alert('Incorrect message size');
			return;
		}
		if (isNaN(primaryData.datafieldSize) || primaryData.datafieldSize <= 0) {
			alert('Incorrect data field size');
			return;
		}

		primaryData.messageSize = +primaryData.messageSize;
		primaryData.datafieldSize = +primaryData.datafieldSize;
		sessionStorage.setItem('data', JSON.stringify(primaryData));

		mainButtonClicked = false;
		startSimulation(primaryData);
	}
}

function startSimulation(data) {
	generatePackages(data);
	generateGeneralStructure(data);
	visualizeShortestPath(data);
	sessionStorage.setItem('simulated', true);
	var packagesNum = generalStructure.packages.length;

	if (data.datagram === true) {
		datagramSimulate(data, packagesNum);
	} else {
		logicalSimulate(data, packagesNum);
	}
}

function visualizeShortestPath() {
	var data = JSON.parse(sessionStorage.getItem('data'));
	var graphObj = new Graph(graph);
	var shortest = graphObj.findShortestPath(data.nodeFrom, data.nodeTo).path;
	var linkId;

	$('.highlighted').removeClass('highlighted');

	for (var i = 0; i < shortest.length - 1; i++) {
		linkId = 'from' + shortest[i] + 'to' + shortest[i+1];
		if (document.getElementById(linkId) === null) {
			linkId = 'from' + shortest[i+1] + 'to' + shortest[i];
			document.getElementById(linkId).classList.add('highlighted');
		} else {
			document.getElementById(linkId).classList.add('highlighted');
		}
	}
}

function generatePackages(data) {
	var packagesNumber = Math.ceil(data.messageSize / data.datafieldSize);
	var packages = {};

	for (var i = 0; i < packagesNumber; i++) {
		packages['package' + (i + 1)] = {};
		packages['package' + (i + 1)].name = 'package' + (i + 1);
		
		if (i !== packagesNumber - 1) {
			packages['package' + (i + 1)].size = data.datafieldSize;
		} else {
			packages['package' + (i + 1)].size = data.messageSize % data.datafieldSize;
		}

		packages['package' + (i + 1)].location = {
			name: "",
			type: ""
		}
		packages['package' + (i + 1)].nodesVisited = {
			name: ""
		}
	}
	generalStructure.packages = [];
	generalStructure.startingArray = [];

	//Generate packages array
	for (var prop in packages) {
		packages[prop].location.type = 'start';
		packages[prop].location.name = 'startingArray';
		generalStructure.packages.push(packages[prop])
	}

	//Generate starting array (consists of all packages, but without first one)
	for (var i = 1; i < generalStructure.packages.length; i++) {
		generalStructure.startingArray.push(generalStructure.packages[i]);
	}
}

function generateGeneralStructure(data) {
	var channelName;
	var shortestPathToTarget;

	for (prop in graph) {

		//Generate nodes objects
		generalStructure[prop] = {
			name: prop,
			type: 'node',
			content: '',
			graphCopy: graph,
			shortestPathToTarget: function() {
				var graphObj = new Graph(this.graphCopy);
				var valueToReturn = graphObj.findShortestPath(this.name, data.nodeTo);
				this.graphCopy = JSON.parse(sessionStorage.getItem('graph'));
				return valueToReturn;
			}
		}

		//Gnerate channels objects
		for (key in graph[prop]) {
			channelName = generalStructure[prop].name + key;
			generalStructure[channelName] = {};
			generalStructure[channelName].name = channelName;
			generalStructure[channelName].type = 'channel';
			generalStructure[channelName].timeRow = new Array(graph[prop][key] - 1);

		}
	}

	//Put the first package to the start node
	generalStructure.packages[0].location.type = 'node';
	generalStructure.packages[0].location.name = data.nodeFrom;
	generalStructure[data.nodeFrom].content = generalStructure.packages[0];

	console.log(generalStructure);
	console.log(graph);
	var graphObj = new Graph(graph);
	console.log(graphObj.findShortestPath(data.nodeFrom, data.nodeTo));
}

function logicalSimulate(data, packagesNum) {
	var graphObj = new Graph(graph);
	var shortest = graphObj.findShortestPath(data.nodeFrom, data.nodeTo);
	var time = (((2 * packagesNum + 4) * shortest.cost) * data.messageSize) / 10;
	var result;

	result = [
		{	
			name: "Informational data: ",
			value: data.messageSize
		},
		{
			name: "Service data: ",
			value: 208
		},
		{
			name: "Transfer time: ",
			value: time
		},
		{
			name: "Informational packages: ",
			value: packagesNum
		},
		{
			name: "Service packages: ",
			value: 4 + packagesNum
		}
	];

	showResult(result, 'Logical mode');
}

function datagramSimulate(data, packagesNum) {
	var generalTime = -1;
	//Location types: start, node, channel

	while (generalStructure.packages.length > 0) {
		for (var i = 0; i < generalStructure.packages.length; i++) {
			if (generalStructure.packages[i].location.type === 'start') {
				//Check if first node is free
				if (generalStructure[data.nodeFrom].content === "") {
					//Move package to the first node
					generalStructure[data.nodeFrom].content = generalStructure.packages[i];
					//Find this package in a startingArray and remove it from there
					for (var j = 0; j < generalStructure.startingArray.length; j++) {
						if (generalStructure.startingArray[j].name === generalStructure.packages[i].name) {
							generalStructure.startingArray.splice(j, 1)
						}
					}
					//Update package.location property
					generalStructure.packages[i].location.type = 'node';
					generalStructure.packages[i].location.name = data.nodeFrom;
				}
			} else if (generalStructure.packages[i].location.type === 'node') {
				var node = generalStructure.packages[i].location.name;
				var shortest = generalStructure[node].shortestPathToTarget();
				var numOfPossiblePaths = Object.keys(graph[node]).length;

				//Loop the possible paths
				for (var p = 0; p < numOfPossiblePaths; p++) {
					var numOfGraphsAheadOfCurrent = 0;

					//Loop the shortest path:
					for (var j = 0; j < shortest.path.length; j++) {
						var nodeToChangeGraph = shortest.path[j];
						if (j !== shortest.path.length - 1) {
							var currentChannel = generalStructure[shortest.path[j] + shortest.path[j+1]];
							var timeToAdd = 0;

							//Loop the channel:
							for (var k = 0; k < currentChannel.timeRow.length; k++) {
								if (currentChannel.timeRow[k] !== undefined && currentChannel.timeRow[k] !== undefined) {
									//Time of met package in channel to finish moving in this channel
									timeToAdd = currentChannel.timeRow.length - k;

									if (numOfGraphsAheadOfCurrent !== 0) {
										timeToAdd += currentChannel.timeRow.length * numOfGraphsAheadOfCurrent;
									}

									numOfGraphsAheadOfCurrent += 1;
								}
							}
							//Update channel weight in a shortest path (given the fact that there can be packages)
							generalStructure[nodeToChangeGraph]["graphCopy"][shortest.path[j]][shortest.path[j+1]] += timeToAdd;
						}
					}
					//Recheck the shortest path (given the fact that we updated channels weights)
					if (JSON.stringify(shortest) === JSON.stringify(generalStructure[node].shortestPathToTarget())){
						break;
					} else {
						shortest = generalStructure[node].shortestPathToTarget();
					};
				}

				var nameOfNextStepInPath = node + shortest.path[1];
				var nextStepInPath = generalStructure[nameOfNextStepInPath];
				var isChannelFree = true;

				for (var p = 0; p < generalStructure[nameOfNextStepInPath].timeRow.length; p++) {
					if (generalStructure[nameOfNextStepInPath].timeRow[p] !== undefined && generalStructure[nameOfNextStepInPath].timeRow[p] !== "") {
						isChannelFree = false;
						break;
					}
				}

				if (isChannelFree) {
					generalStructure.packages[i].location.type = 'channel';
					generalStructure.packages[i].location.name = nameOfNextStepInPath;
					generalStructure[nameOfNextStepInPath].timeRow[0] = generalStructure.packages[i];
					generalStructure[node].content = "";
				}
			} else if (generalStructure.packages[i].location.type === 'channel') {
				var currentChannel = generalStructure.packages[i].location.name;

				for (var j = 0; j < generalStructure[currentChannel].timeRow.length; j++) {
					if (generalStructure[currentChannel].timeRow[j] !== undefined && generalStructure[currentChannel].timeRow[j] !== "") {
						if (j !== generalStructure[currentChannel].timeRow.length - 1) {
							generalStructure[currentChannel].timeRow[j + 1] = generalStructure[currentChannel].timeRow[j];
							generalStructure[currentChannel].timeRow[j] = undefined;
							j += 1;
						} else {
							if (currentChannel.slice(currentChannel.lastIndexOf('N')) === data.nodeTo) {
								for (var z = 0; z < generalStructure.packages.length; z++) {
									if (generalStructure.packages[z].name == generalStructure[currentChannel].timeRow[j].name) {
										generalStructure.packages.splice(z, 1);
									}
								}
								generalStructure[currentChannel].timeRow[j] = undefined;
								generalTime += 1;
							} else {
								var nextNode = currentChannel.slice(currentChannel.lastIndexOf('N'));

								generalStructure.packages[i].location.type = 'node';
								generalStructure.packages[i].location.name = nextNode;
								generalStructure[nextNode].content = generalStructure.packages[i];
								generalStructure[currentChannel].timeRow[j] = undefined;
							}
						}
					}
				}
			}
		}

		var storageGraph = JSON.parse(sessionStorage.getItem('graph'));
		for (var i = 0; i < Object.keys(storageGraph).length; i++) {
			if (generalStructure['N' + (i + 1)] !== undefined) {
				generalStructure['N' + (i + 1)].graphCopy = storageGraph;
			} else {
				continue;
			}
		}

		generalTime += 1;
	}

	var time = (generalTime * data.messageSize) / 10;
	var result = [
		{	
			name: "Informational data: ",
			value: data.messageSize
		},
		{
			name: "Service data: ",
			value: 208
		},
		{
			name: "Transfer time: ",
			value: time
		},
		{
			name: "Informational packages: ",
			value: packagesNum
		}
	];
	showResult(result, 'Datagram mode')
}

function showResult(result, title) {
	var modalTitle = document.getElementById('simulationModalTitle');
	var list = document.getElementById('simulationResult');

	list.innerHTML = "";
	modalTitle.innerText = title;

	for (var i = 0; i < result.length; i++) {
		list.innerHTML += "<li class='list-group-item'><b>" + result[i].name + "</b> &nbsp;" + result[i].value + "</li>";
	}

	$('#simulationModal').modal('show');
}