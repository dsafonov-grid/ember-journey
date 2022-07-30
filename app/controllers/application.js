/* eslint-disable require-yield */
/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import {action} from '@ember/object';
import { task, timeout, all, race, enqueueTaskGroup } from 'ember-concurrency';
const methods = { all, race };

export default class JoiningTasksController extends Controller {
  childTasks = null;
  colors = ['#ff8888', '#88ff88', '#8888ff'];
  @tracked status = 'Waiting...';

  @enqueueTaskGroup({ maxConcurrency: 1 }) chores;

  @task({ group: 'chores' })
  *mowLawn() {
    yield timeout(2000);
    this.status = `${this.status} Completed Lawn`;
  }

  @task({ group: 'chores' })
  *doDishes() {
    yield timeout(2000);
    this.status = `${this.status} Completed Dishes`;
  }

  @action
  doTasks() {
    this.doDishes.perform();
    this.mowLawn.perform();
  }
  @task({ restartable: true })
  *parent(methodName) {
    let allOrRace = methods[methodName];
    let childTasks = [];

    // for (let id = 0; id < 5; ++id) {
    childTasks.push(this.doDishes.perform());
    childTasks.push(this.mowLawn.perform());
    // }

    this.set('status', 'Waiting for child tasks to complete...');
    let words = yield allOrRace(childTasks);
    this.set('status', `Done: ${words.join(', ')}`);
  }

  @task({ enqueue: true, maxConcurrency: 1 })
  child = {
    percent: 0,
    id: null,

    *perform(id) {
      yield timeout(1000);
      console.log(`Completed ${id}`);
      return `Completed ${id}`;
    },
  };
}
