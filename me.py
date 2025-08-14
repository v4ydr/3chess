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

def visualize_graph(G):
    """Visualize the graph with user-selected layout."""
    # Ask user for layout preference
    layout_choice = input("Choose layout: (1) Grid layout (2) Force-directed layout: ")

    # Create layout for visualization
    pos, title = create_positions(G, layout_choice)
    
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
    plt.figure(figsize=(12, 8))

    # Draw nodes with the appropriate colors and black edge color for stroke
    nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=300, edgecolors='black', linewidths=1)

    # Separate edges by type and draw with different colors
    edges_rank = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.RANK.value]
    edges_file = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.FILE.value]
    edges_diag = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.DIAG.value]

    # Draw rank edges in red
    nx.draw_networkx_edges(G, pos, edgelist=edges_rank, edge_color='red', width=1)

    # Draw file edges in blue
    nx.draw_networkx_edges(G, pos, edgelist=edges_file, edge_color='blue', width=1)

    # Draw diagonal edges in green
    nx.draw_networkx_edges(G, pos, edgelist=edges_diag, edge_color='green', width=1)

    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=8, font_weight='bold')

    plt.title(title)
    if layout_choice != "2":
        plt.xlabel("Files (A-L)")
        plt.ylabel("Ranks (1-12)")
    plt.grid(True, alpha=0.3)
    plt.axis('equal')
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

if __name__ == "__main__":
    main()
