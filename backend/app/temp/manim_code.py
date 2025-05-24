from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle()
        rectangle = Rectangle(width=4.0, height=2.0)
        self.play(Create(circle))
        self.wait(0.5)
        self.play(Transform(circle, rectangle))
        self.wait(0.5)