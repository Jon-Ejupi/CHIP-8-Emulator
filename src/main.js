


class Chip8 {
  constructor(canvas) {

    this.memory = new Uint8Array(4096);
    this.v = new Uint8Array(16);
    this.i = 0;
    this.pc = 0x200;
    this.stack = [];
    this.sp = 0;
    this.delayTimer = 0; 
    this.soundTimer = 0; 
    this.display = new Array(32 * 64).fill(0);
    this.keys = new Array(16).fill(false);
    this.paused = false;
    this.speed = 1; 
     
   const fileInput = document.getElementById("romLoader");
    
    if (fileInput) {
      fileInput.addEventListener('change', (event) => { 
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();

        reader.onload = (e) => { 
          const arrayBuffer = e.target.result;
          const uArray = new Uint8Array(arrayBuffer);

          this.memory.fill(0, 0x200);

          for(let i = 0; i < uArray.length; i++) {
            this.memory[0x200 + i] = uArray[i];
          } 
        
          this.pc = 0x200;
          console.log("ROM Loaded Successfully! Play!");
        };
        
        reader.readAsArrayBuffer(file);
      })};

    this.fontset = [
       0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
       0x20, 0x60, 0x20, 0x20, 0x70, // 1
       0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
       0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
       0x90, 0x90, 0xF0, 0x10, 0x10, // 4
       0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
       0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
       0xF0, 0x10, 0x20, 0x40, 0x40, // 7
       0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
       0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
       0xF0, 0x90, 0xF0, 0x90, 0x90, // A
       0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
       0xF0, 0x80, 0x80, 0x80, 0xF0, // C
       0xE0, 0x90, 0x90, 0x90, 0xE0, // D
       0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
       0xF0, 0x80, 0xF0, 0x80, 0x80  // F

    ];

    for(let i = 0; i < this.fontset.length; i++) {
      this.memory[0x050 + i] = this.fontset[i];
    }

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "blue";
    this.canvas.width = 64 * 10;
    this.canvas.height = 32 * 10;
    this.pixelSize = 10;
  }
  
    
  
  loadProgram(program) {
    for(let i = 0; i < program.length; i++) {
      this.memory[0x200 + i] = program[i];
    }
      console.log("Program loaded into memory", program);
  }

  cycle() {
    const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];

     this.executeInstruction(opcode);

