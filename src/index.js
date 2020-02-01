import { spawn, Pool as ThreadPool, Worker as ThreadWorker } from "threads";
import { Subject } from "threads/observable";
import { Observable } from "observable-fns";
export class Pool {
  tasks = new Set();
  constructor(options) {
    this.options = options;
    this.subject = new Subject();
    this.reset(options);
  }
  getObservable() {
    return Observable.from(this.subject);
  }
  async reset({ worker, concurrency, maxQueuedJobs, name, size } = {}) {
    this.pool = ThreadPool(() => spawn(worker), {
      concurrency,
      maxQueuedJobs,
      name,
      size
    });
    console.log("reseted", this.pool);
    this.subject.next(this.tasks);
    return this;
  }
  createTask(name) {
    const task = new Task(this.pool, name);
    this.tasks.add(task);
    this.subject.next(this.tasks);
    task.getObservable().subscribe(_ => this.subject.next(this.tasks));
    return task;
  }
  cancelAllNotRunning() {
    this.tasks.forEach(task => {
      task.cancelIfNotRunning();
    });
    return this;
  }
  cancelAll() {
    this.tasks.forEach(task => {
      task.forceCancel();
    });
    return this;
  }
  terminate(force) {
    this.tasks.forEach(task => {
      task.forceCancel();
    });
    this.tasks.clear();
    this.subject.next(this.tasks);
    this.pool.terminate(force).then(_ => {
      console.log("pool terminated");
      this.reset(this.options);
    });
    return this;
  }
}

class Task {
  freeWorker = () => {};
  constructor(pool, name) {
    this.pool = pool;
    this.name = name;
    this.progress = 0;
    this.status = "unscheduled";
    this.subject = new Subject();
  }
  getObservable() {
    return Observable.from(this.subject);
  }
  async start() {
    if (!this.worker) {
      try {
        this.status = "queued";
        this.job = this.pool.queue(async worker => {
          this.wasCancelled = false;
          this.status = "running";
          this.worker = worker;
          this.idInWorker = await worker.startNewTask();
          this.subject.next(this.status);
          worker.getObservable(this.idInWorker).subscribe({
            next: ({ progress, cancelled }) => {
              if (typeof progress !== "undefined") {
                this.progress = progress;
                this.subject.next(this.status);
              } else if (cancelled) {
                this.wasCancelled = true;
              }
            },
            error: err => {
              console.log(`Finished with error: ${err}`, this.name);
              this.freeWorker();
              this.status = "failed";
              this.subject.next(this.status);
            },
            complete: () => {
              if (this.wasCancelled) {
                console.log("Cancelled", this.name);
                this.status = "cancelled";
              } else {
                console.log("Finished", this.name);
                this.status = "finished";
              }
              this.freeWorker();
              this.subject.next(this.status);
            }
          });
          this.subject.next(this.status);
          await new Promise(resolve => (this.freeWorker = resolve));
        });
      } catch (err) {
        console.error(err);
        this.status = "failed";
        this.subject.next(this.status);
        return this;
      }
    }
    return this;
  }
  cancelIfNotRunning() {
    if (this.job && !this.worker) {
      this.job.cancel();
      this.status = "cancelled";
      this.subject.next(this.status);
    }
    return this;
  }
  forceCancel() {
    if (this.worker) {
      this.worker.cancelTask(this.idInWorker);
    } else if (this.job) {
      this.freeWorker();
      this.job.cancel();
      this.status = "cancelled";
      this.subject.next(this.status);
    }
    return this;
  }
  forceFail(err) {
    this.worker.failTask(this.idInWorker, err);
    return this;
  }
  forceFinish() {
    this.worker.finish();
    return this;
  }
}

export const Worker = ThreadWorker;
