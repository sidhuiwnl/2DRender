from manim import *

class AnimationScene(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        triangle = Triangle(side_length=4, color=GREEN)
        triangle.move_to(circle.get_center())

        self.play(Create(circle))
        self.wait(1)

        self.play(Transform(circle, triangle))
        self.wait(1)

        self.play(FadeOut(circle))
        self.wait(1)