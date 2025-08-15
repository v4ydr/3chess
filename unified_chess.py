#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pygame
import sys
sys.path.append('/Users/vayd/3chess')
from math import radians, cos, sin, sqrt
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
from enum import Enum
from me import create_3chess_graph, bishop_rays, rook_rays, knight_hops, EdgeType
import networkx as nx

WIDTH, HEIGHT = 900, 900

cos30, sin30 = cos(radians(30)), sin(radians(30))
cos60, sin60 = cos(radians(60)), sin(radians(60))

class PieceType(Enum):
    KING = 0
    PAWN = 1
    KNIGHT = 2
    BISHOP = 3
    ROOK = 4
    QUEEN = 5

class Player(Enum):
    WHITE = 0  # Match yalta.py sprite ordering
    RED = 1
    BLACK = 2

def load_sprites():
    spritesheet = pygame.image.load("./yalta_pieces.png")
    pieces = [[],[],[]]
    for y in range(3):
        for x in range(6):
            # Get and scale the sprite
            sprite = spritesheet.subsurface([x*32, y*32, 32, 32])
            scaled = pygame.transform.scale(sprite, [40, 40])
            
            # Recolor black pieces (row 2) from brown to true black
            if y == 2:  # Black pieces row
                # Create a copy to modify
                recolored = scaled.copy()
                # Lock surface for pixel access
                pix_array = pygame.PixelArray(recolored)
                
                # Replace brown-ish colors with black/dark grey
                # The original sprites use a brown color around (120, 77, 58)
                for px in range(40):
                    for py in range(40):
                        color = recolored.get_at((px, py))
                        # If it's a brown-ish color (not transparent)
                        if color.a > 0:  # Not transparent
                            # Calculate brightness to maintain shading
                            brightness = (color.r + color.g + color.b) / 3
                            if brightness < 200:  # Not a highlight
                                # Map browns to blacks/greys
                                if brightness < 60:
                                    # Very dark -> black
                                    pix_array[px, py] = (10, 10, 10)
                                elif brightness < 100:
                                    # Medium dark -> dark grey
                                    pix_array[px, py] = (30, 30, 30)
                                elif brightness < 140:
                                    # Medium -> grey
                                    pix_array[px, py] = (50, 50, 50)
                                else:
                                    # Light areas -> lighter grey
                                    pix_array[px, py] = (70, 70, 70)
                
                del pix_array  # Release the pixel array
                pieces[y].append(recolored)
            else:
                pieces[y].append(scaled)
    return pieces

sprites = load_sprites()

class Vec:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y
    
    def __add__(self, v):
        return Vec(self.x+v.x, self.y+v.y)
    
    def __sub__(self, v):
        return Vec(self.x-v.x, self.y-v.y)
    
    def __mul__(self, m):
        if isinstance(m, Vec):
            return self.x*m.x + self.y*m.y
        else:
            return Vec(self.x*m, self.y*m)
    
    def __truediv__(self, n):
        return Vec(self.x/n, self.y/n)
    
    def __iter__(self):
        self.components = [self.x,self.y]
        return self
    
    def __next__(self):
        if len(self.components) > 0:
            return self.components.pop(0)
        else:
            del self.components
            raise StopIteration
    
    def int(self):
        return Vec(int(self.x), int(self.y))
    
    def mag(self):
        return sqrt(self.x**2 + self.y**2)
    
    def __repr__(self):
        return f"({self.x};{self.y})"

