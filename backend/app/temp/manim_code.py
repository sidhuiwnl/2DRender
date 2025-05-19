from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(color=BLUE, fill_opacity=0.5)
        rectangle = Rectangle(width=3, height=2, color=GREEN, fill_opacity=0.5)

        self.play(Create(circle))
        self.wait(1)

        self.play(Transform(circle, rectangle))
        self.wait(1)

        self.play(FadeOut(circle))
        self.wait(1)