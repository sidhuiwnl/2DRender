from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle), run_time=2)
        self.wait(1)
        self.play(circle.animate.shift(RIGHT * 3), run_time=2)
        self.wait(1)
        self.play(Uncreate(circle), run_time=2)
        self.wait(1)