class Cell:
    mid = Vec(WIDTH/2, HEIGHT/2)
    size = WIDTH/2
    side = size/2
    height = sqrt(size**2 - side**2)
    
    v1 = Vec(-size*cos60, -height)
    v2 = Vec(size*cos60, -height)
    v3 = Vec(size, 0)
    v4 = Vec(size*cos60, height)
    v5 = Vec(-size*cos60, height)
    v6 = Vec(-size, 0)
    
    va = Vec(-height*cos30, -height*sin30)
    vb = Vec(0, -height)
    vc = Vec(height*cos30, -height*sin30)
    vd = Vec(height*cos30, height*sin30)
    ve = Vec(0, height)
    vf = Vec(-height*cos30, height*sin30)
    
    v123 = [v1,v2,v3,v4,v5,v6]
    vabc = [va,vb,vc,vd,ve,vf]
    
    intervals = [
        [(0, 4), (0, 4)], #First sextan
        [(0, 4), (4, 8)], #Second sextan
        [(8,12), (4, 8)], #Third sextan
        [(8,12), (8,12)], #Fourth sextan
        [(4, 8), (8,12)], #Fifth sextan
        [(4, 8), (0, 4)]  #Sixth sextan
    ]
    
    pygame.font.init()
    font = pygame.font.SysFont("monospace", 10)
    
    # Forest green for dark squares, beige for light
    DARK = (34, 87, 46)  # Forest green
    LIGHT = (245, 222, 179)  # Beige
    
    def __init__(self, node_name, x, y):
        self.node_name = node_name
        self.x, self.y = x, y
        self.hover = False
        self.points = None
        self.selected = False
        self.highlighted = False
        
        for i in range(len(self.intervals)):
            interval = self.intervals[i]
            
            if interval[0][0] <= x < interval[0][1] and interval[1][0] <= y < interval[1][1]:
                ratio_x1, ratio_y1 = (x%4)/4, (y%4)/4
                ratio_x2, ratio_y2 = (x%4+1)/4, (y%4+1)/4
                mid_ratio_x, mid_ratio_y = (ratio_x2+ratio_x1)/2, (ratio_y2+ratio_y1)/2
                
                s1, s2 = self.v123[i]*0.5, self.v123[(i+2)%6]*0.5
                corner = self.mid + self.v123[(i+4)%6]
                
                U1, U2 = self.vabc[(i+1)%6]*ratio_y1 - s1*ratio_y1 + s2, self.vabc[(i+1)%6]*ratio_y2 - s1*ratio_y2 + s2
                midU = self.vabc[(i+1)%6]*mid_ratio_y - s1*mid_ratio_y + s2
                
                p1 = s1*ratio_y1 + U1*ratio_x1
                p2 = s1*ratio_y1 + U1*ratio_x2
                p3 = s1*ratio_y2 + U2*ratio_x2
                p4 = s1*ratio_y2 + U2*ratio_x1
                
                self.center = corner+s1*mid_ratio_y + midU*mid_ratio_x
                self.points = [list(corner+p) for p in [p1,p2,p3,p4]]
                self.colour = [self.DARK, self.LIGHT][(x+y+i)%2]
                break
        
        # Don't show node names by default - too cluttered
        self.show_label = False
        if self.show_label:
            self.txt = self.font.render(node_name, True, (100,100,100))
            self.txt_size = [self.txt.get_width()/2, self.txt.get_height()/2]
    
    def draw(self, window, piece):
        if self.points:
            colour = self.colour
            
            # Draw base square
            pygame.draw.polygon(window, colour, self.points)
            
            # Add subtle edge for board definition
            edge_color = (20, 50, 25) if colour == self.DARK else (200, 180, 140)
            pygame.draw.polygon(window, edge_color, self.points, 1)
            
            # Selection and movement indicators
            if self.selected:
                # Golden outline for selected square
                pygame.draw.polygon(window, (255, 215, 0), self.points, 4)
            elif self.highlighted:
                # Small green circle for possible moves
                pygame.draw.circle(window, (50, 205, 50), (int(self.center.x), int(self.center.y)), 10)
                pygame.draw.circle(window, (34, 139, 34), (int(self.center.x), int(self.center.y)), 10, 2)
            elif self.hover:
                # Subtle white outline on hover
                pygame.draw.polygon(window, (255, 255, 255), self.points, 2)
            
            if piece:
                player, piece_type = piece
                sprite = sprites[player.value][piece_type.value]
                # Center the sprites (40x40 so offset by 20)
                window.blit(sprite, [self.center.x-20, self.center.y-20])
            
            # Only draw node name if enabled
            if self.show_label and hasattr(self, 'txt'):
                window.blit(self.txt, [self.center.x-self.txt_size[0], self.center.y-self.txt_size[1]])
    
    def is_in(self, pos):
        if self.points:
            return Polygon(self.points).contains(Point(*pos))
        return False