     if (this.delayTimer > 0) this.delayTimer--;
     if (this.soundTimer > 0) this.soundTimer--; 
  
  }
  executeInstruction(opcode) {
    console.log(`Execute opcode0x${opcode.toString(16).toUpperCase()}`);

    const x = (opcode & 0X0F00) >> 8;
    const y = (opcode & 0x00F0) >> 4;
    const kk = opcode & 0x00FF;
    const nnn = opcode & 0x0FFF;
    const n = opcode & 0x000F;
    const key = this.v[x];
    this.pc += 2;

    switch (opcode & 0xF000) {
      case 0x0000: 
        if (opcode === 0x00E0) {
           console.log('00E0 - Clear the display');
           this.display.fill(0);
        } else if(opcode === 0x00EE) {
           this.pc = this.stack.pop();
        }
        break;
      case 0x1000:
        console.log(`1NNN - Jump to Address 0x${nnn.toString(16)}`)
        this.pc = nnn;
        break;
      case 0x2000: 
        this.stack.push(this.pc);
        this.pc = nnn;
        break;
      case 0x3000:
        if(this.v[x] === kk) this.pc += 2;
        break;
      case 0x4000: 
        if (this.v[x] !== kk) this.pc += 2;
        break;
      case 0x5000:
        if ((opcode & 0x000F) === 0 && this.v[x] === this.v[y]) this.pc += 2;
        break;
      case 0x6000:
        console.log(`6XKK - Set V${x} = 0x${kk.toString(16).toUpperCase()}`);
        this.v[x] = kk;
        break;
      case 0x7000:
        this.v[x] = (this.v[x] + kk) & 0xFF;
        break;
      case 0x8000:
        switch(n) {
          case 0x0: this.v[x] = this.v[y]; break;
          case 0x1: this.v[x] |= this.v[y]; break;
          case 0x2: this.v[x] &= this.v[y]; break;
          case 0x3: this.v[x] ^= this.v[y]; break;
          case 0x4:
            const sum = this.v[x] + this.v[y];
            this.v[0xF] = sum > 0xFF ? 1 : 0;
            this.v[x] = sum & 0xFF;
            break;
          case 0x5:
            this.v[0xF] = this.v[x] >= this.v[y] ? 1 : 0;
            this.v[x] = (this.v[x] - this.v[y]) & 0xFF;
            break;
          case 0x6:
            this.v[0xF] = this.v[x] & 0x1;
            this.v[x] = this.v[x] >> 1;
            break;
          case 0x7:
            this.v[0xF] = this.v[y] >= this.v[x] ? 1 : 0;
            this.v[x] = (this.v[y] - this.v[x]) & 0xFF;
            break;
          case 0xE:
            this.v[0xF] = (this.v[x] & 0x80) >> 7;
            this.v[x] = (this.v[x] << 1) & 0xFF;
            break;
          
        }
        break;
        
      case 0x9000:
        if (this.v[x] !== this.v[y]) this.pc += 2;
        break; 
      case 0xA000:
         console.log(`ANNN - Set I = 0x${nnn.toString(16).toUpperCase()}`);
         this.i = nnn;
         break;
      case 0xB000:
        this.pc = nnn + this.v[0]
        break;
      case 0xC000:
        const randomByte = Math.floor(Math.random() * 256);
        this.v[x] = randomByte & kk;
        break;
      case 0xD000:
                      
                      
                      const vx = this.v[x];
                      const vy = this.v[y];
                      const height = n;
                      console.log('D000 - Draw sprite at (Vx, Vy) with width 8 and height N', {x, y, vx, vy, height});

                      this.v[0xF] = 0; 
                      for (let row = 0; row < height; row++) {
                          const sprite = this.memory[this.i + row];
                          for (let col = 0; col < 8; col++) {
                              const pixel = (sprite >> (7 - col)) & 1;
                              const index = ((vy + row) % 32) * 64 + ((vx + col) % 64);

                              if (pixel && this.display[index] === 1) {
                                  this.v[0xF] = 1; 
                              }
                              this.display[index] ^= pixel;
                          }
                      }
                      break;
            case 0xE000:
            if (kk === 0x9E) {
              if (this.keys[this.v[x]] === 1 || this.keys[this.v[x]] === true) this.pc += 2;
            } else if (kk === 0xA1) {
              if (!this.keys[this.v[x]]) this.pc += 2;
            }
            break;
            case 0xF000:
              switch(kk) {
                case 0x07:
                  this.v[x] = this.delayTimer;
                  break;
                case 0x0A: {
                  let keyPressed = false;
                  for (let i = 0; i < 16; i++) {
                    if (this.keys[i] === true) {
                      this.v[x] = i;
                      keyPressed = true;
                      break;
                    }
                  }
                  if (!keyPressed) {
                    this.pc -= 2;
                  }
                  break;
                }
              case 0x15:
                this.delayTimer = this.v[x];
                break;
              case 0x18:
                this.soundTimer = this.v[x];
                break;
              case 0x1E:
                this.i = this.i + this.v[x];
                break;
              case 0x29:
                let characters = this.v[x] & 0x0F;
                this.i = characters * 5;
                break;
              case 0x33:
                let value = this.v[x];
                let hundreds = Math.floor(value / 100);
                let tens = Math.floor((value / 10) % 10);
                let ones = value % 10;

                this.memory[this.i] = hundreds;
                this.memory[this.i + 1] = tens;
                this.memory[this.i + 2] = ones; 
                break;
              case 0x55:
                   for (let idx = 0; idx <= x; idx++) {

                      this.memory[this.i + idx] = this.v[idx];
                  }
                 this.i = (this.i + x + 1) & 0xFFFF;
                  break;
              case 0x65:
                for (let idx = 0; idx <= x; idx++) {
                  this.v[idx] = this.memory[this.i + idx];
                }
               this.i = (this.i + x + 1) & 0xFFFF;
                break;
              }
        
      default:
        console.warn(`Unknown opcode: 0x${opcode.toString(16).toUpperCase()}`);

    }
  }


render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "blue";
    
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 64; x++) {
        if (this.display[y * 64 + x] === 1) {
          this.context.fillRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
          );
        }
      } // Closes the x loop
    } // Closes the y loop
  } // Closes the render method (Make sure there is only ONE brace here!)
}



const canvas = document.getElementById("chip-8");
const chip8 = new Chip8(canvas);
  
const getX = (offset, position) => offset + position * 5;

   const program = [
    0x12, 0x00
   ]
      chip8.loadProgram(program);

      console.log(`Initial PC = 0x${chip8.pc.toString(16).toUpperCase()}`);

      // Run the emulator (example loop)
      function run() {
          for (let i = 0; i < chip8.speed; i++) {
              chip8.cycle();
          }
          chip8.render();
          requestAnimationFrame(run);
          // console.log(chip8.pc);
          console.log('PC = 0x' + chip8.pc.toString(16).toUpperCase());
      }

      run();