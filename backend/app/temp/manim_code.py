from manim import *

class AnimationScene(Scene):
    def construct(self):
        rectangle = Rectangle(width=6, height=4)
        circle = Circle(radius=0.5)
        circle.move_to(rectangle.get_top())

        self.add(rectangle, circle)

        dt = 0.01
        gravity = 0.5
        damping = 0.8
        velocity = [0, 0]
        position = circle.get_center()

        def update_circle(mob, dt):
            nonlocal velocity, position

            velocity[1] += gravity * dt
            position = mob.get_center()
            new_x = position[0] + velocity[0] * dt
            new_y = position[1] + velocity[1] * dt

            if new_y - circle.radius < rectangle.get_bottom()[1]:
                new_y = rectangle.get_bottom()[1] + circle.radius
                velocity[1] *= -damping
            if new_y + circle.radius > rectangle.get_top()[1]:
                new_y = rectangle.get_top()[1] - circle.radius
                velocity[1] *= -damping
            if new_x - circle.radius < rectangle.get_left()[1]:
                new_x = rectangle.get_left()[1] + circle.radius
                velocity[0] *= -damping
            if new_x + circle.radius > rectangle.get_right()[1]:
                new_x = rectangle.get_right()[1] - circle.radius
                velocity[0] *= -damping

            mob.move_to([new_x, new_y, 0])

        circle.add_updater(update_circle)
        self.play(AnimationGroup(
            Create(rectangle),
            Create(circle)
        ))
        self.wait(10)
        circle.remove_updater(update_circle)