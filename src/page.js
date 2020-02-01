import { h, render, Component } from "preact";
import { Worker, Pool } from ".";
import "uikit/dist/css/uikit.min.css";
/** @jsx h */

const List = ({ tasks }) => (
  <ul class="uk-list uk-list-divider">
    {[...tasks]
      .filter(task => task.status !== "cancelled" && task.status !== "finished")
      .map(task => (
        <li>
          <div class="uk-flex uk-card uk-card-default">
            <b class="uk-margin-left uk-margin-top">{task.name}</b>
            <p class="uk-margin-left">{task.status}</p>
            <p class="uk-margin-left">{task.progress}</p>
            <div class="uk-button-group uk-flex-right">
              <button
                class="uk-button uk-margin-left"
                onClick={() => {
                  task.start();
                }}
              >
                start
              </button>
              <button
                class="uk-button"
                onClick={() => {
                  task.cancelIfNotRunning();
                }}
              >
                cancel
              </button>
              <button
                class="uk-button"
                onClick={() => {
                  task.forceCancel();
                }}
              >
                forceCancel
              </button>
            </div>
          </div>
        </li>
      ))}
  </ul>
);

class App extends Component {
  state = { tasks: new Set() };
  componentDidMount() {
    this.pool = new Pool({
      worker: new Worker("./example")
    });
    this.pool.getObservable().subscribe(tasks => {
      this.setState({ tasks });
    });
  }
  createTask() {
    this.pool.createTask("task-" + Math.round(Math.random() * 100));
  }
  render({}, { tasks }) {
    return (
      <div>
        <h1 class="uk-heading-divider uk-flex uk-flex-center">Tasks.js</h1>
        <button
          class="uk-button uk-button-primary"
          onClick={() => {
            this.createTask();
          }}
        >
          Add Task
        </button>
        <button
          class="uk-button"
          onClick={() => {
            this.pool.terminate();
          }}
        >
          terminate pool
        </button>
        <button
          class="uk-button"
          onClick={() => {
            this.pool.cancelAllNotRunning();
          }}
        >
          cancel all not running
        </button>
        <List tasks={tasks} />
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
