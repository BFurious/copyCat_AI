document.addEventListener("DOMContentLoaded", function () {
    const cells = document.querySelectorAll("td");
  
    cells.forEach((cell) => {
      // Create a tooltip element
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = cell.textContent;
      cell.appendChild(tooltip);
  
      // Show tooltip on hover
      cell.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
      });
  
      // Hide tooltip when not hovering
      cell.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    });
  });