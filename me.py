import networkx as nx
from enum import Enum
import matplotlib.pyplot as plt

class EdgeType(Enum):
    RANK = 1
    FILE = 2
    DIAG = 3

def create_nodes():
    """Create all nodes for the 3Chess board."""
    G = nx.Graph()
    
    for file in "ABCDEFGH":
        for num in range(1, 5):
            G.add_node(f"{file}{num}")

    for file in "ABCD":
        for num2 in range(5, 9):
            G.add_node(f"{file}{num2}")

    for file in "IJKL":
        for num2 in range(5, 9):
            G.add_node(f"{file}{num2}")

    for file in "EFGH":
        for num2 in range(9, 13):
            G.add_node(f"{file}{num2}")

    for file in "IJKL":
        for num2 in range(9, 13):
            G.add_node(f"{file}{num2}")
    
    return G

def print_nodes_by_file(G):
    """Print nodes organized by file."""
    nodes_by_file = {}
    for node in G.nodes():
        file_letter = node[0]
        if file_letter not in nodes_by_file:
            nodes_by_file[file_letter] = []
        nodes_by_file[file_letter].append(node)

    # Sort each file's nodes by number
    for file_letter in nodes_by_file:
        nodes_by_file[file_letter].sort(key=lambda x: int(x[1:]))

    # Print as 12 lists
    for file_letter in sorted(nodes_by_file.keys()):
        print(f"{file_letter}: {nodes_by_file[file_letter]}")

def add_rank_1_edges(G):
    """Add edges for rank 1 section (ranks 1-4)."""
    files = "ABCDEFGH"
    for rank in range(1, 5):
        for i in range(len(files) - 1):
            node1 = f"{files[i]}{rank}"
            node2 = f"{files[i+1]}{rank}"
            G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    for file in "ABCDEFGH":
        for rank in range(1, 4):
            node1 = f"{file}{rank}"
            node2 = f"{file}{rank+1}"
            G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

def add_rank_8_edges(G):
    """Add edges for rank 8 section (ranks 5-8)."""
    files = "ABCD"
    for rank in range(5, 9):
        for i in range(len(files) - 1):
            node1 = f"{files[i]}{rank}"
            node2 = f"{files[i+1]}{rank}"
            G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    # Connect D to I for ranks 5-8
    for rank in range(5, 9):
        node1 = f"D{rank}"
        node2 = f"I{rank}"
        G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    files = "IJKL"
    for rank in range(5, 9):
        for i in range(len(files) - 1):
            node1 = f"{files[i]}{rank}"
            node2 = f"{files[i+1]}{rank}"
            G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    for file in "ABCDIJKL":
        for rank in range(5, 8):
            node1 = f"{file}{rank}"
            node2 = f"{file}{rank+1}"
            G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

def add_rank_12_edges(G):
    """Add edges for rank 12 section (ranks 9-12)."""
    files = "EFGH"
    for rank in range(9, 13):
        for i in range(len(files) - 1):
            node1 = f"{files[i]}{rank}"
            node2 = f"{files[i+1]}{rank}"
            G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    for file in "EFGH":
        for rank in range(9, 12):
            node1 = f"{file}{rank}"
            node2 = f"{file}{rank+1}"
            G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

    files = "IJKL"
    for rank in range(9, 13):
        for i in range(len(files) - 1):
            node1 = f"{files[i]}{rank}"
            node2 = f"{files[i+1]}{rank}"
            G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

    for file in "IJKL":
        for rank in range(9, 12):
            node1 = f"{file}{rank}"
            node2 = f"{file}{rank+1}"
            G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

    # Connect E to I for ranks 9-12
    for rank in range(9, 13):
        node1 = f"E{rank}"
        node2 = f"I{rank}"
        G.add_edge(node1, node2, edge_type=EdgeType.RANK.value)

