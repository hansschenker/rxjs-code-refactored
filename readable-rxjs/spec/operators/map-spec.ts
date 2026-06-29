import { expect } from 'chai';
import { of } from 'rxjs';
import { map } from '../../src/operators/map';

describe('readable map', () => {
  it('emits projected next values', () => {
    const values: number[] = [];

    of(1, 2, 3)
      .pipe(map((value) => value * 10))
      .subscribe((value) => values.push(value));

    expect(values).to.deep.equal([10, 20, 30]);
  });

  it('sends projection errors to the error handler', (done) => {
    const error = new Error('projection failed');

    of(1)
      .pipe(
        map(() => {
          throw error;
        })
      )
      .subscribe({
        next: () => done(new Error('next should not be called')),
        error: (actualError) => {
          expect(actualError).to.equal(error);
          done();
        },
        complete: () => done(new Error('complete should not be called')),
      });
  });

  it('forwards completion after mapped values', () => {
    const notifications: string[] = [];

    of(1, 2)
      .pipe(map((value) => value + 1))
      .subscribe({
        next: (value) => notifications.push(`next:${value}`),
        complete: () => notifications.push('complete'),
      });

    expect(notifications).to.deep.equal(['next:2', 'next:3', 'complete']);
  });

  it('passes a zero-based index to the projection', () => {
    const values: string[] = [];

    of('a', 'b', 'c')
      .pipe(map((value, index) => `${index}:${value}`))
      .subscribe((value) => values.push(value));

    expect(values).to.deep.equal(['0:a', '1:b', '2:c']);
  });
});
