import turtle
import random
import time
from collections import deque

# Constants
CELL_SIZE = 20
WALL_COLOR = "black"
PATH_COLOR = "white"
VISITED_COLOR = "lightgreen"
FRONTIER_COLOR = "lightblue"
SOLUTION_COLOR = "red"
START_COLOR = "green"
END_COLOR = "purple"
ANIMATION_SPEEDS = [0, 0.1, 0.05, 0.01, 0]  # Speeds: 0=instant

# Setup screen and turtle
screen = turtle.Screen()
screen.title("Maze Generator and Solver")
screen.setup(800, 600)
screen.tracer(0)  # Turn off automatic animation
screen.bgcolor("white")

# Create maze drawer turtle
drawer = turtle.Turtle()
drawer.hideturtle()
drawer.penup()
drawer.speed(0)

# Text display turtle
text_writer = turtle.Turtle()
text_writer.hideturtle()
text_writer.penup()
text_writer.goto(-380, 260)
text_writer.color("black")

# Global variables
maze = []
rows = 21  # Must be odd
cols = 31  # Must be odd
start_pos = (1, 1)
end_pos = (rows-2, cols-2)
animation_speed_idx = 2  # Default medium speed

def setup_maze():
    """Initialize the maze grid with all walls."""
    global maze
    maze = [["#" for _ in range(cols)] for _ in range(rows)]

def draw_cell(x, y, color):
    """Draw a single cell at the given grid coordinates."""
    drawer.penup()
    drawer.goto(
        -cols*CELL_SIZE//2 + y*CELL_SIZE,
        rows*CELL_SIZE//2 - x*CELL_SIZE
    )
    drawer.pendown()
    drawer.fillcolor(color)
    drawer.begin_fill()
    for _ in range(4):
        drawer.forward(CELL_SIZE)
        drawer.right(90)
    drawer.end_fill()
    screen.update()
    
    # Add delay based on current animation speed
    if ANIMATION_SPEEDS[animation_speed_idx] > 0:
        time.sleep(ANIMATION_SPEEDS[animation_speed_idx])

def draw_maze():
    """Draw the entire maze."""
    drawer.clear()
    for i in range(rows):
        for j in range(cols):
            if maze[i][j] == "#":
                draw_cell(i, j, WALL_COLOR)
            elif maze[i][j] == "S":
                draw_cell(i, j, START_COLOR)
            elif maze[i][j] == "E":
                draw_cell(i, j, END_COLOR)
            elif maze[i][j] == "P":
                draw_cell(i, j, PATH_COLOR)
            elif maze[i][j] == "V":
                draw_cell(i, j, VISITED_COLOR)
            elif maze[i][j] == "F":
                draw_cell(i, j, FRONTIER_COLOR)
            elif maze[i][j] == ".":
                draw_cell(i, j, SOLUTION_COLOR)
            else:
                draw_cell(i, j, PATH_COLOR)
    screen.update()