def connect_sections(G):
    """Connect the three sections together."""
    # Connect section 1 to section 2 (ranks 4 to 5)
    for file in "ABCD":
        node1 = f"{file}4"
        node2 = f"{file}5"
        G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

    # Connect section 1 to section 3 (ranks 4 to 9)
    for file in "EFGH":
        node1 = f"{file}4"
        node2 = f"{file}9"
        G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

    # Connect section 2 to section 3 (ranks 5 to 9)
    for file in "IJKL":
        node1 = f"{file}5"
        node2 = f"{file}9"
        G.add_edge(node1, node2, edge_type=EdgeType.FILE.value)

def create_positions(G, layout_choice):
    """Create node positions for visualization."""
    file_to_x = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11}
    
    if layout_choice == "2":
        # Force-directed layout with initial positions based on grid
        # Create a graph without diagonal edges for force-directed layout
        G_layout = nx.Graph()
        G_layout.add_nodes_from(G.nodes())
        
        # Add only rank and file edges for layout calculation
        for u, v, d in G.edges(data=True):
            if d.get('edge_type') != EdgeType.DIAG.value:
                G_layout.add_edge(u, v)
        
        initial_pos = {}
        
        for node in G.nodes():
            file_letter = node[0]
            rank_number = int(node[1:])
            x = file_to_x[file_letter]
            y = rank_number
            initial_pos[node] = (x, y)
        
        # Use spring layout with initial positions - adjust k parameter for longer edges
        pos = nx.spring_layout(G_layout, pos=initial_pos, k=10, iterations=20000, fixed=None)
        title = "3Chess Board Graph Visualization (Force-Directed)"
    else:
        # Grid layout (original positioning)
        pos = {}
        
        for node in G.nodes():
            file_letter = node[0]
            rank_number = int(node[1:])
            x = file_to_x[file_letter]
            y = rank_number
            pos[node] = (x, y)
        
        title = "3Chess Board Graph Visualization (Grid Layout)"
    
    return pos, title

def on_click(event, G, pos, ax, rook_ray_dict, knight_hop_dict, bishop_ray_dict):
    """Handle click events on nodes."""
    if event.inaxes != ax:
        return
    
    # Find the closest node to the click
    click_pos = (event.xdata, event.ydata)
    min_dist = float('inf')
    closest_node = None
    
    for node, node_pos in pos.items():
        dist = ((click_pos[0] - node_pos[0])**2 + (click_pos[1] - node_pos[1])**2)**0.5
        if dist < min_dist:
            min_dist = dist
            closest_node = node
    
    # Only proceed if click is close enough to a node (within reasonable distance)
    if min_dist > 0.5:  # Adjust this threshold as needed
        return
    
    # Clear the axes and redraw
    ax.clear()
    
    # Get base node colors
    node_color_map = color_nodes(G)
    
    # Create color list for nodes
    node_colors = []
    highlighted_nodes = set()
    
    # Check for modifier keys using event.key
    is_shift_click = hasattr(event, 'key') and event.key and 'shift' in str(event.key).lower()
    is_space_click = hasattr(event, 'key') and event.key and (event.key == ' ' or event.key == 'space' or 'space' in str(event.key).lower())
    
    # Get highlighted nodes based on modifier key
    if is_space_click:
        # Space key - show knight hops
        if closest_node in knight_hop_dict:
            highlighted_nodes.update(knight_hop_dict[closest_node])
        click_type = "Knight"
    elif is_shift_click:
        # Shift key - show rook rays
        if closest_node in rook_ray_dict:
            for ray in rook_ray_dict[closest_node]:
                highlighted_nodes.update(ray)
        click_type = "Rook"
    else:
        # Normal click - show bishop rays
        if closest_node in bishop_ray_dict:
            for ray in bishop_ray_dict[closest_node]:
                highlighted_nodes.update(ray)
        click_type = "Bishop"
    
    for node in G.nodes():
        if node == closest_node:
            node_colors.append('red')  # Clicked node is red
        elif node in highlighted_nodes:
            node_colors.append('green')  # Nodes in rays/hops are green
        elif node_color_map[node] == 'dark':
            node_colors.append('brown')  # Original dark nodes
        else:
            node_colors.append('beige')  # Original light nodes

    # Draw nodes with the appropriate colors and black edge color for stroke
    nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=300, edgecolors='black', linewidths=1, ax=ax)

    # Separate edges by type and draw with different colors
    edges_rank = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.RANK.value]
    edges_file = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.FILE.value]
    edges_diag = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.DIAG.value]

    # Draw rank edges in red
    nx.draw_networkx_edges(G, pos, edgelist=edges_rank, edge_color='red', width=1, ax=ax)

    # Draw file edges in blue
    nx.draw_networkx_edges(G, pos, edgelist=edges_file, edge_color='blue', width=1, ax=ax)

    # Draw diagonal edges in green
    nx.draw_networkx_edges(G, pos, edgelist=edges_diag, edge_color='green', width=1, ax=ax)

    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=8, font_weight='bold', ax=ax)

    ax.set_title(f"3Chess Board - {click_type} from: {closest_node}")
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')
    
    # Redraw the canvas
    ax.figure.canvas.draw()

