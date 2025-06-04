from manim import *

class AnimationScene(Scene):
    def construct(self):
        rectangle = Rectangle(width=4, height=3)
        triangle = Triangle(color=YELLOW).scale(1.5)
        triangle.move_to(rectangle.get_top(), aligned_edge=DOWN)

        self.play(Create(rectangle))
        self.play(Create(triangle))
        self.wait(1)
        self.play(
            rectangle.animate.shift(DOWN),
            triangle.animate.shift(UP)
        )
        self.wait(1)