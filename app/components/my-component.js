/* eslint-disable require-yield */
import Component from '@glimmer/component';
import { task, timeout, waitForProperty } from 'ember-concurrency';

export default class EventsExampleComponent extends Component {
  @task
  *changeStore() {
    this.foo.perform();
    this.bar.perform();
  }

  @task *foo() {
    yield timeout(1000);
    return 'all good';
  }

  @task *bar() {
    let value = yield waitForProperty(this, 'foo.isIdle');
    console.log(value);
  }
}
