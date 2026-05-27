## Chip-8 Emulator in Browser with Vanilla JavaScript.
Build specificly for browsers and the client side with Vanilla JS.
This is a Chip-8 Emulator from the late 1970s and early 1980s.

## History:
Chip-8 was an interpreted programming language and virtual machine build for early micro-computers with 4kb system memory, and vary low specifications like COSMAC VIP, DREAM 6800, ETI 660, for creating early computer games like early Pong, Space Invaders, Breakout among others. 

# Other versions:
The Chip-48 and Super-Chip48 made for the HP-48 calculator, among other Interpreters like for systems like Windows 3.1, MS-DOS, Amiga among others.

## Specifications:
The system has 4kb aprox. 4096 bites or RAM.
The system starts at 0x000 and until 0xFFF, the first 0x200 are reserved for the Interpreter from 0x000 to 0x200. the rest of RAM can be used for games.
Chip-8 has 16 general purpose 8-bit registers, usually referred to as Vx, where x is a hexadecimal digit (0 through F). There is also a 16-bit register called I. This register is generally used to store memory addresses, so only the lowest (rightmost) 12 bits are usually used.

The VF register should not be used by any program, as it is used as a flag by some instructions. See section 3.0, Instructions for details.

Chip-8 also has two special purpose 8-bit registers, for the delay and sound timers. When these registers are non-zero, they are automatically decremented at a rate of 60Hz. See the section 2.5, Timers & Sound, for more information on these.

There are also some "pseudo-registers" which are not accessable from Chip-8 programs. The program counter (PC) should be 16-bit, and is used to store the currently executing address. The stack pointer (SP) can be 8-bit, it is used to point to the topmost level of the stack.

The stack is an array of 16 16-bit values, used to store the address that the interpreter shoud return to when finished with a subroutine. Chip-8 allows for up to 16 levels of nested subroutines.

# For more info: (http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#1.0)
# For testing: (https://github.com/kripod/chip8-roms)
# Link to my Emulator: (https://jon-ejupi.github.io/CHIP-8-Emulator/)

Thank you vary much by Jon-Ejupi