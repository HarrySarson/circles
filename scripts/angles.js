export function deg(rad, sf) {
  sf = (sf === undefined) ? 3 : sf;
  return Number((rad / Math.PI * 180).toPrecision(sf));
}

export function restrict(value, min, max) {
  if (min > max) {
    const c = min;
    min = max;
    max = c;
  }

  // scale min and max to zero and max - min
  value -= min;
  max -= min;

  let quot = value / max;

  if (quot < 0)
    quot -= 1;

  // adjust into range of zero and max-min and then scale back to range min and max
  return value - (~~quot) * max + min;
}

export function clockwisebetween(angle, start, end) {
  angle = exports.restrict(angle, 0, 2 * Math.PI);
  start = exports.restrict(start, 0, 2 * Math.PI);
  end = exports.restrict(end, 0, 2 * Math.PI);

  const r = (start < end) ?
    (start < angle && angle < end) :
    (start < angle || angle < end);

  return r;
}
