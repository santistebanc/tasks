import { Observable } from "observable-fns";
import { expose } from "threads";
import { Subject } from "threads/observable";

class WorkerTask {
  constructor(func) {
    this.func = func;
    this.subject = new Subject();
    this.isCancelled = false;
  }
  start() {
    this.func({
      reportProgress: p => this.subject.next({ progress: p }),
      fail: () => this.fail(),
      finish: () => this.finish(),
      cancel: () => this.cancel(),
      isCancelled: () => this.isCancelled
    }).then(_ => {
      this.subject.complete();
    });
    return this;
  }
  getObservable() {
    return Observable.from(this.subject);
  }
  cancel() {
    this.isCancelled = true;
    this.subject.next({ cancelled: true }), this.subject.complete(true);
  }
  fail(err) {
    this.isCancelled = true;
    this.subject.error(err);
  }
  finish() {
    this.isCancelled = true;
    this.subject.complete();
  }
}

function registerTask(func) {
  let tasks = [];
  const worker = {
    startNewTask() {
      const newTask = new WorkerTask(func);
      tasks.push(newTask);
      newTask.start();
      return tasks.length - 1;
    },
    cancelTask(id) {
      tasks[id].cancel();
    },
    failTask(id, err) {
      tasks[id].fail(err);
    },
    finishTask(id) {
      tasks[id].finish();
    },
    getObservable(id) {
      return tasks[id].getObservable();
    }
  };
  expose(worker);
}

export default registerTask;
