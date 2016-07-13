var gameInt;

const tickLength = 50;
const gameTableHeight = 20;
const gameTableWidth = 10;

var spaces = []; // will look like: { location: { x: 0, y: 0 }, filled: false, color: none }

// piece will only move down on some ticks
var tickCount = 0;

// this will decrease as game progresses
var tickLimit = 20;

// defines the minimum
const tickLimitMinimum = 5;

// determines when tick limit decreases
var tickDecrementCount = 0;

// determines how often tick limit decreases
const tickDecrementLimit = 200;

// these must match the css class names
var colors = ["blue", "red", "green", "yellow"];
var types = ["bar", "block", "l", "j", "t", "s", "z" ];

var piece;
var nextPiece;

var gameState = {
	win: false,
	lose: false,
	level: 1
};

$(function(){
    registerEvents();
    initEverything();
});

function initEverything()
{
    buildTable("gameTable", gameTableHeight, gameTableWidth);
    buildTable("nextPieceTable", 6, 6);
	initObjects();	
	initUI();	
}

// logic performed at every game tick
function onTick()
{
    handleTick();

    tickCount++;
    if (tickCount >= tickLimit)
    {
        console.log("ticked");

        // reset
        tickCount = 0;

        // move the piece
        movePiece();

        if (piece.landed)
        {
            createNextPiece();
        }

        // determine if game is over
        updateGameState();

        // clear complete rows
        updateRows();
    }

    updateUI();
}

function handleTick()
{
    tickDecrementCount++;
    if (tickDecrementCount >= tickDecrementLimit)
    {
        tickDecrementCount = 0;
        tickLimit = tickLimit > tickLimitMinimum ? tickLimit-- : tickLimit;
        gameState.level++;
    }
}

function handleCommand(e)
{
    // rotation
    if (e.which == 17 || e.which == 18)
    {

    }

    // movement
    if (e.which == 37)
    {

    }
}

function rotatePiece()
{

}

function initUI()
{
	// setClass(apple, "apple");
}

function setUI(p)
{

}

function updateRows()
{
    // in the future this should pause the game momentarily and produce a blinking row before it disappears
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
	
	$("#level").html(gameState.level);
	
    // clear all css
	$("#gameTable tr td").removeClass();
    
	for (var i = 0; i < spaces.length; i++)
	{
		var space = spaces[i];		
		if (space.filled)
		{
		    setClass(space, space.color);
		}
	}
}

function updateGameState()
{	
	// if piece can't fit on board, lose!
	//if (getMaxHeight())
	//{
	//	gameState.lose = true;
	//}
}

function movePiece()
{
    var locations = [piece.location];
    piece.location.y++;
    for(var i = 0; i < piece.tail.length; i++)
    {
        piece.tail[i].y++;
        locations.push(piece.tail[i]);
    }

    // determine if piece hit piece below it
    if (checkCollision(locations))
    {
        var space = getSpace(piece.location);
        space.filled = true;
        space.color = piece.color;
    }
}

function checkCollision(locations)
{
    for (var i = 0; i < spaces.length; i++)
    {
        for (var j = 0; j < locations.length; j++)
        {
            if (spaces[i].x == locations[j].x && spaces[i].y == (locations[j].y + 1))
            {
                return true;
            }
        }
    }

    return false;
}

function createNextPiece()
{
    piece = $.extend({}, nextPiece);
    piece.location.x = 5;
    piece.location.y = 0;
    createNextPiece();
}

function setClass(obj, cls)
{
	var objCell = $(getCell(obj.location.x, obj.location.y));
	objCell.addClass(cls);	
}

function getCell(x, y, id)
{
    id = id || "gameTable";
    var table = document.getElementById(id);
	var row = table.rows[y];
	return row.cells[x];
}

function buildTable(id, height, width)
{
    $("#" + id + " tbody").empty();
	for(var i = 0; i < height; i++)
	{
	    $("#" + id + " tbody").append("<tr id='" + id + "Row_" + i + "'></tr>");
		for (var j = 0; j < width; j++)
		{
		    $("#" + id + " tr:last").append("<td id='" + id + "Cell_" + i + "_" + j + "'></td>");
		}
	}
}

function initSpaces()
{
    for (var i = 0; i < gameTableHeight; i++)
    {
        for (var j = 0; j < gameTableWidth; j++)
        {
            spaces.push({ location: { x: j, y: i }, filled: false, color: "" });
        }
    }
}

function initObjects()
{
    initSpaces();
    initPiece();
    initNextPiece();
}

function initPiece()
{
    piece = createRandomPiece();
    piece.location.x = 5;
    piece.location.y = 0;
    configureTail(piece);
}

function initNextPiece()
{
    nextPiece = createRandomPiece();
    nextPiece.location.x = 2;
    nextPiece.location.y = 1;
    configureTail(nextPiece);
}

function createRandomPiece()
{
    return {
        // location of the head point
        location: {
            x: 0,
            y: 0
        },
        tail: [], // locations of the rest of the piece
        orientation: Math.floor(Math.random() * 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
        landed: false
    };
}

function configureTail(p)
{
    // pieces in their 0 roatation state

    //  box:
    //    yx
    //    xx

    //  line:
    //    y
    //    x
    //    x
    //    x

    //  s:
    //    yx
    //   xx

    //  z:
    //   xy
    //    xx

    //  t:
    //    y
    //   xxx

    //  l:
    //   xyx
    //   x

    //  j:
    //   xyx
    //     x

    switch (p.type)
    {
        case "box":

            break;
        case "line":

            break;
        case "s":

            break;
        case "z":

            break;
        case "t":

            break;
        case "l":

            break;
        case "j":

            break;
    }
}

function registerEvents()
{
	$("body").keydown(function(e)
	{
	    if ([17, 18, 37, 39, 40].indexOf(e.which) > -1)
	    {

	        handleCommand(e);
	    }
	});
}

function startGame()
{
    var gameInt = setInterval(onTick, tickLength);
}