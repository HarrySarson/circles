import diff from './differential2ndOrder.js';

export default exports = function(smoother) {
  const f = function(oldValue, newValue, deltaT) {
    const dist = newValue - oldValue;

    const eqt = diff({
      a: smoother.a,
      b: smoother.b,
      c: smoother.c,
      x0: dist,
      prime0: f.v
    });
    f.v = eqt.grad(deltaT);
    return newValue - eqt.eval(deltaT);
  };
  f.v = 0;
  return f;
};

const under_eval = function(t, expo, trig, x0, prime0) {

  const A = x0
  ,     B = (prime0 - A * expo) / trig
  ;

  return Math.exp(expo * t) * (A * Math.cos(trig * t) + B * Math.sin(trig * t));
};
const under_grad = function(t, expo, trig, x0, prime0) {

  const A = x0
  ,     B = (prime0 - A * expo) / trig;

  return Math.exp(expo * t) * ((A * expo + B * trig) * Math.cos(trig * t) + (B * expo - A * trig) * Math.sin(trig * t))
};

export function underdamped(expoCoeff, trigCoeff) {
  const impl = function() {
    let dx = 0;
    return function(oldValue, newValue, deltaT) {
      const x0 = newValue - oldValue;
      const dx0 = dx;

      dx = under_grad(deltaT, -expoCoeff, trigCoeff, x0, dx0);
      return newValue - under_eval(deltaT, -expoCoeff, trigCoeff, x0, dx0);
    };
  };
  const f = impl();

  const copies = {};
  f.get = function(id) {
    if (copies[id]) {
      return copies[id];
    } else {
      return copies[id] = impl();
    }
  };

  return f;
}
