import { transform } from '@babel/core';
import { transformMakeStyles } from './transformMakeStyles';

// language=TypeScript
const cases = {
  basic: `
    import { makeStyles } from '@material-ui/core';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    });
  `,
  'imported from core/styles': `
    import { makeStyles } from '@material-ui/core/styles';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    });
  `,
  'imported from core/styles/makeStyles': `
    import { makeStyles } from '@material-ui/core/styles/makeStyles';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    });
  `,
  'imported from styles': `
    import { makeStyles } from '@material-ui/styles';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    });
  `,
  'with renamed import': `
    import { makeStyles as ms } from '@material-ui/core';
    const useStyles = ms({
      foo: { color: 'red' }
    });
  `,
  // Why? Idk, just covering bases
  'with multiple imports': `
    import { makeStyles } from '@material-ui/core/styles';
    import { makeStyles as ms } from '@material-ui/core';
    const useStyles = ms({
      foo: { color: 'red' }
    });
    const useStyles2 = makeStyles({
      foo: { color: 'red' }
    });
  `,
  'with options already defined': `
    import { makeStyles } from '@material-ui/core';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    }, {
      flip: true,
    });
  `,
  'with prefix already defined': `
    import { makeStyles } from '@material-ui/core';
    const useStyles = makeStyles({
      foo: { color: 'red' }
    }, {
      classNamePrefix: 'FooBar',
    });
  `,
};
it.each(Object.entries(cases))(`works %s`, (name, src) => {
  const result = transform(src, {
    plugins: [transformMakeStyles],
    filename: 'MyButton.tsx',
  });
  expect(result?.code).toMatchSnapshot();
});