def visualize_graph(G):
    """Visualize the graph with user-selected layout."""
    # Ask user for layout preference
    layout_choice = input("Choose layout: (1) Grid layout (2) Force-directed layout: ")

    # Create layout for visualization
    pos, title = create_positions(G, layout_choice)
    
    # Get rook rays, knight hops, and bishop rays for click handling
    rook_ray_dict = rook_rays()
    knight_hop_dict = knight_hops()
    bishop_ray_dict = bishop_rays()
    
    # Get node colors based on diagonal reachability
    node_color_map = color_nodes(G)
    
    # Create color list for nodes in the order they appear in G.nodes()
    node_colors = []
    for node in G.nodes():
        if node_color_map[node] == 'dark':
            node_colors.append('brown')
        else:
            node_colors.append('beige')  # Beige for light nodes

    # Create the plot
    fig, ax = plt.subplots(figsize=(12, 8))

    # Draw nodes with the appropriate colors and black edge color for stroke
    nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=300, edgecolors='black', linewidths=1, ax=ax)

    # Separate edges by type and draw with different colors
    edges_rank = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.RANK.value]
    edges_file = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.FILE.value]
    edges_diag = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.DIAG.value]

    # Draw rank edges in red
    nx.draw_networkx_edges(G, pos, edgelist=edges_rank, edge_color='red', width=1, ax=ax)

    # Draw file edges in blue
    nx.draw_networkx_edges(G, pos, edgelist=edges_file, edge_color='blue', width=1, ax=ax)

    # Draw diagonal edges in green
    nx.draw_networkx_edges(G, pos, edgelist=edges_diag, edge_color='green', width=1, ax=ax)

    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=8, font_weight='bold', ax=ax)

    ax.set_title(title + " (Click: Bishop rays, Shift+Click: Rook rays, Space+Click: Knight hops)")
    if layout_choice != "2":
        ax.set_xlabel("Files (A-L)")
        ax.set_ylabel("Ranks (1-12)")
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')
    
    # Connect the click event
    fig.canvas.mpl_connect('button_press_event', lambda event: on_click(event, G, pos, ax, rook_ray_dict, knight_hop_dict, bishop_ray_dict))
    
    plt.tight_layout()
    plt.show()

def create_3chess_graph():
    """Create the complete 3Chess board graph."""
    G = create_nodes()
    add_rank_1_edges(G)
    add_rank_8_edges(G)
    add_rank_12_edges(G)
    connect_sections(G)
    create_diagonal_edges(G)
    return G

