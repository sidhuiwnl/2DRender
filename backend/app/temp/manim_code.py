from manim import *

class AnimationScene(Scene):
    def construct(self):
        question = Text("Is it raining?", font_size=36)
        yes_answer = Text("Yes", font_size=24)
        no_answer = Text("No", font_size=24)
        umbrella = Text("Take umbrella", font_size=24)
        sunglasses = Text("Wear sunglasses", font_size=24)

        self.play(Write(question))
        self.wait(1)

        yes_answer.next_to(question, DOWN + LEFT, buff=2)
        no_answer.next_to(question, DOWN + RIGHT, buff=2)

        self.play(Write(yes_answer), Write(no_answer))

        line_yes = Line(question.get_bottom(), yes_answer.get_top())
        line_no = Line(question.get_bottom(), no_answer.get_top())

        self.play(Create(line_yes), Create(line_no))

        umbrella.next_to(yes_answer, DOWN, buff=2)
        sunglasses.next_to(no_answer, DOWN, buff=2)

        self.play(Write(umbrella), Write(sunglasses))

        line_umbrella = Line(yes_answer.get_bottom(), umbrella.get_top())
        line_sunglasses = Line(no_answer.get_bottom(), sunglasses.get_top())

        self.play(Create(line_umbrella), Create(line_sunglasses))

        self.wait(2)