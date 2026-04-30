function launchConfetti() {
  const colors = [
    "#ff4d4d",
    "#22c55e",
    "#3b82f6",
    "#facc15",
    "#a855f7",
    "#ec4899",
  ];

  const shapes = ["circle", "square", "triangle"];

  for (let i = 0; i < 100; i++) {
    const el = document.createElement("div");

    const size = Math.random() * 10 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    el.style.position = "fixed";
    el.style.top = "50vh";
    el.style.left = "50vw";
    el.style.zIndex = 999999;

    if (shape === "circle") {
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.borderRadius = "50%";
      el.style.background = color;
    } else if (shape === "square") {
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.background = color;
    } else {
      el.style.width = "0";
      el.style.height = "0";
      el.style.borderLeft = size / 2 + "px solid transparent";
      el.style.borderRight = size / 2 + "px solid transparent";
      el.style.borderBottom = size + "px solid " + color;
    }

    document.body.appendChild(el);

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 400 + 150;
    const rotate = Math.random() * 720;
    const duration = 1200 + Math.random() * 800;

    el.animate(
      [
        {
          transform: `translate(-50%, -50%) scale(1)`,
          opacity: 1,
        },
        {
          transform: `
            translate(
              calc(-50% + ${Math.cos(angle) * distance}px),
              calc(-50% + ${Math.sin(angle) * distance}px)
            )
            rotate(${rotate}deg)
            scale(0.6)
          `,
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "ease-out",
      }
    );

    setTimeout(() => el.remove(), duration);
  }
}