const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cols = 20;
const rows = 20;
const cellSize = 30;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = [];
let openSet = [];
let closedSet = [];
let start;
let end;
let path = [];

function setupMaze() {
    // Initialize the grid with nodes
    grid = [];
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Node(i, j);
        }
    }

    // Set random walls
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (Math.random() < 0.3) grid[i][j].isWall = true; // 30% chance of wall
        }
    }

    // Define start and end nodes
    start = grid[0][0];
    end = grid[cols - 1][rows - 1];
    start.isWall = end.isWall = false;

    openSet = [start];
    closedSet = [];
    path = [];
    drawMaze();
}

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.isWall = false;
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.previous = undefined;
    this.neighbors = [];

    this.addNeighbors = function(grid) {
        if (x < cols - 1) this.neighbors.push(grid[x + 1][y]);
        if (x > 0) this.neighbors.push(grid[x - 1][y]);
        if (y < rows - 1) this.neighbors.push(grid[x][y + 1]);
        if (y > 0) this.neighbors.push(grid[x][y - 1]);
    };

    this.draw = function(color) {
        ctx.fillStyle = this.isWall ? '#000' : color;
        ctx.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    };
}

function solveMaze() {
    while (openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) winner = i;
        }
        let current = openSet[winner];

        if (current === end) {
            // Find the path by backtracking
            path = [];
            let temp = current;
            while (temp.previous) {
                path.push(temp);
                temp = temp.previous;
            }
            path.push(start);
            drawMaze();
            return; // Path found
        }

        openSet = openSet.filter((node) => node !== current);
        closedSet.push(current);

        const neighbors = current.neighbors;
        for (const neighbor of neighbors) {
            if (!closedSet.includes(neighbor) && !neighbor.isWall) {
                let tempG = current.g + 1;

                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) neighbor.g = tempG;
                } else {
                    neighbor.g = tempG;
                    openSet.push(neighbor);
                }

                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
            }
        }
    }
    alert("No solution found");
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].draw('#FFF');
        }
    }
    for (const node of closedSet) node.draw('#CFC');
    for (const node of openSet) node.draw('#FCE');
    for (const node of path) node.draw('#6C6');
    start.draw('#6C6');
    end.draw('#C66');
}

// Initialize neighbors for each node
function initializeNeighbors() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }
}

// Start the initial maze setup
setupMaze();
initializeNeighbors();