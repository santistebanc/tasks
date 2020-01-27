import { spawn, Pool as ThreadPool, Worker } from "threads";

export class Pool {
  tasks = new Set();
  constructor(options) {
    this.options = options;
    this.reset(options);
  }
  reset(options) {
    this.pool = ThreadPool(() => spawn(new Worker("./example")), options);
    return this;
  }
  createTask(name) {
    const task = new Task(this.pool, name);
    this.tasks.add(task);
    return task;
  }
  cancelAllQueued() {
    this.tasks.forEach(task => {
      task.cancel();
    });
    return this;
  }
  cancelAll(force) {
    this.pool.terminate(force);
    this.tasks.forEach(task => {
      task.status = "cancelled";
    });
    console.log("pool terminated");
    this.reset(this.options);
    return this;
  }
}

export class Task {
  constructor(pool, name) {
    this.pool = pool;
    this.status = "unscheduled";
    this.progress = 0;
    this.name = name;
  }
  start() {
    this.job = this.pool.queue(worker => {
      this.status = "queued";
      this.observable = worker();
      this.observable.subscribe({
        next: info => {
          this.progress = info.progress;
          this.status = "running";
          console.log("progress of ", this.name, " is: ", info.progress);
        },
        error: err => {
          this.fail(err);
        },
        complete: () => {
          this.finish();
        }
      });
    });
    return this;
  }
  cancel() {
    if (this.status !== "running" && this.job) {
      this.status = "cancelled";
      this.job.cancel();
      return true;
    }
    return false;
  }
  fail(err) {
    this.status = "failed";
    console.log(`Finished with error: ${err}`, this.name);
    return this;
  }
  finish() {
    this.status = "finished";
    console.log("Finished", this.name);
    return this;
  }
}
