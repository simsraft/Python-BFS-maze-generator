// Constants
const CELL_SIZE = 20;
const WALL_COLOR = "black";
const PATH_COLOR = "white";
const VISITED_COLOR = "lightgreen";
const FRONTIER_COLOR = "lightblue";
const SOLUTION_COLOR = "red";
const START_COLOR = "green";
const END_COLOR = "purple";
const ANIMATION_SPEEDS = [0, 100, 50, 10, 1];  // Milliseconds for timeouts

// Global variables
let canvas, ctx;
let maze = [];
let rows = 21;  // Must be odd
let cols = 31;  // Must be odd
let startPos = [1, 1];
let endPos = [rows-2, cols-2];
let animationSpeedIdx = 2;  // Default medium speed

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas and context
    canvas = document.getElementById('mazeCanvas');
    ctx = canvas.getContext('2d');
    
    // Set up event listeners
    document.getElementById('generateButton').addEventListener('click', handleGenerate);
    document.getElementById('solveButton').addEventListener('click', handleSolve);
    document.getElementById('speedButton').addEventListener('click', toggleAnimationSpeed);
    
    // Initialize the maze
    setupMaze();
    drawMaze();
    updateStatus();
});

function setupMaze() {
    // Initialize the maze grid with all walls
    maze = Array(rows).fill().map(() => Array(cols).fill('#'));
}

function drawCell(x, y, color) {
    // Calculate the position on the canvas
    const canvasX = y * CELL_SIZE;
    const canvasY = x * CELL_SIZE;
    
    // Draw the rectangle
    ctx.fillStyle = color;
    ctx.fillRect(canvasX, canvasY, CELL_SIZE, CELL_SIZE);
}

function drawMaze() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each cell according to its state
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = maze[i][j];
            if (cell === '#') {
                drawCell(i, j, WALL_COLOR);
            } else if (cell === 'S') {
                drawCell(i, j, START_COLOR);
            } else if (cell === 'E') {
                drawCell(i, j, END_COLOR);
            } else if (cell === 'P') {
                drawCell(i, j, PATH_COLOR);
            } else if (cell === 'V') {
                drawCell(i, j, VISITED_COLOR);
            } else if (cell === 'F') {
                drawCell(i, j, FRONTIER_COLOR);
            } else if (cell === '.') {
                drawCell(i, j, SOLUTION_COLOR);
            } else {
                drawCell(i, j, PATH_COLOR);
            }
        }
    }
}

// This section was removed since we no longer use the old animation queue system

function generateMazePrims() {
    // Disable buttons during generation
    toggleButtons(false);
    
    // Initialize the maze
    setupMaze();
    
    // Start with a grid full of walls
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            maze[i][j] = '#';
        }
    }
    
    // Define a starting point
    const startI = 1, startJ = 1;
    maze[startI][startJ] = 'P';  // Mark as path
    
    // Add frontier cells
    let frontier = [];
    
    // Check in all four directions
    if (startI >= 2 && maze[startI-2][startJ] === '#') {
        frontier.push([startI-2, startJ]);
        maze[startI-2][startJ] = 'F';  // Mark as frontier
    }
    if (startI < rows-2 && maze[startI+2][startJ] === '#') {
        frontier.push([startI+2, startJ]);
        maze[startI+2][startJ] = 'F';  // Mark as frontier
    }
    if (startJ >= 2 && maze[startI][startJ-2] === '#') {
        frontier.push([startI, startJ-2]);
        maze[startI][startJ-2] = 'F';  // Mark as frontier
    }
    if (startJ < cols-2 && maze[startI][startJ+2] === '#') {
        frontier.push([startI, startJ+2]);
        maze[startI][startJ+2] = 'F';  // Mark as frontier
    }
    
    // Step-by-step generation
    function generateStep() {
        if (frontier.length === 0) {
            // Finished generating, mark start and end
            maze[startPos[0]][startPos[1]] = 'S';
            maze[endPos[0]][endPos[1]] = 'E';
            drawMaze();
            toggleButtons(true);
            return;
        }
        
        // Pick a random frontier cell
        const idx = Math.floor(Math.random() * frontier.length);
        const pos = frontier[idx];
        frontier.splice(idx, 1);
        const [i, j] = pos;
        
        // Find neighbors that are paths
        const neighbors = [];
        if (i >= 2 && maze[i-2][j] === 'P') {
            neighbors.push([i-2, j]);
        }
        if (i < rows-2 && maze[i+2][j] === 'P') {
            neighbors.push([i+2, j]);
        }
        if (j >= 2 && maze[i][j-2] === 'P') {
            neighbors.push([i, j-2]);
        }
        if (j < cols-2 && maze[i][j+2] === 'P') {
            neighbors.push([i, j+2]);
        }
        
        if (neighbors.length > 0) {
            // Connect this frontier to a random path neighbor
            const [ni, nj] = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Carve a path
            maze[i][j] = 'P';
            maze[i + Math.floor((ni - i) / 2)][j + Math.floor((nj - j) / 2)] = 'P';
            
            // Add new frontier cells
            if (i >= 2 && maze[i-2][j] === '#') {
                if (!frontier.some(cell => cell[0] === i-2 && cell[1] === j)) {
                    frontier.push([i-2, j]);
                    maze[i-2][j] = 'F';  // Mark as frontier
                }
            }
            if (i < rows-2 && maze[i+2][j] === '#') {
                if (!frontier.some(cell => cell[0] === i+2 && cell[1] === j)) {
                    frontier.push([i+2, j]);
                    maze[i+2][j] = 'F';  // Mark as frontier
                }
            }
            if (j >= 2 && maze[i][j-2] === '#') {
                if (!frontier.some(cell => cell[0] === i && cell[1] === j-2)) {
                    frontier.push([i, j-2]);
                    maze[i][j-2] = 'F';  // Mark as frontier
                }
            }
            if (j < cols-2 && maze[i][j+2] === '#') {
                if (!frontier.some(cell => cell[0] === i && cell[1] === j+2)) {
                    frontier.push([i, j+2]);
                    maze[i][j+2] = 'F';  // Mark as frontier
                }
            }
        }
        
        // Draw the current state
        drawMaze();
        
        // Continue with next step
        if (ANIMATION_SPEEDS[animationSpeedIdx] > 0) {
            setTimeout(generateStep, ANIMATION_SPEEDS[animationSpeedIdx]);
        } else {
            // For instant speed, use requestAnimationFrame for smoother execution
            requestAnimationFrame(generateStep);
        }
    }
    
    // Start the generation process
    generateStep();
}

