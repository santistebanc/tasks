import registerTask from "./task";

console.log("worker spawned");

const longCalculation = () =>
  new Promise(resolve => {
    setTimeout(function() {
      clearInterval(this);
      resolve(42);
    }, 100 + Math.round(Math.random() * 10000));
  });

async function fakeCalculation({ reportProgress, finish }) {
  for (let i = 1; i <= 5; i++) {
    await longCalculation();
    reportProgress(i * 20);
  }
  finish();
}

registerTask(fakeCalculation);
