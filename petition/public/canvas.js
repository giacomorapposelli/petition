(function() {
    let canvas = document.querySelector("canvas");
    let ctx = canvas.getContext("2d");
    let sign = document.getElementById("sign");
    let drawing;
       
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    canvas.addEventListener("mousedown", event => {
        drawing = true;
        ctx.moveTo(event.offsetX, event.offsetY);
    });
    
    canvas.addEventListener("mousemove", event => {
        if (!drawing) {
            return;
        } else { 
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    });
    
    canvas.addEventListener("mouseout", () => {
        drawing = false;
    });

    canvas.addEventListener("mouseup", () => {
        drawing = false;
        sign.value = canvas.toDataURL();
    });
})();