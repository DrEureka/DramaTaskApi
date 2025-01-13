const colors = ["#3CC157", "#2AA7FF", "#FCBC0F"];
const numBalls = 25;
const balls = [];

for (let i = 0; i < numBalls; i++) {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];
  ball.style.left = `${Math.random() * 90}vw`;
  ball.style.top = `${Math.random() * 90}vh`;
  ball.style.transform = `scale(${Math.random()})`;
  ball.style.width = `${Math.random()}em`;
  ball.style.height = ball.style.width;

  balls.push(ball);
  document.body.append(ball);
}

balls.forEach((el, i) => {
  let to = {
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5,
  };

  el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${to.x}rem, ${to.y}rem)` },
    ],
    {
      duration: (Math.random() + 1) * 2000,
      direction: "alternate",
      fill: "both",
      iterations: Infinity,
      easing: "ease-in-out",
    }
  );
});
