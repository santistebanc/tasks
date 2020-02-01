import registerTask from "./task";

const fib = n => {
  if (n < 2) return n;
  return fib(n - 2) + fib(n - 1);
};

const longCalculation = n =>
  new Promise(resolve => {
    setTimeout(function() {
      clearInterval(this);
      resolve(fib(n));
    }, 0);
  });

async function fakeCalculation({ reportProgress, finish, isCancelled }) {
  for (let i = 1; i <= 1000 && !isCancelled(); i++) {
    await longCalculation(30);
    if (i % 10 === 0) {
      reportProgress(i / 10);
    }
  }
  finish();
}

registerTask(fakeCalculation);
