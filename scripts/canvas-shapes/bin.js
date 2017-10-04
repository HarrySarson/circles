
import ellipse from './ellipse.js';
import angles from '../angles.js';

const sqr = function(x) {
  return x * x;
};

export default function(ctx, x, y, dx, dy, sectors, rotation) {


  const xm = x + dx / 2
  ,     ym1 = y + dy / 8
  ,     ym2 = y + dy * (1 / 8 + 1 / 12)
  ,     ym3 = y + dy * 7 / 8
  ,     topradiusX = dx / 2
  ,     botradiusX = topradiusX * 0.87
  ,     radiusY = dy / 8
  ;

  ctx.save();

  ellipse(ctx, xm, ym1, topradiusX, radiusY, 0, 0, Math.PI * 2, false);



  ellipse(ctx, xm, ym2, topradiusX, radiusY, 0, 0, Math.PI, false);
  ellipse(ctx, xm, ym3, botradiusX, radiusY, 0, 0, Math.PI, false);

  ctx.beginPath();
  ctx.moveTo(x, ym1);
  ctx.lineTo(x, ym2);

  ctx.moveTo(x + dx, ym1);
  ctx.lineTo(x + dx, ym2);

  ctx.moveTo(
    x + topradiusX - botradiusX,
    ym2 + Math.sqrt(sqr(radiusY) * (1 - sqr(botradiusX / topradiusX)))
  );
  ctx.lineTo(
    x + topradiusX - botradiusX,
    ym3
  );

  ctx.moveTo(
    x + topradiusX + botradiusX,
    ym2 + Math.sqrt(sqr(radiusY) * (1 - sqr(botradiusX / topradiusX)))
  );
  ctx.lineTo(
    x + topradiusX + botradiusX,
    ym3
  );


  rotation = rotation || 0;
  sectors = sectors || 0;

  const sectorAngle = Math.PI * 2 / sectors;

  for (let i = 0; i < sectors; ++i) {

    const angle = sectorAngle * i - rotation;

    if (angles.clockwisebetween(angle, -Math.PI * 0.475, Math.PI * 0.475)) {

      const offsetx = botradiusX * Math.sin(angle)
      ,     topy = Math.sqrt(sqr(radiusY) * (1 - sqr(offsetx / topradiusX)))
      ,     boty = Math.sqrt(sqr(radiusY) * (1 - sqr(offsetx / botradiusX)))
      ;

      ctx.moveTo(x + topradiusX + offsetx, ym2 + topy + 1);
      ctx.lineTo(x + topradiusX + offsetx, ym3 - dy * 0.1 + boty);
    }
  }

  ctx.stroke();
  ctx.restore();
};