def create_diagonal_edges(G):
    """Add diagonal edges to a graph that already has rank and file edges."""
    
    # Keep track of edges we've already added to avoid duplicates
    diagonal_edges = set()
    
    for node in G.nodes():
        # Find all nodes reachable by one rank edge
        rank_neighbors = []
        for neighbor in G.neighbors(node):
            edge_data = G.get_edge_data(node, neighbor)
            if edge_data and edge_data.get('edge_type') == EdgeType.RANK.value:
                rank_neighbors.append(neighbor)
        
        # For each rank neighbor, find their file neighbors
        for rank_neighbor in rank_neighbors:
            for file_neighbor in G.neighbors(rank_neighbor):
                edge_data = G.get_edge_data(rank_neighbor, file_neighbor)
                if (edge_data and 
                    edge_data.get('edge_type') == EdgeType.FILE.value and 
                    file_neighbor != node):
                    
                    # Create edge tuple for duplicate checking (sorted to ensure consistency)
                    edge_tuple = tuple(sorted([node, file_neighbor]))
                    
                    # Add diagonal edge if it doesn't already exist
                    if edge_tuple not in diagonal_edges:
                        G.add_edge(node, file_neighbor, edge_type=EdgeType.DIAG.value)
                        diagonal_edges.add(edge_tuple)
        
        # Find all nodes reachable by one file edge
        file_neighbors = []
        for neighbor in G.neighbors(node):
            edge_data = G.get_edge_data(node, neighbor)
            if edge_data and edge_data.get('edge_type') == EdgeType.FILE.value:
                file_neighbors.append(neighbor)
        
        # For each file neighbor, find their rank neighbors
        for file_neighbor in file_neighbors:
            for rank_neighbor in G.neighbors(file_neighbor):
                edge_data = G.get_edge_data(file_neighbor, rank_neighbor)
                if (edge_data and 
                    edge_data.get('edge_type') == EdgeType.RANK.value and 
                    rank_neighbor != node):
                    
                    # Create edge tuple for duplicate checking (sorted to ensure consistency)
                    edge_tuple = tuple(sorted([node, rank_neighbor]))
                    
                    # Add diagonal edge if it doesn't already exist
                    if edge_tuple not in diagonal_edges:
                        G.add_edge(node, rank_neighbor, edge_type=EdgeType.DIAG.value)
                        diagonal_edges.add(edge_tuple)

def color_nodes(G):
    """Color nodes based on diagonal reachability from A1.
    Nodes reachable from A1 using only diagonal edges are 'dark'.
    All other nodes are 'light'.
    Returns a dictionary mapping node names to colors."""
    
    # Start from A1
    start_node = 'A1'
    
    # Find all nodes reachable from A1 using only diagonal edges (BFS)
    dark_nodes = set()
    visited = set()
    queue = [start_node]
    
    while queue:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)
        dark_nodes.add(current)
        
        # Find all diagonal neighbors
        for neighbor in G.neighbors(current):
            edge_data = G.get_edge_data(current, neighbor)
            if edge_data and edge_data.get('edge_type') == EdgeType.DIAG.value:
                if neighbor not in visited:
                    queue.append(neighbor)
    
    # Create color mapping
    node_colors = {}
    for node in G.nodes():
        if node in dark_nodes:
            node_colors[node] = 'dark'
        else:
            node_colors[node] = 'light'
    
    # Verify counts
    dark_count = sum(1 for color in node_colors.values() if color == 'dark')
    light_count = sum(1 for color in node_colors.values() if color == 'light')
    
    print(f"Dark nodes: {dark_count}, Light nodes: {light_count}")
    if dark_count != 48 or light_count != 48:
        print(f"WARNING: Expected 48 dark and 48 light nodes, but got {dark_count} dark and {light_count} light")
    
    return node_colors

def main():
    """Main function to create and visualize the 3Chess board."""
    G = create_3chess_graph()
    print_nodes_by_file(G)
    visualize_graph(G)

