"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Hole {
  x: number;
  y: number;
  radius: number;
  par: number;
}

interface Course {
  holes: Hole[];
  obstacles: { x: number; y: number; width: number; height: number }[];
}

const COURSES: Course[] = [
  {
    holes: [
      { x: 350, y: 100, radius: 15, par: 3 },
      { x: 100, y: 200, radius: 15, par: 4 },
      { x: 250, y: 50, radius: 15, par: 3 },
      { x: 50, y: 300, radius: 15, par: 5 },
      { x: 380, y: 250, radius: 15, par: 4 },
      { x: 200, y: 350, radius: 15, par: 3 },
      { x: 150, y: 80, radius: 15, par: 4 },
      { x: 320, y: 320, radius: 15, par: 3 },
      { x: 80, y: 150, radius: 15, par: 5 },
      { x: 300, y: 180, radius: 15, par: 4 },
      { x: 180, y: 280, radius: 15, par: 3 },
      { x: 360, y: 60, radius: 15, par: 4 },
      { x: 120, y: 350, radius: 15, par: 5 },
      { x: 280, y: 120, radius: 15, par: 3 },
      { x: 40, y: 80, radius: 15, par: 4 },
      { x: 340, y: 300, radius: 15, par: 3 },
      { x: 160, y: 160, radius: 15, par: 4 },
      { x: 220, y: 220, radius: 15, par: 5 }
    ],
    obstacles: [
      { x: 150, y: 150, width: 40, height: 20 },
      { x: 280, y: 200, width: 30, height: 30 },
      { x: 100, y: 100, width: 25, height: 40 }
    ]
  }
];

