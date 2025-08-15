"""
Hexagon mapping for 3Chess board.

The board wraps around a hexagon with specific file/rank positions.
Based on the edges:
- Bottom: A1-H1 (left to right)
- Bottom-left: A1-A8 (bottom to top)  
- Bottom-right: H1-H4, H9-H12 (bottom to top)
- Top: L8-L5, L9-L12 (left to right)
- Top-left: L8, K8, J8, I8, D8, C8, B8, A8
- Top-right: L12, K12, J12, I12, E12, F12, G12, H12

The hexagon can be thought of as having 6 edges, each with 8 squares.
"""

def create_hexagon_mapping():
    """Create the mapping for the hexagonal board."""
    mapping = {}
    
    # Let's think of the hexagon as having layers from center outward
    # And angular positions around the hexagon
    
    # First, let's place the edges as described
    # We'll use a coordinate system where (0,0) is bottom-left corner
    # and we go clockwise around the hexagon
    
    # Bottom edge: A1 to H1 (going left to right)
    bottom_edge = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1']
    for i, node in enumerate(bottom_edge):
        mapping[node] = (i, 0)  # Bottom row
    
    # Bottom-right edge: H1 to H12 (going up the right side)
    # H1, H2, H3, H4, then H9, H10, H11, H12
    right_nodes = ['H2', 'H3', 'H4', 'H9', 'H10', 'H11', 'H12']
    for i, node in enumerate(right_nodes, 1):
        if i <= 3:
            mapping[node] = (7, i)  # Continue up from H1
        else:
            mapping[node] = (7, i+4)  # Skip to ranks 9-12
    
    # Top-right edge: H12 to L12 (going around top-right)
    # From your description: L12, K12, J12, I12, E12, F12, G12, H12
    # So going backwards: H12, G12, F12, E12, I12, J12, K12, L12
    top_right = ['G12', 'F12', 'E12', 'I12', 'J12', 'K12', 'L12']
    for i, node in enumerate(top_right, 1):
        mapping[node] = (7-i, 11)  # Top row, moving left
    
    # Top edge: L12 to L5 (going down left side of top)
    # L12, L11, L10, L9, L8, L7, L6, L5
    top_nodes = ['L11', 'L10', 'L9', 'L8', 'L7', 'L6', 'L5']
    for i, node in enumerate(top_nodes, 1):
        mapping[node] = (0, 11-i)  # Left side going down
    
    # Top-left edge: L8 to A8
    # L8, K8, J8, I8, D8, C8, B8, A8
    top_left = ['K8', 'J8', 'I8', 'D8', 'C8', 'B8', 'A8']
    for i, node in enumerate(top_left, 1):
        mapping[node] = (i, 4)  # Middle-left row
    
    # Bottom-left edge: A8 to A1 (going down)
    left_nodes = ['A7', 'A6', 'A5', 'A4', 'A3', 'A2']
    for i, node in enumerate(left_nodes, 1):
        mapping[node] = (0, 4-i)  # Left side going down
    
    # Now fill in the interior nodes
    # We need to place all remaining nodes in a sensible hexagonal pattern
    
    # Interior of bottom section (ranks 2-4, files B-G)
    for file in 'BCDEFG':
        for rank in range(2, 5):
            node = f"{file}{rank}"
            if node not in mapping:
                file_idx = ord(file) - ord('A')
                mapping[node] = (file_idx, rank-1)
    
    # Interior of middle sections
    # Left middle: B-D ranks 5-7
    for file in 'BCD':
        for rank in range(5, 8):
            node = f"{file}{rank}"
            if node not in mapping:
                file_idx = ord(file) - ord('A')
                mapping[node] = (file_idx, rank-1)
    
    # Right middle: I-K ranks 5-7
    for file in 'IJK':
        for rank in range(5, 8):
            node = f"{file}{rank}"
            if node not in mapping:
                file_idx = ord(file) - ord('I') + 4
                mapping[node] = (file_idx, rank-1)
    
    # Interior of top sections
    # E-G ranks 9-11
    for file in 'EFG':
        for rank in range(9, 12):
            node = f"{file}{rank}"
            if node not in mapping:
                file_idx = ord(file) - ord('E') + 4
                mapping[node] = (file_idx, rank-1)
    
    # I-K ranks 9-11
    for file in 'IJK':
        for rank in range(9, 12):
            node = f"{file}{rank}"
            if node not in mapping:
                file_idx = ord(file) - ord('I') + 1
                mapping[node] = (file_idx, rank-1)
    
    return mapping

if __name__ == "__main__":
    mapping = create_hexagon_mapping()
    
    # Check we have all nodes
    expected_nodes = set()
    for file in 'ABCDEFGH':
        for rank in [1,2,3,4]:
            expected_nodes.add(f'{file}{rank}')
    for file in 'ABCD':
        for rank in [5,6,7,8]:
            expected_nodes.add(f'{file}{rank}')
    for file in 'IJKL':
        for rank in [5,6,7,8,9,10,11,12]:
            expected_nodes.add(f'{file}{rank}')
    for file in 'EFGH':
        for rank in [9,10,11,12]:
            expected_nodes.add(f'{file}{rank}')
    
    mapped_nodes = set(mapping.keys())
    missing = expected_nodes - mapped_nodes
    extra = mapped_nodes - expected_nodes
    
    print(f"Total expected: {len(expected_nodes)}")
    print(f"Total mapped: {len(mapped_nodes)}")
    print(f"Missing nodes: {missing}")
    print(f"Extra nodes: {extra}")
    
    # Check for overlaps
    coords_to_nodes = {}
    for node, coord in mapping.items():
        if coord in coords_to_nodes:
            print(f'OVERLAP: {node} and {coords_to_nodes[coord]} both at {coord}')
        coords_to_nodes[coord] = node