def bishop_rays():
    """Generate bishop rays for all nodes."""
    # Square name constants for easy reference
    A1, A2, A3, A4, A5, A6, A7, A8 = 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'
    B1, B2, B3, B4, B5, B6, B7, B8 = 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'
    C1, C2, C3, C4, C5, C6, C7, C8 = 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'
    D1, D2, D3, D4, D5, D6, D7, D8 = 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'
    E1, E2, E3, E4, E9, E10, E11, E12 = 'E1', 'E2', 'E3', 'E4', 'E9', 'E10', 'E11', 'E12'
    F1, F2, F3, F4, F9, F10, F11, F12 = 'F1', 'F2', 'F3', 'F4', 'F9', 'F10', 'F11', 'F12'
    G1, G2, G3, G4, G9, G10, G11, G12 = 'G1', 'G2', 'G3', 'G4', 'G9', 'G10', 'G11', 'G12'
    H1, H2, H3, H4, H9, H10, H11, H12 = 'H1', 'H2', 'H3', 'H4', 'H9', 'H10', 'H11', 'H12'
    I5, I6, I7, I8, I9, I10, I11, I12 = 'I5', 'I6', 'I7', 'I8', 'I9', 'I10', 'I11', 'I12'
    J5, J6, J7, J8, J9, J10, J11, J12 = 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11', 'J12'
    K5, K6, K7, K8, K9, K10, K11, K12 = 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'
    L5, L6, L7, L8, L9, L10, L11, L12 = 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'


    ray_dict = {
        A1: [[B2, C3, D4, E9, F10, G11, H12], [B2, C3, D4, I5, J6, K7, L8]],
        A2: [[B1], [B3, C4, D5, I6, J7, K8]],
        A3: [[B2, C1], [B4, C5, D6, I7, J8]],
        A4: [[B3, C2, D1], [B5, C6, D7, I8]],
        A5: [[B4, C3, D2, E1], [B6, C7, D8]],
        A6: [[B5, C4, D3, E2, F1], [B7, C8]],
        A7: [[B6, C5, D4, E3, F2, G1], [B8]],
        A8: [[B7, C6, D5, E4, F3, G2, H1], [B7, C6, D5, I9, J10, K11, L12]],
        B1: [[A2], [C2, D3, E4, F9, G10, H11]],
        B2: [[A1], [A3], [C1], [C3, D4, E9, F10, G11, H12], [C3, D4, I5, J6, K7, L8]],
        B3: [[A2], [A4], [C2, D1], [C4, D5, I6, J7, K8]],
        B4: [[A3], [A5], [C3, D2, E1], [C5, D6, I7, J8]],
        B5: [[A4], [A6], [C4,D3,E2,F1], [C6,D7,I8]],
        B6: [[A5], [A7], [C5,D4,E3,F2,G1], [C7,D8]],
        B7: [[A6], [A8], [C8], [C6, D5, E4, F3, G2, H1], [C6, D5, I9, J10, K11, L12]],
        B8: [[A7], [C7, D6, I5, J9, K10, L11]],
        C1: [[B2, A3], [D2, E3, F4, G9, H10]],
        C2: [[B1], [D1], [B3, A4], [D3, E4, F9, G10, H11]],
        C3: [[B2, A1], [B4, A5], [D2, E1], [D4, E9, F10, G11, H12], [D4, E9, I5, J6, K7, L8]],
        C4: [[B3, A2], [B5, A6], [D3, E2, F1], [D5, I6, J7, K8]],
        C5: [[B4, A3], [B6, A7], [D4, E3, F2, G1], [D6, I7, J8]],
        C6: [[B5, A4], [B7, A8], [D5, E4, F3, G2, H1], [D7, I8]],
        C7: [[B6, A5], [B8], [D8], [D6, I5, J9, K10, L11]],
        C8: [[B7, A6], [D7, I6, J5, K9, L10]],
        D1: [[C2, B3, A4], [E2, F3, G4, H9]],
        D2: [[C1], [E1], [C3, B4, A5], [E3, F4, G9, H10]],
        D3: [[C2, B1], [C4, B5, A6], [E2, F1], [E4, F9, G10, H11]],
        D4: [[C3, B2, A1], [C5, B6, A7], [E3, F2, G1], [I5, J6, K7, L8], [E9, F10, G11, H12]],
        D5: [[C4, B3, A2], [C6, B7, A8], [E4, F3, G2, H1], [I6, J7, K8], [I9, J10, K11, L12]],
        D6: [[C5, B4, A3], [C7, B8], [I7, J8], [I5, J9, K10, L11]],
        D7: [[C6, B5, A4], [C8], [I8], [I6, J5, K9, L10]],
        D8: [[C7, B6, A5], [I7, J6, K5, L9]],
        E1: [[D2, C3, B4, A5], [F2, G3, H4]],
        E2: [[D1], [F1], [D3, C4, B5, A6], [F3, G4, H9]],
        E3: [[D2, C1], [D4, C5, B6, A7], [F2, G1], [F4, G9, H10]],
        E4: [[D3, C2, B1], [D5, C6, B7, A8], [F3, G2, H1], [F9, G10, H11], [I9, J10, K11, L12]],
        E9: [[D4, C3, B2, A1], [F4, G3, H2], [F10, G11, H12], [I10, J11, K12], [I5, J6, K7, L8]],
        E10: [[F9, G4, H3], [F11, G12], [I11, J12], [I9, J5, K6, L7]],
        E11: [[I12], [F12], [F10, G9, H4], [I10, J9, K5, L6]],
        E12: [[F11, G10, H9], [I11, J10, K9, L5]],
        F1: [[E2, D3, C4, B5, A6], [G2, H3]],
        F2: [[E1], [G1], [E3, D4, C5, B6, A7], [G3, H4]],
        F3: [[E2, D1], [E4, D5, C6, B7, A8], [G2, H1], [G4, H9], [E4, I9, J10, K11, L12]],
        F4: [[E3, D2, C1], [E9, I10, J11, K12], [G9, H10], [G3, H2]],
        F9: [[E4, D3, C2, B1], [G4, H3], [G10, H11], [E10, I11, J12]],
        F10: [[G9, H4], [G11, H12], [E11, I12], [E9, I5, J6, K7, L8], [E9, D4, C3, B2, A1]],
        F11: [[E12], [G12], [E10, I9, J5, K6, L7], [G10, H9]],
        F12: [[G11, H10], [E11, I10, J9, K5, L6]],
        G1: [[H2], [F2, E3, D4, C5, B6, A7]],
        G2: [[F1], [H1], [H3], [F3, E4, D5, C6, B7, A8], [F3, E4, I9, J10, K11, L12]],
        G3: [[F2, E1], [H2], [H4], [F4, E9, I10, J11, K12]],
        G4: [[F3, E2, D1], [H3], [H9], [F9, E10, I11, J12]],
        G9: [[H4], [H10], [F10, E11, I12], [F4, E3, D2, C1]],
        G10: [[H9], [H11], [F11, E12], [F9, E4, D3, C2, B1]],
        G11: [[H10], [F12], [H12], [F10, E9, D4, C3, B2, A1], [F10, E9, I5, J6, K7, L8]],
        G12: [[H11], [F11, E10, I9, J5, K6, L7]],
        H1: [[G2, F3, E4, D5, C6, B7, A8], [G2, F3, E4, D5, I9, J10, K11, L12]],
        H2: [[G1], [G3, F4, E9, I10, J11, K12]],
        H3: [[G2, F1], [G4, F9, E10, I11, J12]],
        H4: [[G3, F2, E1], [G9, F10, E11, I12]],
        H9: [[G4, F3, E2, D1], [G10, F11, E12]],
        H10: [[G9, F4, E3, D2, C1], [G11, F12]],
        H11: [[G10, F9, E4, D3, C2, B1], [G12]],
        H12: [[G11, F10, E9, D4, C3, B2, A1], [G11, F10, E9, I5, J6, K7, L8]],
        I8: [[J7, K6, L5], [D7, C6, B5, A4]],
        I7: [[J8], [D8], [J6, K5, L9], [D6, C5, B4, A3]],
        I6: [[D7, C8], [J7, K8], [D5, C4, B3, A2], [J5, K9, L10]],
        I5: [[J6, K7, L8], [D6, C7, B8], [J9, K10, L11], [E9, F10, G11, H12], [D4, C3, B2, A1]],
        I9: [[J5, K6, L7], [D5, C6, B7, A8], [J10, K11, L12], [E10, F11, G12], [E4, F3, G2, H1]],
        I10: [[J11, K12], [E11, F12], [E9, F4, G3, H2], [J9, K5, L6]],
        I11: [[J12], [E12], [E10, F9, G4, H3], [J10, K9, L5]],
        I12: [[E11, F10, G9, H4], [J11, K10, L9]],
        J8: [[K7, L6], [I7, D6, C5, B4, A3]],
        J7: [[K8], [I8], [K6, L5], [I6, D5, C4, B3, A2]],
        J6: [[I7, D8], [K7, L8], [K5, L9], [I5, E9, F10, G11, H12], [I5, D4, C3, B2, A1]],
        J5: [[K6, L7], [K9, L10], [I6, D7, C8], [I9, E10, F11, G12]],
        J9: [[K5, L6], [K10, L11], [I10, E11, F12], [I5, D6, C7, B8]],
        J10: [[K11, L12], [I11, E12], [I9, E4, F3, G2, H1], [I9, D5, C6, B7, A8]],
        J11: [[K12], [I12], [K10, L9], [I10, E9, F4, G3, H2]],
        J12: [[K11, L10], [I11, E10, F9, G4, H3]],
        K8: [[L7], [J7, I6, D5, C4, B3, A2]],
        K7: [[L8], [J8], [L6], [J6, I5, E9, F10, G11, H12], [J6, I5, D4, C3, B2, A1]],
        K6: [[L7], [L5], [J7, I8], [J5, I9, E10, F11, G12]],
        K5: [[L6], [L9], [J6, I7, D8], [J9, I10, E11, F12]],
        K9: [[L5], [L10], [J5, I6, D7, C8], [J10, I11, E12]],
        K10: [[L9], [L11], [J9, I5, D6, C7, B8], [J11, I12]],
        K11: [[L10], [L12], [J12], [J10, I9, D5, C6, B7, A8], [J10, I9, E4, F3, G2, H1]],
        K12: [[L11], [J11, I10, E9, F4, G3, H2]],
        L8: [[K7, J6, I5, D4, C3, B2, A1], [K7, J6, I5, E9, F10, G11, H12]],
        L7: [[K8], [K6, J5, I9, E10, F11, G12]],
        L6: [[K7, J8], [K5, J9, I10, E11, F12]],
        L5: [[K6, J7, I8], [K9, J10, I11, E12]],
        L9: [[K10, J11, I12], [K5, J6, I7, D8]],
        L10: [[K11, J12], [K9, J5, I6, D7, C8]],
        L11: [[K12], [K10, J9, I5, D6, C7, B8]],
        L12: [[K11, J10, I9, D5, C6, B7, A8], [K11, J10, I9, E4, F3, G2, H1]]
    }
    
    return ray_dict

