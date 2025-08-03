from manim import *

class AnimationScene(Scene):
    def construct(self):
        triangle = Triangle()
        self.play(Create(triangle))
        self.wait(1)