class UnifiedChessGame:
    def __init__(self):
        # Create the graph structure
        self.graph = create_3chess_graph()
        
        # Get ray dictionaries
        self.bishop_ray_dict = bishop_rays()
        self.rook_ray_dict = rook_rays()
        self.knight_hop_dict = knight_hops()
        
        # Map graph nodes to display coordinates
        self.node_to_coords = self.create_node_mapping()
        
        # Create cells for display
        self.cells = {}
        for node_name, (x, y) in self.node_to_coords.items():
            self.cells[node_name] = Cell(node_name, x, y)
        
        # Initialize piece positions on the graph
        self.piece_positions = {}
        self.setup_initial_pieces()
        
        # Game state
        self.current_player = Player.RED
        self.selected_node = None
        self.possible_moves = []
        
        # UI
        pygame.font.init()
        self.font = pygame.font.SysFont("Arial", 24, bold=True)
        self.small_font = pygame.font.SysFont("Arial", 18)
        self.turn_order = [Player.RED, Player.WHITE, Player.BLACK]
        
    def create_node_mapping(self):
        """Map graph nodes to hexagonal display coordinates.
        
        The hexagon is divided into 6 sextants with proper orientations:
        - Bottom-left: A-D ranks 1-4 (no rotation needed)
        - Left: A-D ranks 5-8 (rotate 90° counterclockwise)
        - Top-left: I-L ranks 5-8 (rotate 180°)
        - Top-right: I-L ranks 9-12 (rotate 90° clockwise + flip vertical)
        - Right: E-H ranks 9-12 (rotate 180°)
        - Bottom-right: E-H ranks 1-4 (rotate 90° clockwise)
        """
        mapping = {}
        
        # Sextant 1 (bottom-left): A-D ranks 1-4 - NO ROTATION
        # Bottom edge should read: A1, B1, C1, D1 (left to right)
        # Left edge should read: A1, A2, A3, A4 (bottom to top)
        for file_idx, file in enumerate("ABCD"):
            for rank in range(1, 5):
                x = file_idx  # 0-3
                y = rank - 1  # 0-3
                mapping[f"{file}{rank}"] = (x, y)
        
        # Sextant 2 (left): A-D ranks 5-8 - NEEDS 180° MORE ROTATION
        # Left edge continuation: A5, A6, A7, A8 (bottom to top)
        for file_idx, file in enumerate("ABCD"):
            for rank in range(5, 9):
                # Was doing 90° CCW, but need to rotate 180° more
                # Original 90° CCW gave: (rank-5, 3-file_idx)
                # Rotate 180° more: (3-(rank-5), file_idx)
                x = 3 - (rank - 5)  # 3-0 = 3,2,1,0
                y = file_idx + 4  # 4-7
                mapping[f"{file}{rank}"] = (x, y)
        
        # Sextant 3 (top-left): I-L ranks 5-8 - ROTATE 180°
        # Top-left edge: L8, K8, J8, I8 connecting to D8, C8, B8, A8
        for file_idx, file in enumerate("IJKL"):
            for rank in range(5, 9):
                # Original: (file_idx, rank-5) in 4x4 grid
                # Rotate 180°: (3-file_idx, 3-(rank-5))
                x = 3 - file_idx + 8  # 8-11
                y = 3 - (rank - 5) + 4  # 4-7
                mapping[f"{file}{rank}"] = (x, y)
        
        # Sextant 4 (top-right): I-L ranks 9-12 - ROTATE 90° CW + FLIP VERTICAL
        # Top-right edge: L12, K12, J12, I12 (top-left to bottom-right)
        for file_idx, file in enumerate("IJKL"):
            for rank in range(9, 13):
                # Original: (file_idx, rank-9) in 4x4 grid
                # Rotate 90° CW: (3-(rank-9), file_idx)
                # Then flip vertical: (3-(rank-9), 3-file_idx)
                x = 3 - (rank - 9) + 8  # 8-11
                y = 3 - file_idx + 8  # 8-11
                mapping[f"{file}{rank}"] = (x, y)
        
        # Sextant 5 (right): E-H ranks 9-12 - ROTATE 180°
        # Right edge: H12, H11, H10, H9 connecting to E12, F12, G12, H12
        for file_idx, file in enumerate("EFGH"):
            for rank in range(9, 13):
                # Original: (file_idx, rank-9) in 4x4 grid
                # Rotate 180°: (3-file_idx, 3-(rank-9))
                x = 3 - file_idx + 4  # 4-7
                y = 3 - (rank - 9) + 8  # 8-11
                mapping[f"{file}{rank}"] = (x, y)
        
        # Sextant 6 (bottom-right): E-H ranks 1-4 - NEEDS 180° MORE ROTATION
        # Bottom edge continuation: E1, F1, G1, H1 (left to right)
        # Right edge: H1, H2, H3, H4 (bottom to top)
        for file_idx, file in enumerate("EFGH"):
            for rank in range(1, 5):
                # Was doing 90° CW: (3-(rank-1), file_idx)
                # Rotate 180° more: (rank-1, 3-file_idx)
                x = rank - 1 + 4  # 4-7
                y = 3 - file_idx  # 3-0
                mapping[f"{file}{rank}"] = (x, y)
        
        return mapping
    
    def setup_initial_pieces(self):
        """Place pieces in their starting positions."""
        # Red pieces (A1-H1)
        red_back_rank = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1']
        red_pawn_rank = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2']
        
        # Place red pieces
        self.piece_positions['A1'] = (Player.RED, PieceType.ROOK)
        self.piece_positions['B1'] = (Player.RED, PieceType.KNIGHT)
        self.piece_positions['C1'] = (Player.RED, PieceType.BISHOP)
        self.piece_positions['D1'] = (Player.RED, PieceType.QUEEN)
        self.piece_positions['E1'] = (Player.RED, PieceType.KING)
        self.piece_positions['F1'] = (Player.RED, PieceType.BISHOP)
        self.piece_positions['G1'] = (Player.RED, PieceType.KNIGHT)
        self.piece_positions['H1'] = (Player.RED, PieceType.ROOK)
        
        for node in red_pawn_rank:
            self.piece_positions[node] = (Player.RED, PieceType.PAWN)
        
        # White pieces (A8-L8)
        white_back_rank = ['A8', 'B8', 'C8', 'D8', 'I8', 'J8', 'K8', 'L8']
        white_pawn_rank = ['A7', 'B7', 'C7', 'D7', 'I7', 'J7', 'K7', 'L7']
        
        # Place white pieces
        self.piece_positions['A8'] = (Player.WHITE, PieceType.ROOK)
        self.piece_positions['B8'] = (Player.WHITE, PieceType.KNIGHT)
        self.piece_positions['C8'] = (Player.WHITE, PieceType.BISHOP)
        self.piece_positions['D8'] = (Player.WHITE, PieceType.QUEEN)
        self.piece_positions['I8'] = (Player.WHITE, PieceType.KING)
        self.piece_positions['J8'] = (Player.WHITE, PieceType.BISHOP)
        self.piece_positions['K8'] = (Player.WHITE, PieceType.KNIGHT)
        self.piece_positions['L8'] = (Player.WHITE, PieceType.ROOK)
        
        for node in white_pawn_rank:
            self.piece_positions[node] = (Player.WHITE, PieceType.PAWN)
        
        # Black pieces (H12-L12, remember the ordering: H, G, F, E, I, J, K, L)
        black_back_rank = ['H12', 'G12', 'F12', 'E12', 'I12', 'J12', 'K12', 'L12']
        black_pawn_rank = ['H11', 'G11', 'F11', 'E11', 'I11', 'J11', 'K11', 'L11']
        
        # Place black pieces
        self.piece_positions['H12'] = (Player.BLACK, PieceType.ROOK)
        self.piece_positions['G12'] = (Player.BLACK, PieceType.KNIGHT)
        self.piece_positions['F12'] = (Player.BLACK, PieceType.BISHOP)
        self.piece_positions['E12'] = (Player.BLACK, PieceType.QUEEN)
        self.piece_positions['I12'] = (Player.BLACK, PieceType.KING)
        self.piece_positions['J12'] = (Player.BLACK, PieceType.BISHOP)
        self.piece_positions['K12'] = (Player.BLACK, PieceType.KNIGHT)
        self.piece_positions['L12'] = (Player.BLACK, PieceType.ROOK)
        
        for node in black_pawn_rank:
            self.piece_positions[node] = (Player.BLACK, PieceType.PAWN)
    
    def get_pawn_moves(self, node, player):
        """Get valid pawn moves for a given node."""
        moves = []
        
        # Pawns move forward on file edges
        # Red pawns move up (increasing rank)
        # White pawns move diagonally between sections
        # Black pawns move down (decreasing rank)
        
        for neighbor in self.graph.neighbors(node):
            edge_data = self.graph.get_edge_data(node, neighbor)
            if edge_data and edge_data.get('edge_type') == EdgeType.FILE.value:
                file_from = node[0]
                rank_from = int(node[1:])
                file_to = neighbor[0]
                rank_to = int(neighbor[1:])
                
                # Check direction based on player
                if player == Player.RED:
                    # Red moves up (increasing rank generally)
                    if rank_to > rank_from or (rank_from == 4 and (rank_to == 5 or rank_to == 9)):
                        moves.append(neighbor)
                elif player == Player.WHITE:
                    # White moves from middle section
                    if (rank_from in [5,6,7,8] and rank_to < rank_from) or (rank_from == 5 and rank_to == 9):
                        moves.append(neighbor)
                elif player == Player.BLACK:
                    # Black moves down (decreasing rank generally)
                    if rank_to < rank_from or (rank_from == 9 and (rank_to == 5 or rank_to == 4)):
                        moves.append(neighbor)
        
        # Filter out moves blocked by pieces
        valid_moves = []
        for move in moves:
            if move not in self.piece_positions:
                valid_moves.append(move)
        
        return valid_moves
    
    def get_rook_moves(self, node):
        """Get valid rook moves using ray casting."""
        moves = []
        
        if node in self.rook_ray_dict:
            for ray in self.rook_ray_dict[node]:
                for square in ray:
                    if square in self.piece_positions:
                        # Can capture if enemy piece
                        piece_player, _ = self.piece_positions[square]
                        if piece_player != self.current_player:
                            moves.append(square)
                        break  # Ray is blocked
                    else:
                        moves.append(square)
        
        return moves
    
    def get_bishop_moves(self, node):
        """Get valid bishop moves using ray casting."""
        moves = []
        
        if node in self.bishop_ray_dict:
            for ray in self.bishop_ray_dict[node]:
                for square in ray:
                    if square in self.piece_positions:
                        # Can capture if enemy piece
                        piece_player, _ = self.piece_positions[square]
                        if piece_player != self.current_player:
                            moves.append(square)
                        break  # Ray is blocked
                    else:
                        moves.append(square)
        
        return moves
    
    def get_knight_moves(self, node):
        """Get valid knight moves."""
        moves = []
        
        if node in self.knight_hop_dict:
            for square in self.knight_hop_dict[node]:
                if square in self.piece_positions:
                    piece_player, _ = self.piece_positions[square]
                    if piece_player != self.current_player:
                        moves.append(square)
                else:
                    moves.append(square)
        
        return moves
    
    def get_queen_moves(self, node):
        """Queen moves like rook + bishop."""
        return self.get_rook_moves(node) + self.get_bishop_moves(node)
    
    def get_king_moves(self, node):
        """King moves one square in any direction."""
        moves = []
        
        # King can move to any adjacent node (rank, file, or diagonal)
        for neighbor in self.graph.neighbors(node):
            if neighbor in self.piece_positions:
                piece_player, _ = self.piece_positions[neighbor]
                if piece_player != self.current_player:
                    moves.append(neighbor)
            else:
                moves.append(neighbor)
        
        return moves
    
    def get_valid_moves(self, node):
        """Get all valid moves for the piece at the given node."""
        if node not in self.piece_positions:
            return []
        
        player, piece_type = self.piece_positions[node]
        
        if player != self.current_player:
            return []
        
        if piece_type == PieceType.PAWN:
            return self.get_pawn_moves(node, player)
        elif piece_type == PieceType.ROOK:
            return self.get_rook_moves(node)
        elif piece_type == PieceType.BISHOP:
            return self.get_bishop_moves(node)
        elif piece_type == PieceType.KNIGHT:
            return self.get_knight_moves(node)
        elif piece_type == PieceType.QUEEN:
            return self.get_queen_moves(node)
        elif piece_type == PieceType.KING:
            return self.get_king_moves(node)
        
        return []
    
    def handle_click(self, pos):
        """Handle mouse click on the board."""
        clicked_node = None
        
        # Find which node was clicked
        for node_name, cell in self.cells.items():
            if cell.is_in(pos):
                clicked_node = node_name
                break
        
        if not clicked_node:
            # Clicked outside, deselect
            self.selected_node = None
            self.possible_moves = []
            return
        
        # If we have a selected piece and clicked on a valid move
        if self.selected_node and clicked_node in self.possible_moves:
            # Move the piece
            self.piece_positions[clicked_node] = self.piece_positions[self.selected_node]
            del self.piece_positions[self.selected_node]
            
            # Change turn
            current_idx = self.turn_order.index(self.current_player)
            self.current_player = self.turn_order[(current_idx + 1) % 3]
            
            # Clear selection
            self.selected_node = None
            self.possible_moves = []
        
        # If clicked on a piece of the current player
        elif clicked_node in self.piece_positions:
            player, _ = self.piece_positions[clicked_node]
            if player == self.current_player:
                self.selected_node = clicked_node
                self.possible_moves = self.get_valid_moves(clicked_node)
            else:
                self.selected_node = None
                self.possible_moves = []
        else:
            self.selected_node = None
            self.possible_moves = []
    
    def update(self, events, mouse_pos):
        """Update game state."""
        # Update hover states
        for cell in self.cells.values():
            cell.hover = False
            cell.selected = False
            cell.highlighted = False
        
        # Find hovered cell
        for node_name, cell in self.cells.items():
            if cell.is_in(mouse_pos):
                cell.hover = True
                break
        
        # Update selected and highlighted cells
        if self.selected_node and self.selected_node in self.cells:
            self.cells[self.selected_node].selected = True
        
        for move in self.possible_moves:
            if move in self.cells:
                self.cells[move].highlighted = True
        
        # Handle events
        for event in events:
            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Left click
                    self.handle_click(mouse_pos)
    
    def draw(self, window):
        """Draw the game."""
        # Draw all cells
        for node_name in sorted(self.cells.keys()):
            cell = self.cells[node_name]
            piece = self.piece_positions.get(node_name)
            cell.draw(window, piece)
        
        # Draw a cleaner current player indicator
        player_colors = {
            Player.RED: (214, 21, 65),
            Player.WHITE: (80, 80, 80),  # Grey for better visibility
            Player.BLACK: (20, 20, 20)
        }
        player_names = {
            Player.RED: "Red",
            Player.WHITE: "White",
            Player.BLACK: "Black"
        }
        
        # Draw turn indicator in a subtle box
        color = player_colors[self.current_player]
        name = player_names[self.current_player]
        
        # Create a semi-transparent background box
        indicator_surface = pygame.Surface((150, 40))
        indicator_surface.set_alpha(200)
        indicator_surface.fill((255, 255, 255))
        window.blit(indicator_surface, (20, 20))
        
        txt = self.font.render(f"{name} to move", True, color)
        window.blit(txt, [30, 25])

def main():
    pygame.init()
    window = pygame.display.set_mode([WIDTH, HEIGHT])
    clock = pygame.time.Clock()
    
    game = UnifiedChessGame()
    
    running = True
    while running:
        events = pygame.event.get()
        mouse_pos = pygame.mouse.get_pos()
        
        for event in events:
            if event.type == pygame.QUIT:
                running = False
        
        pygame.display.set_caption("3Chess")
        
        # Use a dark background that complements the green/beige board
        window.fill((25, 25, 25))  # Dark grey
        game.update(events, mouse_pos)
        game.draw(window)
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()

if __name__ == "__main__":
    main()