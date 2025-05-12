from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(color=BLUE)
        self.play(Create(circle))
        self.wait(1)
        self.play(circle.animate.shift(LEFT * 2))
        self.wait(1)
        self.play(FadeOut(circle))
        self.wait(1)