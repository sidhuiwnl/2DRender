from manim import *

class BinarySearchSimple(Scene):
    def construct(self):
        # Create a title
        title = Text("Binary Search", font_size=40)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Create a sorted array
        array = [10, 20, 30, 40, 50, 60, 70, 80, 90]
        target = 60  # The value we're searching for

        # Create rectangles to represent array elements
        squares = []
        numbers = []
        for i in range(len(array)):
            square = Square(side_length=0.8)
            square.set_stroke(WHITE, 2)
            number = Text(str(array[i]), font_size=30)
            number.move_to(square.get_center())
            squares.append(square)
            numbers.append(number)

        # Arrange squares in a row
        squares_group = VGroup(*squares).arrange(RIGHT, buff=0.1)

        # Create index labels
        indices = []
        for i in range(len(array)):
            index = Text(str(i), font_size=20)
            index.next_to(squares[i], DOWN, buff=0.3)
            indices.append(index)

        # Group everything
        array_group = VGroup(squares_group, VGroup(*numbers), VGroup(*indices))
        array_group.center()

        # Show the array
        self.play(
            Create(squares_group),
            Write(VGroup(*numbers)),
            Write(VGroup(*indices))
        )

        # Add instruction
        instruction = Text(f"Searching for {target}", font_size=30)
        instruction.to_edge(UP, buff=1)
        self.play(Write(instruction))
        self.wait(1)

        # Run binary search
        left = 0
        right = len(array) - 1

        # Create pointers
        left_arrow = Arrow(start=DOWN, end=UP, color=BLUE)
        left_arrow.next_to(squares[left], DOWN, buff=0.5)
        left_label = Text("left", font_size=20, color=BLUE)
        left_label.next_to(left_arrow, DOWN)

        right_arrow = Arrow(start=DOWN, end=UP, color=RED)
        right_arrow.next_to(squares[right], DOWN, buff=0.5)
        right_label = Text("right", font_size=20, color=RED)
        right_label.next_to(right_arrow, DOWN)

        # Add pointers to scene
        self.play(
            Create(left_arrow), Write(left_label),
            Create(right_arrow), Write(right_label)
        )

        # Binary search loop
        found = False
        while left <= right:
            # Calculate middle index
            mid = (left + right) // 2

            # Create middle pointer
            mid_arrow = Arrow(start=UP, end=DOWN, color=GREEN)
            mid_arrow.next_to(squares[mid], UP, buff=0.5)
            mid_label = Text("mid", font_size=20, color=GREEN)
            mid_label.next_to(mid_arrow, UP)

            # Add middle pointer
            self.play(
                Create(mid_arrow),
                Write(mid_label)
            )

            # Highlight current square
            self.play(squares[mid].animate.set_fill(YELLOW, opacity=0.5))

            # Compare with target
            comparison_text = None
            if array[mid] == target:
                comparison_text = Text(f"{array[mid]} = {target} (Found!)", color=GREEN, font_size=24)
                found = True
                found_index = mid
            elif array[mid] < target:
                comparison_text = Text(f"{array[mid]} < {target} (Go right)", color=BLUE, font_size=24)
                left = mid + 1
            else:
                comparison_text = Text(f"{array[mid]} > {target} (Go left)", color=RED, font_size=24)
                right = mid - 1

            # Show comparison
            comparison_text.to_edge(DOWN, buff=1)
            self.play(Write(comparison_text))
            self.wait(1)

            # Update pointers
            if array[mid] < target:  # Go right
                new_left_arrow = Arrow(start=DOWN, end=UP, color=BLUE)
                new_left_arrow.next_to(squares[left], DOWN, buff=0.5)
                self.play(
                    Transform(left_arrow, new_left_arrow),
                    left_label.animate.next_to(new_left_arrow, DOWN)
                )
            elif array[mid] > target:  # Go left
                new_right_arrow = Arrow(start=DOWN, end=UP, color=RED)
                new_right_arrow.next_to(squares[right], DOWN, buff=0.5)
                self.play(
                    Transform(right_arrow, new_right_arrow),
                    right_label.animate.next_to(new_right_arrow, DOWN)
                )

            # Cleanup
            self.play(
                squares[mid].animate.set_fill(opacity=0),
                FadeOut(mid_arrow),
                FadeOut(mid_label),
                FadeOut(comparison_text)
            )

            if found:
                break

        # Show final result
        if found:
            final_message = Text(f"Found {target} at index {found_index}!", font_size=36, color=GREEN)
            self.play(
                squares[found_index].animate.set_fill(GREEN, opacity=0.5),
                Flash(squares[found_index], color=GREEN, flash_radius=0.8)
            )
        else:
            final_message = Text(f"{target} not found in the array", font_size=36, color=RED)

        final_message.to_edge(DOWN, buff=1)
        self.play(Write(final_message))
        self.wait(2)

if __name__ == "__main__":
    # To render: manim -pql binary_search.py BinarySearchSimple
    pass