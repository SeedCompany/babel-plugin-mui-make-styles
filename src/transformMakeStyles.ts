import { NodePath } from '@babel/traverse';
import {
  CallExpression,
  ImportSpecifier,
  isIdentifier,
  isImportDeclaration,
  isProperty,
  ObjectExpression,
  Program,
} from '@babel/types';
import { basename, extname } from 'path';
import { BabelPlugin } from './util';

interface State {
  // List of imported names of makeStyles.
  // Should typically just be `['makeStyles']`
  names: string[];
}

/**
 * A plugin for Material UI's makeStyles.
 *
 * This sets the classNamePrefix option based on the filename if it has not
 * been set. Which means instead of all the css classes being prefixed with
 * "makeStyles-" we see the component name (by convention).
 */
export const transformMakeStyles: BabelPlugin<State> = ({ types }) => ({
  name: 'mui-styles',
  visitor: {
    Program: (path: NodePath<Program>, state) => {
      // Reset list on new file
      state.names = [];
    },
    ImportSpecifier: (path: NodePath<ImportSpecifier>, state) => {
      // Add name to list if it matches
      if (
        path.node.imported.name === 'makeStyles' &&
        isImportDeclaration(path.parent) &&
        path.parent.source.value.startsWith('@material-ui/')
      ) {
        state.names.push(path.node.local.name);
      }
    },
    CallExpression: (path: NodePath<CallExpression>, state) => {
      // Continue if we are a call to one of our makeStyle functions
      if (
        !isIdentifier(path.node.callee) ||
        !state.names.includes(path.node.callee.name)
      ) {
        return;
      }

      // Find options argument or create new it
      const options =
        (path.node.arguments[1] as ObjectExpression) ||
        types.objectExpression([]);

      // Continue if options doesn't have a classNamePrefix
      if (options.properties.some(isPropertyName('classNamePrefix'))) {
        return;
      }

      // Determine prefix based on filename
      const filePath: string = path.hub.file.opts.filename;
      const classNamePrefix = basename(filePath, extname(filePath));

      // Add it to the options object
      options.properties.unshift(
        types.objectProperty(
          types.identifier('classNamePrefix'),
          types.stringLiteral(classNamePrefix)
        )
      );

      // Replace function call with same one with options argument added.
      path.replaceWith(
        types.callExpression(path.node.callee, [
          path.node.arguments[0],
          options,
        ])
      );

      // Don't traverse into newly replaced path (infinite loop)
      path.skip();
    },
  },
});

const isPropertyName = (name: string) => (prop: { type: unknown }) =>
  isProperty(prop) && isIdentifier(prop.key) && prop.key.name === name;