def rook_rays():
    """Generate rook rays for all nodes."""
    G = create_3chess_graph()
    
    # Verify we have 96 nodes
    node_count = len(G.nodes())
    if node_count != 96:
        print(f"WARNING: Expected 96 nodes, but got {node_count}")
    
    rook_ray_dict = {}
    
    for node in G.nodes():
        rays = []
        
        # For each direction (rank/file), collect nodes in order
        for neighbor in G.neighbors(node):
            edge_data = G.get_edge_data(node, neighbor)
            if edge_data and edge_data.get('edge_type') in [EdgeType.RANK.value, EdgeType.FILE.value]:
                # Start a ray in this direction
                ray = []
                current = neighbor
                visited_in_ray = set([node])
                
                # Follow the direction as far as possible
                while current and current not in visited_in_ray:
                    ray.append(current)
                    visited_in_ray.add(current)
                    
                    # Find the next node in the same direction
                    next_node = None
                    for next_neighbor in G.neighbors(current):
                        next_edge_data = G.get_edge_data(current, next_neighbor)
                        if (next_edge_data and 
                            next_edge_data.get('edge_type') == edge_data.get('edge_type') and
                            next_neighbor not in visited_in_ray):
                            next_node = next_neighbor
                            break
                    
                    current = next_node
                
                if ray:  # Only add non-empty rays
                    rays.append(ray)
        
        rook_ray_dict[node] = rays
    
    return rook_ray_dict

