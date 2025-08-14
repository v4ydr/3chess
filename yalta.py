#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pygame
from math import radians, cos, sin, sqrt
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon

WIDTH, HEIGHT = 800, 800

cos30, sin30 = cos(radians(30)), sin(radians(30))
cos60, sin60 = cos(radians(60)), sin(radians(60))

"""
PAWNS = [
    [(0,1),(1,1),(2,1),(3,1),(5,3),(5,2),(5,1),(5,0)],
    [(8,5),(9,5),(10,5),(11,5),(1,7),(1,6),(1,5),(1,4)],
    [(),(),(),(),(),(),(),()],
]"""

def load_sprites():
    spritesheet = pygame.image.load("./yalta_pieces.png")
    
    pieces = [[],[],[]]
    
    for y in range(3):
        for x in range(6):
            pieces[y].append( pygame.transform.scale( spritesheet.subsurface([x*32, y*32, 32, 32]), [32,32]) )
    
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

"""
  1---2        ,.2.,
 /     \     1´ b c `3
6   o   3 -> | a o d |
 \     /     6  f e  4
  5---4       `·.5.·´

a = va
b = vb
c = vc
d = vd
e = ve
f = vf
"""

X, Y = 0,0

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
    font = pygame.font.SysFont("monospace", 20)
    
    #DARK = (209,137,70)
    #LIGHT = (255,205,158)
    
    DARK = (54,39,32)
    LIGHT = (229,210,170)
    
    def __init__(self, x, y, piece):
        self.x, self.y = x, y
        
        self.piece = piece
        
        self.hover = False
        self.points = None
        
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
        
        #self.txt = self.font.render(f"{'abcdefghijklmnopqrstuvwxyz'[self.x]},{self.y+1}", True, (0,0,0))
        self.txt = self.font.render(f"{self.x},{self.y}", True, (0,255,0))
        self.txt_size = [self.txt.get_width()/2, self.txt.get_height()/2]
    
    def draw(self, window):
        # GeoGebra
        # https://www.geogebra.org/geometry/nw4nmhda
        
        """
        pygame.draw.circle(window, (255,255,0), list(self.mid.int()), 5)
        
        for v in self.v123:
            pygame.draw.circle(window, (255,0,0), list((self.mid+v).int()), 3)
        
        for v in self.vabc:
            pygame.draw.circle(window, (0,255,0), list((self.mid+v).int()), 3)
        """
        
        if self.points:
            colour = self.colour
            
            
            if self.hover:
                colour = (150,150,150)
            
            pygame.draw.polygon(window, colour, self.points)
            
            if self.piece[0] >= 0:
                sprite = sprites[self.piece[0]][self.piece[1]]
                
                window.blit(sprite, [self.center.x-16, self.center.y-16])
            
            #window.blit(self.txt, [self.center.x-self.txt_size[0], self.center.y-self.txt_size[1]])
        
        
        """
        #a-d
        if x < 4:
            if y < 4:
                
                #if [x,y] == [X,Y]:
                #s1 -> left side
                #s2 -> right side
                #s1, s2 = (self.v6-self.v5)*0.5, (self.v4-self.v5)*0.5
                s1, s2 = self.v1*0.5, self.v3*0.5
                
                corner = self.mid + self.v5
                
                # U1 U2 -> line from left side of hexagon to internal branch
                #U1, U2 = self.mid + self.v5 + s1 * ratio_y, self.mid + self.ve * (1-ratio_y)
                
                # V1 V2 -> line from right side of hexagon to internal branch
                #V1, V2 = self.mid + self.v5 + s2 * ratio_x, self.mid + self.vf * (1-ratio_x)
                
                #U, V = (U2-U1), (V2-V1)
                
                #U1, U2 = (self.ve*ratio_y1 + s1*ratio_y1)*-1, (self.ve*ratio_y2 + s1*ratio_y2)*-1
                U1, U2 = self.vb*ratio_y1 - s1*ratio_y1 + s2, self.vb*ratio_y2 - s1*ratio_y2 + s2
                #V1, V2 = (self.vf*ratio_x1 + s2*ratio_x1)*-1, (self.vf*ratio_x2 + s2*ratio_x2)*-1
                
                p1 = s1*ratio_y1 + U1*ratio_x1
                p2 = s1*ratio_y1 + U1*ratio_x2
                p3 = s1*ratio_y2 + U2*ratio_x2
                p4 = s1*ratio_y2 + U2*ratio_x1
                
                p1, p2, p3, p4 = [list(corner+p) for p in [p1,p2,p3,p4]]
                
                pygame.draw.polygon(window, [(255,0,0),(0,255,0)][(x+y)%2], [p1,p2,p3,p4])
            """
    
    def is_in(self, pos, points):
        return Polygon(points).contains(Point(*pos))
        