def generate_maze_prims():
    """Generate a maze using Prim's algorithm."""
    setup_maze()
    
    # Start with a grid full of walls
    for i in range(rows):
        for j in range(cols):
            maze[i][j] = "#"
    
    # Define a starting point
    start_i, start_j = 1, 1
    maze[start_i][start_j] = "P"  # Mark as path
    
    # Add frontier cells
    frontier = []
    add_frontier_cells(start_i, start_j, frontier)
    
    while frontier:
        # Pick a random frontier cell
        pos = random.choice(frontier)
        frontier.remove(pos)
        i, j = pos
        
        # Find neighbors that are paths
        neighbors = []
        if i >= 2 and maze[i-2][j] == "P":
            neighbors.append((i-2, j))
        if i < rows-2 and maze[i+2][j] == "P":
            neighbors.append((i+2, j))
        if j >= 2 and maze[i][j-2] == "P":
            neighbors.append((i, j-2))
        if j < cols-2 and maze[i][j+2] == "P":
            neighbors.append((i, j+2))
        
        if neighbors:
            # Connect this frontier to a random path neighbor
            ni, nj = random.choice(neighbors)
            # Carve a path
            maze[i][j] = "P"
            maze[i + (ni - i) // 2][j + (nj - j) // 2] = "P"
            
            # Mark cell as visited for visualization
            draw_cell(i, j, VISITED_COLOR)
            draw_cell(i + (ni - i) // 2, j + (nj - j) // 2, VISITED_COLOR)
            
            # Add new frontier cells
            add_frontier_cells(i, j, frontier)
    
    # Mark start and end positions
    maze[start_pos[0]][start_pos[1]] = "S"
    maze[end_pos[0]][end_pos[1]] = "E"
    
    draw_maze()

def add_frontier_cells(i, j, frontier):
    """Add frontier cells around the given position."""
    # Check in all four directions
    if i >= 2 and maze[i-2][j] == "#":
        if (i-2, j) not in frontier:
            frontier.append((i-2, j))
            maze[i-2][j] = "F"  # Mark as frontier for visualization
            draw_cell(i-2, j, FRONTIER_COLOR)
    
    if i < rows-2 and maze[i+2][j] == "#":
        if (i+2, j) not in frontier:
            frontier.append((i+2, j))
            maze[i+2][j] = "F"
            draw_cell(i+2, j, FRONTIER_COLOR)
    
    if j >= 2 and maze[i][j-2] == "#":
        if (i, j-2) not in frontier:
            frontier.append((i, j-2))
            maze[i][j-2] = "F"
            draw_cell(i, j-2, FRONTIER_COLOR)
    
    if j < cols-2 and maze[i][j+2] == "#":
        if (i, j+2) not in frontier:
            frontier.append((i, j+2))
            maze[i][j+2] = "F"
            draw_cell(i, j+2, FRONTIER_COLOR)

def solve_maze_bfs():
    """Solve the maze using BFS algorithm."""
    # Reset any previous solution or visited states
    for i in range(rows):
        for j in range(cols):
            if maze[i][j] not in ["#", "S", "E"]:
                maze[i][j] = "P"
    
    draw_maze()
    
    queue = deque([(start_pos[0], start_pos[1])])
    visited = {(start_pos[0], start_pos[1]): None}  # Maps positions to their predecessors
    
    while queue:
        i, j = queue.popleft()
        
        if (i, j) == end_pos:
            break
        
        # Mark cell as visited for visualization
        if (i, j) != start_pos:
            maze[i][j] = "V"
            draw_cell(i, j, VISITED_COLOR)
        
        # Check all four adjacent cells
        for ni, nj in [(i-1, j), (i+1, j), (i, j-1), (i, j+1)]:
            if 0 <= ni < rows and 0 <= nj < cols and maze[ni][nj] != "#" and (ni, nj) not in visited:
                queue.append((ni, nj))
                visited[(ni, nj)] = (i, j)
                
                # Mark cell as frontier for visualization
                if (ni, nj) != end_pos:
                    maze[ni][nj] = "F"
                    draw_cell(ni, nj, FRONTIER_COLOR)
    
    # Reconstruct and display the path
    if end_pos in visited:
        path = []
        pos = end_pos
        while pos != start_pos:
            path.append(pos)
            pos = visited[pos]
        
        path.reverse()
        
        for i, j in path:
            maze[i][j] = "."
            draw_cell(i, j, SOLUTION_COLOR)
            screen.update()
            
            if ANIMATION_SPEEDS[animation_speed_idx] > 0:
                time.sleep(ANIMATION_SPEEDS[animation_speed_idx])
        
        return True
    return False

def toggle_animation_speed():
    """Toggle through animation speed settings."""
    global animation_speed_idx
    animation_speed_idx = (animation_speed_idx + 1) % len(ANIMATION_SPEEDS)
    update_status()

def update_status():
    """Update the status text."""
    speed_names = ["Instant", "Slow", "Medium", "Fast", "Very Fast"]
    text_writer.clear()
    text_writer.write(f"Animation Speed: {speed_names[animation_speed_idx]}", font=("Arial", 12, "normal"))

def handle_generate():
    """Handle generate button press."""
    generate_maze_prims()

def handle_solve():
    """Handle solve button press."""
    solve_maze_bfs()

def setup_ui():
    """Setup user interface with buttons."""
    # Generate button
    generate_button = turtle.Turtle()
    generate_button.penup()
    generate_button.hideturtle()
    generate_button.shape("square")
    generate_button.goto(-200, -rows*CELL_SIZE//2 - 30)
    generate_button.color("black")
    generate_button.write("Generate Maze", align="center", font=("Arial", 14, "normal"))
    
    # Solve button
    solve_button = turtle.Turtle()
    solve_button.penup()
    solve_button.hideturtle()
    solve_button.shape("square")
    solve_button.goto(0, -rows*CELL_SIZE//2 - 30)
    solve_button.color("black")
    solve_button.write("Solve Maze", align="center", font=("Arial", 14, "normal"))
    
    # Speed button
    speed_button = turtle.Turtle()
    speed_button.penup()
    speed_button.hideturtle()
    speed_button.shape("square")
    speed_button.goto(200, -rows*CELL_SIZE//2 - 30)
    speed_button.color("black")
    speed_button.write("Change Speed", align="center", font=("Arial", 14, "normal"))
    
    # Define click areas for buttons
    def check_button_click(x, y):
        if -280 < x < -120 and -rows*CELL_SIZE//2 - 40 < y < -rows*CELL_SIZE//2 - 20:
            handle_generate()
        elif -80 < x < 80 and -rows*CELL_SIZE//2 - 40 < y < -rows*CELL_SIZE//2 - 20:
            handle_solve()
        elif 120 < x < 280 and -rows*CELL_SIZE//2 - 40 < y < -rows*CELL_SIZE//2 - 20:
            toggle_animation_speed()
    
    # Register click event handler
    screen.onclick(check_button_click)
    
    # Show initial status
    update_status()

def main():
    """Main function to run the maze generator and solver."""
    setup_maze()
    draw_maze()
    setup_ui()
    turtle.mainloop()

if __name__ == "__main__":
    main()
