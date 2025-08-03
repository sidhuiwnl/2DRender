from manim import *

class AnimationScene(Scene):
    def construct(self):
        vertices = [
            [0, 0, 0],
            [1, 2, 0],
            [2, 0, 0]
        ]
        triangle = Polygon(*vertices, color=BLUE, fill_opacity=0.5)
        self.play(Create(triangle))
        self.wait(1)