class Game:
    colours = {
        "white": (251,239,226),
        "red": (214,21,65),
        "black": (120,77,58)
    }
    
    white = 0
    red = 1
    black = 2
    
    king = 0
    pawn = 1
    knight = 2
    bishop = 3
    rook = 4
    queen = 5
    
    
    PIECES = [
        [(white,  rook), (white,knight), (white,bishop), (white,queen),   (white,  rook), (white,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1   ,-1)],
        [(white,  pawn), (white,  pawn), (white,  pawn), (white, pawn),   (white,knight), (white,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1,   -1)],
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (white,bishop), (white,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1,   -1)],
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (white,  king), (white,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1,   -1)],
        
        [(  red,  rook), (  red,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (  red,  rook), (  red,knight), (red,bishop), (red,queen)],
        [(  red,knight), (  red,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (  red,  pawn), (  red,  pawn), (red,  pawn), (red, pawn)],
        [(  red,bishop), (  red,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1,   -1)],
        [(  red,  king), (  red,  pawn), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), ( -1,    -1), ( -1,   -1)],
        
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (black,  rook), (black,knight), (black,bishop), (black,queen),   (black,  rook), (black,  pawn), ( -1,    -1), ( -1,   -1)],
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (black,  pawn), (black,  pawn), (black,  pawn), (black, pawn),   (black,knight), (black,  pawn), ( -1,    -1), ( -1,   -1)],
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (black,bishop), (black,  pawn), ( -1,    -1), ( -1,   -1)],
        [(   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (   -1,    -1), (   -1,    -1), (   -1,    -1), (   -1,   -1),   (black,  king), (black,  pawn), ( -1,    -1), ( -1,   -1)]
    ]
    
    font = pygame.font.SysFont("monospace", 30)
    
    def __init__(self, archives=None):
        self.board = [[Cell(x, y, self.PIECES[y][x]) for x in range(12)] for y in range(12)]
        self.hover = None
        self.player = 0
        
        self.archives = archives if not archives is None else []
        
        if len(self.archives) == 0:
            self.record()
    
    def loop(self):
        events = pygame.event.get()
        
        mousePos = pygame.mouse.get_pos()
        
        foundHover = False
        
        self.hover = None
        
        for y in range(12):
            for x in range(12):
                cell = self.board[y][x]
                
                cell.hover = False
                
                if not foundHover and cell.points and cell.is_in(mousePos, cell.points):
                    foundHover = True
                    
                    cell.hover = True
                    self.hover = [x,y]
        
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    self.record()
                    
                    self.player += 1
                    self.player %= 3
                
                elif event.key == pygame.K_z and event.mod & pygame.KMOD_CTRL:
                    self.cancel()
                
                elif event.key == pygame.K_d:
                    print(len(self.archives))
                
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    if self.hover:
                        self.p1 = self.hover
                    
                    else:
                        self.p1 = None
            
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    if self.p1 and self.hover:
                        from_, to = self.board[self.p1[1]][self.p1[0]], self.board[self.hover[1]][self.hover[0]]
                        
                        if self.authorized(from_, to):
                            from_.piece, to.piece = (-1,-1), from_.piece
                        
                        self.p1 = None
    
    def display(self, window):
        for y in range(12):
            for x in range(12):
                self.board[y][x].draw(window)
        
        col = ['white', 'red', 'black'][self.player]
        txt = self.font.render(f"{col}'s turn", True, self.colours[col])
        
        window.blit(txt, [0,0])
    
    def record(self):
        self.archives.append(self.exp())
    
    def cancel(self):
        self.archives.pop()
        self.imp(self.archives[-1])
    
    def exp(self):
        string = ""
        
        lines = []
        
        for y in range(12):
            line = []
            
            for x in range(12):
                cell = self.board[y][x]
                
                line.append(f"{cell.piece[0]},{cell.piece[1]}")
            
            lines.append(".".join(line))
        
        lines = "/".join(lines)
        
        return lines+" "+str(self.player)
    
    def imp(self, board):
        fields = board.split(" ")
        
        self.__init__(self.archives)
        
        self.player = int(fields[1])
        
        lines = fields[0].split("/")
        for y in range(len(lines)):
            line = lines[y]
            
            cells = line.split(".")
            
            for x in range(len(cells)):
                cell = cells[x]
                values = cell.split(",")
                
                self.board[y][x].piece = (int(values[0]), int(values[1]))
    
    def authorized(self, from_, to):
        if from_.piece[0] == self.player:
            return True
        
        return False

if __name__ == "__main__":
    pygame.init()
    
    w = pygame.display.set_mode([WIDTH, HEIGHT])
    
    clock = pygame.time.Clock()
    
    game = Game()
    
    while True:
        pygame.display.set_caption("Yalta Chess - {:.2f}fps".format(clock.get_fps()))
        
        w.fill(0)
        
        game.loop()
        game.display(w)
        
        pygame.display.flip()
        
        clock.tick(60)