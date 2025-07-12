from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)