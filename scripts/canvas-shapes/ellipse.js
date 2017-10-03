/*
    The CanvasRenderingContext2D.ellipse() method of the Canvas 2D API adds an ellipse to the path which is centered at (x, y) position with the radii radiusX and radiusY starting at startAngle and ending at endAngle going in the given direction by anticlockwise (defaulting to clockwise).


    Parameters

    x
        The x axis of the coordinate for the ellipse's center.
    y
        The y axis of the coordinate for the ellipse's center.
    radiusX
        The ellipse's major-axis radius.
    radiusY
        The ellipse's minor-axis radius.
    rotation
        The rotation for this ellipse, expressed in radians.
    startAngle
        The starting point, measured from the x axis, from which it will be drawn, expressed in radians.
    endAngle
        The end ellipse's angle to which it will be drawn, expressed in radians.
    anticlockwise Optional
        An optional Boolean which, if true, draws the ellipse anticlockwise (counter-clockwise), otherwise in a clockwise direction. 
*/


module.exports = function(ctx, x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    ctx.save();
    ctx.beginPath();

    if (ctx.ellipse)
        ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    else {
        var kappa = 0.5522848,
            ox = radiusX * kappa, // control point offset horizontal
            oy = radiusY * kappa, // control point offset vertical
            xb = x - radiusX, // x-begin
            yb = y - radiusY, // y-begin
            xe = x + radiusX, // x-end
            ye = y + radiusY, // y-end
            sin = Math.sin(rotation),
            cos = Math.cos(rotation);

        /*
        
            [ cos, -sin, x + y*sin + x*cos ]    
            [ sin,  cos, y + x*sin + y*cos ]
            [ 0     0    1                 ]
            
            */

        ctx.setTransform(
            cos, sin, -sin, cos,

            x + y * sin - x * cos, y - x * sin - y * cos
        );

        // create clipping region using circle with radius = major axis
        ctx.moveTo(x, y);
        ctx.arc(x, y, Math.max(radiusX, radiusY) * 1.1, startAngle, endAngle, anticlockwise);

        ctx.clip();


        // draw ellipse

        ctx.beginPath();
        ctx.moveTo(xb, y);

        ctx.bezierCurveTo(
            xb, y - oy,
            x - ox, yb,
            x, yb);

        ctx.bezierCurveTo(
            x + ox, yb,
            xe, y - oy,
            xe, y);


        ctx.bezierCurveTo(
            xe, y + oy,
            x + ox, ye,
            x, ye);

        ctx.bezierCurveTo(
            x - ox, ye,
            xb, y + oy,
            xb, y);

    }
    ctx.stroke();
    ctx.fill();

    ctx.restore();
}