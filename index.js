const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissor = document.getElementById("scissor");

canvas.width = innerWidth;
canvas.height = innerHeight;

let items = [];
let particles = [];

class Item {
    constructor(x, y, radius, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = 1;
        this.type = type;
        this.velocity = {
            x: (Math.random() - 0.5),
            y: (Math.random() - 0.5)
        };
    }
    draw() {
        c.fillStyle = 'black';
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.stroke();
        if(this.type == 'rock') {
            c.drawImage(rock, this.x - this.radius*1.185, this.y - this.radius*2.20, 
                this.radius*2.43, this.radius*4.4);
        }
        else if(this.type == 'paper') {
            c.drawImage(paper, this.x - this.radius*1.185, this.y - this.radius*1.95, 
                this.radius*2.39, this.radius*3.92);
        }
        else if(this.type == 'scissor') {
            c.drawImage(scissor, this.x - this.radius*1.18, this.y - this.radius*1.958, 
                this.radius*2.36, this.radius*3.92);
        }
    }
    update() {
        this.draw();

        if(this.x < this.radius/2 || this.x  > canvas.width - this.radius/2) {
 
            this.velocity.x = -1*this.velocity.x;
        }
        else if(this.y  < this.radius/2  || this.y  > canvas.height - this.radius/2) {
            this.velocity.y = -1*this.velocity.y;
        }

        for(let i = 0; i < items.length; i++) {
            if(this !== items[i]) {
                if(distance(this.x, this.y, items[i].x, items[i].y) - this.radius*2 < 0) {
                    resolveCollision(this, items[i]);
                }
            }
        }

        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, velocity, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -=0.01;
    }
}

function drawBg()
{
    c.save();
    c.globalAlpha=0.5;
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.restore();
}

function spawnItems() {
    const radius = Math.sqrt(canvas.width*canvas.height)/25;
    for(let i = 0; i < 50; i++)
    {
        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, canvas.height - radius);

        if( i!== 0) {
            for(let j = 0; j < items.length; j++) {
                if(distance(x, y, items[j].x, items[j].y) - radius*2 < 0) {
                    x = randomIntFromRange(radius, canvas.width - radius);
                    y = randomIntFromRange(radius, canvas.height - radius);
                    j = -1;
                }
            }
        }
        
        let z = randomIntFromRange(1, 3);
        if(z == 1) {
            type = 'rock';
        }
        else if (z == 2) {
            type = 'paper';
        }
        else if (z == 3) {
            type = 'scissor';
        }

        items.push(new Item(x, y, radius, type));
    }
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    drawBg();
    items.forEach((Item) => {
        Item.update();
    });
    particles.forEach((particle, index) => {
        if(particle.alpha <=0) {
            particles.splice(index, 1);
        }
        else {
            particle.update();
        }
    });
    
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height/2,
        event.clientX - canvas.width/2);
    const velocity = {
        x:Math.cos(angle) * 5,
        y:Math.sin(angle) * 5
    };

    //making particles
    for(let i = 1; i < 10; i++)
    {

        particles.push(new Particle(event.clientX, event.clientY,
            Math.random() * 2 + 1, {x: 2*(Math.random() - 0.5), y: 2*(Math.random() - 0.5)}, `hsl(0, 0%, ${Math.random() * 90 + 10}%)`));
    }

    for(let i = 0; i < items.length; i++) {
        if(Math.abs(event.clientY - items[i].y + items[i].radius/2) < items[i].radius*5 & Math.abs(event.clientX - items[i].x + items[i].radius/2) < items[i].radius*5) {
            const angle = Math.atan2(
                event.clientY - items[i].y + items[i].radius/2,
                event.clientX - items[i].x + items[i].radius/2);
            items[i].velocity.x = Math.cos(angle)/2;
            items[i].velocity.y = Math.sin(angle)/2;
        }
    }
})

spawnItems();
animate();
















function distance(x1, y1, x2, y2) {
    const xdist = x2 - x1;
    const ydist = y2 - y1;
    return Math.sqrt(Math.pow(xdist, 2) + Math.pow(ydist, 2));
}

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
} 

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }

    if(particle.type == 'rock' & otherParticle.type == 'scissor') {
        otherParticle.type = 'rock';
    }
    if(particle.type == 'paper' & otherParticle.type == 'rock') {
        otherParticle.type = 'paper';
    }
    if(particle.type == 'scissor' & otherParticle.type == 'paper') {
        otherParticle.type = 'scissor';
    }

    if(particle.type == 'scissor' & otherParticle.type == 'rock') {
        particle.type = 'rock';
    }
    if(particle.type == 'rock' & otherParticle.type == 'paper') {
        particle.type = 'paper';
    }
    if(particle.type == 'paper' & otherParticle.type == 'scissor') {
        particle.type = 'scissor';
    }
    

}