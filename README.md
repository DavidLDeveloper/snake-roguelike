# Snake Roguelike

Concept project combining the classic snake game with "rogue-like" elements.

## Demo

Demo is available [here](https://snake-roguelike.surge.sh).

## Game Play

- Eating a food `*` increases score and length by 1.
- Eating treasure `$` increaess score by 1.
- Eating a potion `!` applies one effect at random:
- - **Speed:** increase movement speed 8% and apply +1 multiplier to score when eating food or treasure.
- - **Wealth:** spawn 4 treasures.
- - **Shrinking:** remove 5 segments from the end of snake.
- Stairs `>`, potion, and treasure appear after 5 food are eaten on each level instead of a new food. Moving onto stair will clear room and move to next level.

## Todo

Buttons on mobile doesn't feel very good. Need to come up with a better control mechanism.