export default function GolfGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState<Ball>({ x: 200, y: 350, vx: 0, vy: 0, radius: 8 });
  const [currentHole, setCurrentHole] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState({ x: 0, y: 0 });
  const [aimEnd, setAimEnd] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const animationRef = useRef<number>();

  const course = COURSES[0];
  const hole = course.holes[currentHole];

  const resetBallPosition = useCallback(() => {
    const startPositions = [
      { x: 200, y: 350 }, { x: 350, y: 350 }, { x: 50, y: 350 },
      { x: 200, y: 50 }, { x: 50, y: 50 }, { x: 350, y: 50 },
      { x: 200, y: 200 }, { x: 100, y: 300 }, { x: 300, y: 100 },
      { x: 150, y: 250 }, { x: 250, y: 150 }, { x: 300, y: 300 },
      { x: 100, y: 100 }, { x: 350, y: 200 }, { x: 50, y: 200 },
      { x: 200, y: 100 }, { x: 100, y: 50 }, { x: 300, y: 350 }
    ];
    
    const startPos = startPositions[currentHole] || { x: 200, y: 350 };
    setBall({ x: startPos.x, y: startPos.y, vx: 0, vy: 0, radius: 8 });
    setIsMoving(false);
  }, [currentHole]);

  useEffect(() => {
    resetBallPosition();
  }, [currentHole, resetBallPosition]);

  const checkCollision = useCallback((newX: number, newY: number): boolean => {
    // Check canvas boundaries
    if (newX < 8 || newX > 392 || newY < 8 || newY > 392) return true;

    // Check obstacle collisions
    for (const obstacle of course.obstacles) {
      if (
        newX - 8 < obstacle.x + obstacle.width &&
        newX + 8 > obstacle.x &&
        newY - 8 < obstacle.y + obstacle.height &&
        newY + 8 > obstacle.y
      ) {
        return true;
      }
    }

    return false;
  }, [course.obstacles]);

  const updateBall = useCallback(() => {
    setBall(prevBall => {
      if (Math.abs(prevBall.vx) < 0.1 && Math.abs(prevBall.vy) < 0.1) {
        setIsMoving(false);
        return { ...prevBall, vx: 0, vy: 0 };
      }

      let newX = prevBall.x + prevBall.vx;
      let newY = prevBall.y + prevBall.vy;
      let newVx = prevBall.vx;
      let newVy = prevBall.vy;

      // Check collisions and bounce
      if (checkCollision(newX, prevBall.y)) {
        newVx = -newVx * 0.7;
        newX = prevBall.x;
      }
      if (checkCollision(prevBall.x, newY)) {
        newVy = -newVy * 0.7;
        newY = prevBall.y;
      }

      // Apply friction
      newVx *= 0.98;
      newVy *= 0.98;

      // Check if ball is in hole
      const distanceToHole = Math.sqrt(
        Math.pow(newX - hole.x, 2) + Math.pow(newY - hole.y, 2)
      );

      if (distanceToHole < hole.radius - 5) {
        // Ball is in hole!
        setIsMoving(false);
        setScores(prev => [...prev, strokes + 1]);
        setTotalStrokes(prev => prev + strokes + 1);
        
        if (currentHole < 17) {
          setCurrentHole(prev => prev + 1);
          setStrokes(0);
        } else {
          setGameComplete(true);
        }
        
        return { ...prevBall, vx: 0, vy: 0 };
      }

      return { x: newX, y: newY, vx: newVx, vy: newVy, radius: prevBall.radius };
    });
  }, [checkCollision, hole, strokes, currentHole]);

  useEffect(() => {
    if (isMoving) {
      const animate = () => {
        updateBall();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving, updateBall]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMoving) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsAiming(true);
    setAimStart({ x, y });
    setAimEnd({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAiming) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setAimEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (!isAiming) return;
    
    const power = Math.min(Math.sqrt(
      Math.pow(aimEnd.x - aimStart.x, 2) + Math.pow(aimEnd.y - aimStart.y, 2)
    ) / 20, 15);
    
    const angle = Math.atan2(aimEnd.y - aimStart.y, aimEnd.x - aimStart.x);
    
    setBall(prev => ({
      ...prev,
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power
    }));
    
    setStrokes(prev => prev + 1);
    setIsMoving(true);
    setIsAiming(false);
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas with green background
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, 400, 400);

    // Draw obstacles
    ctx.fillStyle = '#8b5cf6';
    course.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw hole
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw hole number
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentHole + 1}`, hole.x, hole.y + 4);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw aim line
    if (isAiming) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(aimStart.x, aimStart.y);
      ctx.lineTo(aimEnd.x, aimEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [ball, hole, currentHole, course.obstacles, isAiming, aimStart, aimEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx);
  }, [draw]);

  const resetGame = () => {
    setCurrentHole(0);
    setStrokes(0);
    setTotalStrokes(0);
    setScores([]);
    setGameComplete(false);
    resetBallPosition();
  };

  const getScoreText = (holeStrokes: number, par: number) => {
    const diff = holeStrokes - par;
    if (diff <= -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    return `+${diff}`;
  };

  if (gameComplete) {
    const totalPar = course.holes.reduce((sum, h) => sum + h.par, 0);
    const scoreDiff = totalStrokes - totalPar;
    
    return (
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Course Complete!</h2>
        <div className="text-center space-y-2">
          <p className="text-lg">Total Strokes: {totalStrokes}</p>
          <p className="text-lg">Par: {totalPar}</p>
          <p className="text-xl font-semibold">
            Score: {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
          </p>
        </div>
        <div className="max-h-40 overflow-y-auto w-full">
          <h3 className="font-semibold mb-2">Hole by Hole:</h3>
          {scores.map((score, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>Hole {index + 1} (Par {course.holes[index].par}):</span>
              <span>{score} ({getScoreText(score, course.holes[index].par)})</span>
            </div>
          ))}
        </div>
        <Button onClick={resetGame} className="mt-4">
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          Hole {currentHole + 1} of 18 (Par {hole.par})
        </h2>
        <div className="flex justify-center space-x-4 text-sm">
          <span>Current Hole: {strokes} strokes</span>
          <span>Total: {totalStrokes + strokes} strokes</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-2 border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Click and drag to aim, release to shoot
        </p>
        <Button 
          onClick={resetBallPosition} 
          variant="outline"
          disabled={isMoving}
        >
          Reset Ball Position
        </Button>
      </div>
    </div>
  );
}