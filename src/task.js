import { Observable } from "observable-fns";
import { expose } from "threads";

function registerTask(func) {
  return expose(
    () =>
      new Observable(async observer => {
        observer.next({ progress: 0 });
        func({
          reportProgress: p => observer.next({ progress: p }),
          fail: err => {
            throw Error(err);
          },
          finish: () => observer.complete(),
          cancel: () => observer.complete(true)
        });
      })
  );
}

export default registerTask;
