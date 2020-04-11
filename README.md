# Babel plugin for [Material UI](https://material-ui.com/) v4's `makeStyles`

This plugin defaults the `classNamePrefix` option of `makeStyles` to the current filename.

This makes debugging easier. Instead of seeing `makeStyles-*` classes in DOM you'll see a prefix that probably matches the component name (by convention).

## Example
```tsx
# MyComponent.tsx

const useStyles = makeStyles({
  root: { color: 'red' }
});

export const MyComponent = () => {
  const classes = useStyles();
  return <div className={classes.root} />; 
};
```
DOM:
```html
<div class="MyComponent-root-1"></div>
```
instead of:
```html
<div class="makeStyles-root-1"></div>
```
