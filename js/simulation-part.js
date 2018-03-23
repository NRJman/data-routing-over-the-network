var mainButtonClicked = false;

$('#simulate').on('click', function () {
	mainButtonClicked = true;
	prepareSimulation();
});

var Graph = (function (undefined) {
	var realCosts;

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
			Object.prototype.hasOwnProperty.call(obj, key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat(a) - parseFloat(b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
			open = { '0': [start] },
			predecessors = {},
			keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if (!(keys = extractKeys(open)).length) break;

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
					return { path: path.concat(shortest), cost: realCosts[nodeForSave] };
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

$('body').bind('dblclick', function (e) {
	if (e.target.classList[0] === 'nodeName' || e.target.classList[0] === 'node') renderModal(e);
});

function renderModal(e) {
	var graph = JSON.parse(sessionStorage.getItem('graph'));
	var graphObj = new Graph(graph);
	var allNodesList = [];
	var doc = document;
	var table = doc.getElementById('table');
	var title = doc.getElementById('modalTitle');
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

	for (i = 0, len = doc.getElementsByClassName('node').length; i < len; i++) {
		allNodesList.push(doc.getElementsByClassName('node')[i].id)
	}

	for (i = 0, len = allNodesList.length; i < len; i++) {
		if (allNodesList[i] !== startNode) {
			shortestPath = graphObj.findShortestPath(startNode, allNodesList[i]);
			title.innerText = 'Selected node: ' + startNode;
			table.innerHTML +=
				"<tr>"
				+ "<td>" + shortestPath.path[shortestPath.path.length - 1] + "</td>"
				+ "<td>" + shortestPath.path[1] + "</td>"
				+ "<td>" + shortestPath.cost + "</td>"
				+ "</tr>";
		}
	}

	$('#nodesModal').modal('show');
}

function prepareSimulation() {
	var startDate = new Date(),
		endDate;
	var doc = document;

	if (mainButtonClicked) {
		var primaryData = {};

		primaryData.nodeFrom = doc.getElementById('start').value;
		primaryData.nodeTo = doc.getElementById('finish').value;
		primaryData.logical = doc.getElementById('logicalCheckbox').checked;
		primaryData.datagram = doc.getElementById('datagramCheckbox').checked;
		primaryData.messageSize = doc.getElementById('messageSize').value;
		primaryData.datafieldSize = doc.getElementById('fieldSize').value;

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
		if (isNaN(primaryData.nodeFrom) && primaryData.nodeFrom[0].toLowerCase() !== 'n' || primaryData.nodeFrom[0].toLowerCase() == 'n' && isNaN(primaryData.nodeFrom.slice(1))) {
			alert('Incorrect node name.');
			return;
		} else {
			if (primaryData.nodeFrom[0] === 'n') {
				primaryData.nodeFrom = primaryData.nodeFrom.replace('n', 'N');
			} else if (!isNaN(primaryData.nodeFrom)) {
				primaryData.nodeFrom = 'N' + primaryData.nodeFrom;
			}
		}
		if (isNaN(primaryData.nodeTo) && primaryData.nodeTo[0].toLowerCase() !== 'n' || primaryData.nodeTo[0].toLowerCase() == 'n' && isNaN(primaryData.nodeTo.slice(1))) {
			alert('Incorrect node name.');
			return;
		} else {
			if (primaryData.nodeTo[0] === 'n') {
				primaryData.nodeTo = primaryData.nodeTo.replace('n', 'N');
			} else if (!isNaN(primaryData.nodeTo)) {
				primaryData.nodeTo = 'N' + primaryData.nodeTo;
			}
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
	
	endDate = new Date();

	console.log((endDate - startDate) / 1000);
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
	var doc = document;
	var linkId;

	$('.highlighted').removeClass('highlighted');

	for (var i = 0, len = shortest.length - 1; i < len; i++) {
		linkId = 'from' + shortest[i] + 'to' + shortest[i + 1];
		if (doc.getElementById(linkId) === null) {
			linkId = 'from' + shortest[i + 1] + 'to' + shortest[i];
			doc.getElementById(linkId).classList.add('highlighted');
		} else {
			doc.getElementById(linkId).classList.add('highlighted');
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
			if (data.messageSize % data.datafieldSize === 0) {
				packages['package' + (i + 1)].size = data.datafieldSize;
			} else {
				packages['package' + (i + 1)].size = data.messageSize % data.datafieldSize;
			}
		}

		packages['package' + (i + 1)].location = {
			name: "",
			type: ""
		}
		packages['package' + (i + 1)].ownWayTime = 0;
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
	for (var i = 1, len = generalStructure.packages.length; i < len; i++) {
		generalStructure.startingArray.push(generalStructure.packages[i]);
	}
}

function generateGeneralStructure(data) {
	var channelName;
	var shortestPathToTarget;

	for (var prop in graph) {
		//Generate nodes objects
		generalStructure[prop] = {
			name: prop,
			type: 'node',
			content: '',
			graphCopy: graph,
			shortestPathToTarget: function () {
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

	generalStructure.packages[0].ownWayTime = 3;
	//Put the first package to the start node
	generalStructure.packages[0].location.type = 'node';
	generalStructure.packages[0].location.name = data.nodeFrom;
	generalStructure[data.nodeFrom].content = generalStructure.packages[0];

	generalStructure.sentPackages = [];

	console.log(generalStructure);
	console.log(graph);
	var graphObj = new Graph(graph);
	console.log(graphObj.findShortestPath(data.nodeFrom, data.nodeTo));
}

function logicalSimulate(data, packagesNum) {
	var graphObj = new Graph(graph);
	var shortest = graphObj.findShortestPath(data.nodeFrom, data.nodeTo);
	var time;
	var result;

	if (data.messageSize % data.datafieldSize !== 0 && data.messageSize > data.datafieldSize) {
		var lastPackageSize = 0, lastPackageTime = 0, restPackagesSize = 0, restPackagesTime = 0;

		lastPackageSize = data.messageSize % data.datafieldSize;
		lastPackageTime = (lastPackageSize / 10) * shortest.cost + (26 / 10) * shortest.cost * 2;
		restPackagesSize = data.messageSize - lastPackageSize;
		restPackagesTime = (data.datafieldSize/*розмір одного, а не всіх*/ / 10) * shortest.cost * (packagesNum - 1)/*множу на необхідну кількість*/ + (26 / 10) * shortest.cost * (packagesNum - 1) * 2;
		time = lastPackageTime + restPackagesTime;
		time += ((26 / 10) * shortest.cost) * 4;
	} else {
		time = ((data.datafieldSize / 10) * shortest.cost * packagesNum) + ((26 / 10) * shortest.cost) * packagesNum * 2;
		time += ((26 / 10) * shortest.cost) * 4;
	}

	result = [
		{
			name: "Informational data (bytes): ",
			value: data.messageSize
		},
		{
			name: "Service data (bytes): ",
			value: (2 * packagesNum + 4) * 26
		},
		{
			name: "Transfer time (ms): ",
			value: Math.round(time * 100) / 100
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
	var generalTime = -1,
		packagesLength = generalStructure.packages.length;

	//Location types: start, node, channel

	while (packagesLength > 0) {
		for (var i = 0; i < packagesLength; i++) {
			if (generalStructure.packages[i].location.type === 'start') {
				//Check if first node is free
				if (generalStructure[data.nodeFrom].content === "") {
					//Move package to the first node
					generalStructure[data.nodeFrom].content = generalStructure.packages[i];
					//Find this package in a startingArray and remove it from there
					for (var j = 0, startArrLen = generalStructure.startingArray.length; j < startArrLen; j++) {
						if (generalStructure.startingArray[j].name === generalStructure.packages[i].name) {
							generalStructure.startingArray.splice(j, 1);
							startArrLen = generalStructure.startingArray.length;
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
					for (var j = 0, shortestPathLenth = shortest.path.length; j < shortestPathLenth; j++) {
						var nodeToChangeGraph = shortest.path[j];
						if (j !== shortestPathLenth - 1) {
							var currentChannel = generalStructure[shortest.path[j] + shortest.path[j + 1]];
							var timeToAdd = 0;

							//Loop the channel:
							for (var k = 0, timeRowLength = currentChannel.timeRow.length; k < timeRowLength; k++) {
								if (currentChannel.timeRow[k] !== undefined && currentChannel.timeRow[k] !== undefined) {
									//Time of met package in channel to finish moving in this channel
									timeToAdd = timeRowLength - k;

									if (numOfGraphsAheadOfCurrent !== 0) {
										timeToAdd += timeRowLength * numOfGraphsAheadOfCurrent;
									}

									numOfGraphsAheadOfCurrent += 1;
								}
							}
							//Update channel weight in a shortest path (given the fact that there can be packages)
							generalStructure[nodeToChangeGraph]["graphCopy"][shortest.path[j]][shortest.path[j + 1]] += timeToAdd;
						}
					}
					//Recheck the shortest path (given the fact that we updated channels weights)
					if (JSON.stringify(shortest) === JSON.stringify(generalStructure[node].shortestPathToTarget())) {
						break;
					} else {
						shortest = generalStructure[node].shortestPathToTarget();
					};
				}

				var nameOfNextStepInPath = node + shortest.path[1];
				var nextStepInPath = generalStructure[nameOfNextStepInPath];
				var isChannelFree = true;

				for (var p = 0, timeRowLength = generalStructure[nameOfNextStepInPath].timeRow.length; p < timeRowLength; p++) {
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

				for (var j = 0, timeRowLength = generalStructure[currentChannel].timeRow.length; j < timeRowLength; j++) {
					if (generalStructure[currentChannel].timeRow[j] !== undefined && generalStructure[currentChannel].timeRow[j] !== "") {
						if (j !== timeRowLength - 1) {
							generalStructure[currentChannel].timeRow[j + 1] = generalStructure[currentChannel].timeRow[j];
							generalStructure[currentChannel].timeRow[j] = undefined;
							j += 1;
						} else {
							if (currentChannel.slice(currentChannel.lastIndexOf('N')) === data.nodeTo) {
								for (var z = 0; z < packagesLength; z++) {
									if (generalStructure.packages[z].name == generalStructure[currentChannel].timeRow[j].name) {
										generalTime += 1;
										if (generalStructure.packages[z].name === 'package1') {
											generalStructure.packages[z].ownWayTime = generalTime + 1;
										} else {
											generalStructure.packages[z].ownWayTime = generalTime;
										}
										generalStructure.sentPackages.push(generalStructure.packages[z]);
										generalStructure.packages.splice(z, 1);
										i -= 1;
									}

									packagesLength = generalStructure.packages.length;
								}
								generalStructure[currentChannel].timeRow[j] = undefined;
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
		for (var i = 0, storageGraphLength = Object.keys(storageGraph).length; i < storageGraphLength; i++) {
			if (generalStructure['N' + (i + 1)] !== undefined) {
				generalStructure['N' + (i + 1)].graphCopy = storageGraph;
			} else {
				continue;
			}
		}

		generalTime += 1;
	}

	var sentPackagesLength = generalStructure.sentPackages.length;

	for (var i = 1; i < sentPackagesLength; i++) {
		generalStructure.sentPackages[i].ownWayTime += 1;
	}

	var time;

	if (data.messageSize % data.datafieldSize !== 0 && data.messageSize > data.datafieldSize) {
		var lastPackageTime = generalTime - generalStructure.sentPackages[sentPackagesLength - 2].ownWayTime;
		var packagesWithoutLastTime = generalTime - lastPackageTime;
		var packagesWithoutLastSize = data.datafieldSize * (sentPackagesLength - 1);
		var lastPackageSize = generalStructure.sentPackages[sentPackagesLength - 1].size;
		time = ((data.datafieldSize/*розмір одного пакету*/ / 10) * packagesWithoutLastTime) + ((lastPackageSize / 10) * lastPackageTime);
	} else {
		time = (data.datafieldSize / 10) * generalTime;
	}

	var result = [
		{
			name: "Informational data (bytes): ",
			value: data.messageSize
		},
		{
			name: "Service data (bytes): ",
			value: packagesNum * 26
		},
		{
			name: "Transfer time (ms): ",
			value: (Math.round(time * 100) / 100)
		},
		{
			name: "Informational packages: ",
			value: packagesNum
		}
	];
	showResult(result, 'Datagram mode')
}

function showResult(result, title) {
	var doc = document;
	var modalTitle = doc.getElementById('simulationModalTitle');
	var list = doc.getElementById('simulationResult');

	list.innerHTML = "";
	modalTitle.innerText = title;

	for (var i = 0, resultLength = result.length; i < resultLength; i++) {
		list.innerHTML += "<li class='list-group-item'><b>" + result[i].name + "</b> &nbsp;" + result[i].value + "</li>";
	}

	$('#simulationModal').modal('show');
}