def knight_hops():
    """Generate knight hops for all nodes.
    Knight moves are L-shaped: 2 steps in one direction, then 1 step orthogonal.
    This covers all patterns: rank-rank-file, file-file-rank, rank-file-file, file-rank-rank.
    """
    G = create_3chess_graph()
    
    # Verify we have 96 nodes
    node_count = len(G.nodes())
    if node_count != 96:
        print(f"WARNING: Expected 96 nodes, but got {node_count}")
    
    knight_hop_dict = {}
    
    for node in G.nodes():
        hops = set()  # Use set to avoid duplicates
        
        # Get all 1-neighbors with their edge types
        one_neighbors = []
        for neighbor in G.neighbors(node):
            edge_data = G.get_edge_data(node, neighbor)
            if edge_data and edge_data.get('edge_type') in [EdgeType.RANK.value, EdgeType.FILE.value]:
                one_neighbors.append((neighbor, edge_data.get('edge_type')))
        
        # Pattern 1: 2 steps in one direction, then 1 step orthogonal
        # For each 1-neighbor, find their straight 2-neighbors
        for one_neighbor, edge_type in one_neighbors:
            # Find 2-step neighbors in the same direction
            current = one_neighbor
            for next_neighbor in G.neighbors(current):
                next_edge_data = G.get_edge_data(current, next_neighbor)
                if (next_edge_data and 
                    next_edge_data.get('edge_type') == edge_type and
                    next_neighbor != node):
                    # Now at 2-step neighbor, find orthogonal 1-step
                    two_step_neighbor = next_neighbor
                    for final_neighbor in G.neighbors(two_step_neighbor):
                        final_edge_data = G.get_edge_data(two_step_neighbor, final_neighbor)
                        if (final_edge_data and 
                            final_edge_data.get('edge_type') in [EdgeType.RANK.value, EdgeType.FILE.value] and
                            final_edge_data.get('edge_type') != edge_type and
                            final_neighbor != current):
                            hops.add(final_neighbor)
        
        # Pattern 2: 1 step in one direction, then 2 steps orthogonal
        # For each 1-neighbor, find their orthogonal neighbors
        for one_neighbor, edge_type in one_neighbors:
            # Find orthogonal neighbors of the 1-neighbor
            for ortho_neighbor in G.neighbors(one_neighbor):
                ortho_edge_data = G.get_edge_data(one_neighbor, ortho_neighbor)
                if (ortho_edge_data and 
                    ortho_edge_data.get('edge_type') in [EdgeType.RANK.value, EdgeType.FILE.value] and
                    ortho_edge_data.get('edge_type') != edge_type and
                    ortho_neighbor != node):
                    # Now from ortho_neighbor, take another step in the same orthogonal direction
                    for final_neighbor in G.neighbors(ortho_neighbor):
                        final_edge_data = G.get_edge_data(ortho_neighbor, final_neighbor)
                        if (final_edge_data and 
                            final_edge_data.get('edge_type') == ortho_edge_data.get('edge_type') and
                            final_neighbor != one_neighbor):
                            hops.add(final_neighbor)
        
        knight_hop_dict[node] = list(hops)
    
    return knight_hop_dict

if __name__ == "__main__":
    main()
# End of Selection
    