function toggleButtons(enabled) {
    document.getElementById('generateButton').disabled = !enabled;
    document.getElementById('solveButton').disabled = !enabled;
    document.getElementById('speedButton').disabled = !enabled;
}

function solveMazeBFS() {
    if (!isPathFromMazeGenerated()) {
        alert("Please generate a maze first!");
        return;
    }
    
    // Disable buttons during solving
    toggleButtons(false);
    
    // Reset any previous solution or visited states
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (maze[i][j] !== '#' && maze[i][j] !== 'S' && maze[i][j] !== 'E') {
                maze[i][j] = 'P';
            }
        }
    }
    drawMaze();
    
    // BFS setup
    const queue = [[startPos[0], startPos[1]]];
    const visited = new Map();
    visited.set(`${startPos[0]},${startPos[1]}`, null);  // Maps positions to their predecessors
    
    function solveStep() {
        if (queue.length === 0) {
            // No solution found
            toggleButtons(true);
            return;
        }
        
        const [i, j] = queue.shift();
        
        if (i === endPos[0] && j === endPos[1]) {
            // Found the end, reconstruct path
            const path = [];
            let pos = [endPos[0], endPos[1]];
            
            while (pos[0] !== startPos[0] || pos[1] !== startPos[1]) {
                path.push(pos);
                pos = visited.get(`${pos[0]},${pos[1]}`);
            }
            
            path.reverse();
            
            // Animate the path
            let pathIdx = 0;
            
            function animatePath() {
                if (pathIdx >= path.length) {
                    toggleButtons(true);
                    return;
                }
                
                const [pi, pj] = path[pathIdx];
                maze[pi][pj] = '.';
                drawCell(pi, pj, SOLUTION_COLOR);
                pathIdx++;
                
                if (ANIMATION_SPEEDS[animationSpeedIdx] > 0) {
                    setTimeout(animatePath, ANIMATION_SPEEDS[animationSpeedIdx]);
                } else {
                    requestAnimationFrame(animatePath);
                }
            }
            
            animatePath();
            return;
        }
        
        // Mark cell as visited for visualization
        if (i !== startPos[0] || j !== startPos[1]) {
            maze[i][j] = 'V';
            drawCell(i, j, VISITED_COLOR);
        }
        
        // Check all four adjacent cells
        const directions = [
            [i-1, j], [i+1, j], [i, j-1], [i, j+1]
        ];
        
        for (const [ni, nj] of directions) {
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && 
                maze[ni][nj] !== '#' && !visited.has(`${ni},${nj}`)) {
                queue.push([ni, nj]);
                visited.set(`${ni},${nj}`, [i, j]);
                
                // Mark cell as frontier for visualization
                if (ni !== endPos[0] || nj !== endPos[1]) {
                    maze[ni][nj] = 'F';
                    drawCell(ni, nj, FRONTIER_COLOR);
                }
            }
        }
        
        // Continue with next step
        if (ANIMATION_SPEEDS[animationSpeedIdx] > 0) {
            setTimeout(solveStep, ANIMATION_SPEEDS[animationSpeedIdx]);
        } else {
            requestAnimationFrame(solveStep);
        }
    }
    
    // Start the solving process
    solveStep();
}

function isPathFromMazeGenerated() {
    // Check if there is a path from start to end (at least some non-wall cells)
    let pathCells = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (maze[i][j] !== '#') {
                pathCells++;
            }
        }
    }
    return pathCells > 2;  // More than just start and end
}

function toggleAnimationSpeed() {
    animationSpeedIdx = (animationSpeedIdx + 1) % ANIMATION_SPEEDS.length;
    updateStatus();
}

function updateStatus() {
    const speedNames = ["Instant", "Slow", "Medium", "Fast", "Very Fast"];
    document.getElementById('statusText').textContent = `Animation Speed: ${speedNames[animationSpeedIdx]}`;
}

function handleGenerate() {
    generateMazePrims();
}

function handleSolve() {
    solveMazeBFS();
}
