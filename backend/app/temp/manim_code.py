from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(radius=2)
        self.play(Create(circle))
        self.wait(1)