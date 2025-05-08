from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        self.wait(1)
        rectangle = Rectangle(width=4, height=4, color=GREEN)
        self.play(Transform(circle, rectangle))
        self.wait(1)