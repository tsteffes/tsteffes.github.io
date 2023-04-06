var gameInt;
var size = 20;
var tickLength = 100;
var appleCount = 0;

var apple = {
	location: {
		x: 0,
		y: 0
	},
	eaten: false
};

var snake = {
	location: {
		x: 0,
		y: 0
	},
	tail: [], // this is a stack
	direction: -1
};

var moveStack = [];

var gameState = {
	win: false,
	lose: false
};

$(function(){
	registerEvents();
});

function initEverything()
{
	buildTable();
	initObjects();
	initUI();
}

// logic performed at every game tick
function onTick()
{
	// move da snake
	moveSnake();

	// create new apple if it was eaten
	refreshApple();

	// check if apple is eaten
	checkApple();

	// determine if game is over
	updateGameState();

	updateUI();
}

function initUI()
{
	setClass(apple, "apple");
	setClass(snake, "snake");
}

function updateUI()
{
	if (gameState.lose || gameState.win)
	{
		//$("table").remove();
		$("#result").html("<h1>You " + (gameState.lose ? "lose" : "win") + "!</h1><span>Press enter to play again.</span>");
		$("body").keydown(function(e){
			if (e.which == 13)
			{
				$("form").submit();
			}
		});
		window.clearInterval(gameInt);
		return;
	}

	$("#appleCount").html(appleCount);

	// clear all css
	$("td").removeClass("apple");
	$("td").removeClass("snake");
	$("td").removeClass("tail");
	$("td").setClass("empty");

	setClass(apple, "apple");
	setClass(snake, "snake");
	for(var i = 0; i < snake.tail.length; i++)
	{
		setClass(snake.tail[i], "tail");
	}
}

function refreshApple()
{
	if (apple.eaten)
	{
		appleCount++;
		randomizeLocation(apple, snake.tail);
		apple.eaten = false;
	}
}

function checkApple()
{
	if (snake.location.x == apple.location.x &&
		snake.location.y == apple.location.y)
	{
		apple.eaten = true;
	}
}

function updateGameState()
{
	// if head goes outside bounds, game over
	if (snake.location.x >= size ||
		snake.location.x < 0 ||
		snake.location.y >= size ||
		snake.location.y < 0)
	{
		gameState.lose = true;
		return;
	}

	// if head hits tail, game over
	for(var i = 0; i < snake.tail.length; i++)
	{
		if (snake.tail[i].location.x == snake.location.x && snake.tail[i].location.y == snake.location.y)
		{
			gameState.lose = true;
			return;
		}
	}

	// if all spaces are used by snake, win!
	if (snake.tail.length == ((size * size) - 1))
	{
		gameState.win = true;
	}
}

function moveSnake()
{
	// remove last tail if apple was not eaten
	if (snake.direction > -1 && apple.eaten == false)
	{
		snake.tail.splice(0, 1);
	}

	// add head to tail
	snake.tail.push({ location: $.extend({}, snake.location) });

	// find new direction
	var repeat;
	do{
		repeat = false;
		var stackDirection;
		if (moveStack.length > 0)
		{
			stackDirection = moveStack[0];
			moveStack.splice(0, 1);
			if ((stackDirection + 2) % 4 == snake.direction % 4)
			{
				repeat = true;
			}
			else
			{
				snake.direction = stackDirection;
			}
		}
	}while(repeat)

	// move head
	switch(snake.direction){
		case 0:
			snake.location.x -= 1;
			break;
		case 1:
			snake.location.y -= 1;
			break;
		case 2:
			snake.location.x += 1;
			break;
		case 3:
			snake.location.y += 1;
			break;
	}
}

function setClass(obj, cls)
{
	var objCell = $(getCell(obj.location.x, obj.location.y));
	objCell.addClass(cls);
	objCell.removeClass("empty");
}

function getCell(x, y)
{
	var table = document.getElementById("gameTable");
	var row = table.rows[y];
	return row.cells[x];
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
		$("#gameTable tbody").append("<tr id='gameTableRow_" + i + "'></tr>");

		for (var j = 0; j < size; j++)
		{
			$("#gameTable tr:last").append("<td id='gameTableCell_" + i + "_" + j + "'></td>");
		}
	}
}

function initObjects()
{
	// set apple and snake randomly
	randomizeLocation(snake);
	randomizeLocation(apple, snake.location);
}

function updateSettings()
{
	if (moveStack.length > 0)
	{
		$("input[name='difficulty']").first().parent().remove();
		$("input[name='size']").first().parent().remove();
		window.clearInterval(settingsInt);

		// update game interval
		gameInt = setInterval(onTick, tickLength);

		return;
	}

	tickLength = $("input[name='difficulty']:checked").val();
	var newSize = $("input[name='size']:checked").val();

	if (newSize != size)
	{
		size = newSize;
		initEverything();
		updateUI();
	}
}

function registerEvents()
{
	$("body").keydown(function(e)
	{
		switch (e.which)
		{
			case 37: // left
				moveStack.push(0);
				break;
			case 38: // up
				moveStack.push(1);
				break;
			case 39: // right
				moveStack.push(2);
				break;
			case 40: // down
				moveStack.push(3);
				break;
		}
	});
}

var settingsInt = setInterval(updateSettings, 50);