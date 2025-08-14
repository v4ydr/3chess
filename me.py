import networkx as nx
from enum import Enum

class EdgeType(Enum):
    RANK = 1
    FILE = 2
    DIAG = 3

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

## 1 RANK

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


## 8 RANK

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



## 12 RANK

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


#CONNECT 3 SECTIONS

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


# Visualize the graph
import matplotlib.pyplot as plt
import networkx as nx

# Ask user for layout preference
layout_choice = input("Choose layout: (1) Grid layout (2) Force-directed layout: ")

# Create layout for visualization
if layout_choice == "2":
    # Force-directed layout with initial positions based on grid
    initial_pos = {}
    file_to_x = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11}
    
    for node in G.nodes():
        file_letter = node[0]
        rank_number = int(node[1:])
        x = file_to_x[file_letter]
        y = rank_number
        initial_pos[node] = (x, y)
    
    # Use spring layout with initial positions - adjust k parameter for longer edges
    pos = nx.spring_layout(G, pos=initial_pos, k=10, iterations=20000, fixed=None)
    title = "3Chess Board Graph Visualization (Force-Directed)"
else:
    # Grid layout (original positioning)
    pos = {}
    file_to_x = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11}
    
    for node in G.nodes():
        file_letter = node[0]
        rank_number = int(node[1:])
        x = file_to_x[file_letter]
        y = rank_number
        pos[node] = (x, y)
    
    title = "3Chess Board Graph Visualization (Grid Layout)"

# Create the plot
plt.figure(figsize=(12, 8))

# Draw nodes
nx.draw_networkx_nodes(G, pos, node_color='lightblue', node_size=300)

# Separate edges by type and draw with different colors
edges_type_1 = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.RANK.value]
edges_type_2 = [(u, v) for u, v, d in G.edges(data=True) if d.get('edge_type') == EdgeType.FILE.value]

# Draw edge type 1 in red
nx.draw_networkx_edges(G, pos, edgelist=edges_type_1, edge_color='red', width=1)

# Draw edge type 2 in blue
nx.draw_networkx_edges(G, pos, edgelist=edges_type_2, edge_color='blue', width=1)

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
