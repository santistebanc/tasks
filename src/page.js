import { h, render, Component } from "preact";
import { Pool } from ".";
import "uikit/dist/css/uikit.min.css";
/** @jsx h */

// class Task extends Component {
//   componentDidMount() {
//     this.unsubscribe = this.props.task.observable.subscribe({
//       next: info => {
//         this.setState({ ...info });
//       }
//     });
//   }
//   componentWillUnmount() {
//     this.unsubscribe();
//   }
//   render({}, { status, name, start }) {
//     return (
//       <div class="uk-card uk-card-default uk-card-body uk-width-1-2@m">
//         <h3 class="uk-card-title">{name}</h3>
//         <p>{status}</p>
//         <p>{progress}</p>
//         <button
//           class="uk-button"
//           onClick={() => {
//             start();
//           }}
//         >
//           start
//         </button>
//       </div>
//     );
//   }
// }

const List = ({ tasks }) => (
  <ul class="uk-list uk-list-divider">
    {tasks.map(task => (
      <li>
        <div class="uk-card uk-card-default uk-card-body uk-width-1-2@m">
          <h3 class="uk-card-title">{task.name}</h3>
          <p>{task.status}</p>
          <button
            class="uk-button"
            onClick={() => {
              task.start();
            }}
          >
            start
          </button>
        </div>
      </li>
    ))}
  </ul>
);

class App extends Component {
  state = { tasks: [], pool: new Pool() };
  render({}, { pool, tasks }) {
    return (
      <div>
        <h1 class="uk-heading-divider uk-flex uk-flex-center">Tasks.js</h1>
        <button
          class="uk-button uk-button-primary"
          onClick={() => {
            pool.createTask("myname");
            this.setState({ tasks: [...pool.tasks] });
          }}
        >
          Add Task
        </button>
        <List tasks={tasks} />
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));

async function init() {
  const pool = new Pool();
  pool.createTask("Ana").start();
  pool.createTask("Ben").start();
  pool.createTask("Carlos").start();
  const task1 = pool.createTask("Dom").start();
  pool
    .createTask("shit")
    .start()
    .cancel();

  console.log(pool.tasks);
  setTimeout(() => pool.cancelAll(), 5000);
  setTimeout(() => pool.createTask("Juan").start(), 10000);
}
