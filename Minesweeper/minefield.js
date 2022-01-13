var size;
var density;
var spacesRemaining = 0;
var gameStart = false;
var spaces = [];

var gameState = {
	win: false,
	lose: false
};

function onClick(ev)
{
	if (gameState.lose || gameState.win || (event.which != 1 && event.which != 3))
	{
		return;
	}

	// get location that was clicked
	var id = ev.target.id;
	var loc = { x: parseInt(id.split('_')[1]), y: parseInt(id.split('_')[2]) };
	var space = getSpace(loc);

	if (event.which == 3)
	{
		handleFlagClick(space);
	}
	else
	{
		handleStandardClick(space);
	}

	updateGameState();
	updateUI();
}

function updateGameState()
{
	var uncleared = false;

	for (var i = 0; i < spaces.length; i++)
	{
		if (!spaces[i].cleared && !spaces[i].mine)
		{
			uncleared = true;
		}
	}

	if (!uncleared)
	{
		gameState.win = true;
	}
}

function initEverything()
{
	buildTable();
	initObjects();
	registerEvents();
}

function getSpace(loc)
{
	for (var i = 0; i < spaces.length; i++)
	{
		if (spaces[i].location.x == loc.x && spaces[i].location.y == loc.y)
		{
			return spaces[i];
		}
	}
}

function handleFlagClick(space)
{
	if (space.cleared)
	{
		return;
	}

	space.flagged = !space.flagged;
}

function handleStandardClick(space)
{
	// ignore click
	if (space.cleared)
	{
		return;
	}

    // ignore click
	if (space.flagged)
	{
	    return;
	}

	// end game
	if (space.mine)
	{
		space.cleared = true;
		gameState.lose = true;
		return;
	}

	if (space.number > 0)
	{
		space.cleared = true;
		return;
	}

	// else it is an empty space
	sweep(space);
}

function sweep(space)
{
	if (space.cleared || space.mine)
	{
		return;
	}

	space.cleared = true;

	if (space.number == 0)
	{
		for (var i = space.location.y - 1; i <= space.location.y + 1; i++)
		{
			for (var j = space.location.x - 1; j <= space.location.x + 1; j++)
			{
				if (i < 0 || i >= size || j < 0 || j >= size || (i == space.location.y && j == space.location.x))
				{
					continue;
				}

				var nextSpace = getSpace({ x: j, y: i });
				sweep(nextSpace);
			}
		}
	}
}

function updateUI()
{
	$("#spacesRemaining").html(spacesRemaining);

	// clear all css
	$("td").removeClass("mine");
	$("td").removeClass("flag");
	$("td").removeClass("empty");
	$("td").removeClass("default");

	for (var i = 0; i < spaces.length; i++)
	{
		var space = spaces[i];

		if (space.cleared)
		{
			if (space.mine)
			{
				setClass(space, "mine");
			}
			else if (space.number > 0)
			{
				setClass(space, "default");
				setText(space, space.number);
			}
			else
			{
				setClass(space, "empty");
			}
		}

		if (space.flagged)
		{
			setClass(space, "flag");
		}
	}

	if (gameState.lose || gameState.win)
	{
		$("#result").html("<h1>You " + (gameState.lose ? "lose" : "win") + "!</h1><h1>🏆</h1><span>Press enter to play again.</span>");
		$("body").keydown(function(e){
			if (e.which == 13)
			{
				$("form").submit();
			}
		});
		return;
	}
}

function setClass(space, cls)
{
	var cell = $(getCell(space.location.x, space.location.y));
	cell.addClass(cls);
}

function setText(space, text)
{
	var cell = $(getCell(space.location.x, space.location.y));
	cell.html(text);
}

function getCell(x, y)
{
	var table = document.getElementById("gameTable");
	var row = table.rows[y];
	return row.cells[x];
}

function getBorderingMineCount(space)
{
	var tot = 0;
	for (var i = space.location.y - 1; i <= space.location.y + 1; i++)
	{
		for (var j = space.location.x - 1; j <= space.location.x + 1; j++)
		{
			if (i < 0 || i >= size || j < 0 || j >= size)
			{
				continue;
			}

			tot += getSpace({ x: j, y: i }).mine ? 1 : 0;
		}
	}

	return tot;
}

function randomizeLocation(obj, excluded)
{
	var loc;
	var repeat;

	do{
		repeat = false;
		loc = getRandomLocation(size);
		if (excluded && excluded.length)
		{
			for (var i = 0; i < excluded.length; i++)
			{
				if (excluded[i].location.x == loc.x && excluded[i].location.y == loc.y)
				{
					repeat = true;
					break;
				}
			}
		}
	}while (repeat);

	obj.location = $.extend({}, loc);
}

function getRandomLocation(max)
{
	return {
		x: Math.floor(Math.random() * max),
		y: Math.floor(Math.random() * max)
	};
}

function buildTable()
{
	$("#gameTable tbody").empty();

	// build the table
	for(var i = 0; i < size; i++)
	{
		$("#gameTable tbody").append("<tr></tr>");

		for (var j = 0; j < size; j++)
		{
			$("#gameTable tr:last").append("<td id='gameTableCell_" + j + "_" + i + "'></td>");
		}
	}
}

function initObjects()
{
	initSpaces();
	initMines();
	initNumbers();
}

function initSpaces()
{
	for(var i = 0; i < size; i++)
	{
		for (var j = 0; j < size; j++)
		{
			spaces.push({ location: { x: j, y: i }, mine: false, flag: false, number: 0, cleared: false });
		}
	}
}

function initNumbers()
{
	for(var i = 0; i < spaces.length; i++)
	{
		if (spaces[i].mine == false)
		{
			spaces[i].number = getBorderingMineCount(spaces[i]);
		}
	}
}

function initMines()
{
	var mineCount = Math.floor(.01 * density * size * size);
	var mines = [];
	for (var i = 0; i < mineCount; i++)
	{
		var mine = {};
		randomizeLocation(mine, mines);
		mines.push(mine);
		var space = getSpace(mine.location);
		space.mine = true;
	}
}

function updateSettings()
{
	var newDensity = $("input[name='density']:checked").val();
	var newSize = $("input[name='size']:checked").val();
	if (newSize != size || density != newDensity)
	{
		density = newDensity;
		size = newSize;
		initEverything();
		updateUI();
	}
}

function registerEvents()
{
	$("#gameTable tr td").mousedown(function(e)
	{
		if (!gameStart)
		{
			gameStart = true;

			$("input[name='density']").first().parent().remove();
			$("input[name='size']").first().parent().remove();
			window.clearInterval(settingsInt);
		}

		onClick(e);
	});

	$("body").contextmenu(function(e)
	{
		return false;
	});
}

var settingsInt = setInterval(updateSettings, 50);