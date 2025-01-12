const textElement = document.querySelector('.text');
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
tooltip.textContent = textElement!.textContent;
document.querySelector('.container')?.appendChild(tooltip);

if(textElement){
textElement.addEventListener('mouseover', () => {
    tooltip.style.display = 'block';
});

textElement.addEventListener('mouseout', () => {
    tooltip.style.display = 'none';
});
}